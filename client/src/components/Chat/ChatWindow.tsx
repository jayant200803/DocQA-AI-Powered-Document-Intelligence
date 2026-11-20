import { useState, useEffect, useRef, useCallback } from 'react';
import GlassFolder from '@/components/ui/glass-folder-cards';
import MessageBubble from './MessageBubble';
import StreamingMessage from './StreamingMessage';
import ChatInput from './ChatInput';
import PipelineTrace from './PipelineTrace';
import { useWebSocket } from '../../hooks/useWebSocket';
import { chatAPI } from '../../services/api';
import { Message, Source, WsMessage, PipelineStage } from '../../types';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

const genId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
};

interface ChatWindowProps {
  selectedDocIds: string[];
  sessionId: string;
  onSessionChange: (id: string) => void;
}

const ChatWindow = ({ selectedDocIds, sessionId, onSessionChange }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingSources, setStreamingSources] = useState<Source[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [pipelineMode, setPipelineMode] = useState('');
  const pipelineRef = useRef<PipelineStage[]>([]);
  const pipelineModeRef = useRef('');
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastQuestionRef = useRef('');
  const suggestionsFetchedRef = useRef(false);
  const pendingLocalSessionRef = useRef<string | null>(null);

  const ws = useWebSocket();

  useEffect(() => {
    ws.connect();
    return () => ws.disconnect();
  }, []);

  useEffect(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
      if (sessionId !== pendingLocalSessionRef.current) {
        loadSession(sessionId);
      }
      pendingLocalSessionRef.current = null;
    } else {
      setCurrentSessionId('');
      setMessages([]);
    }
  }, [sessionId]);

  const fetchSuggestions = async (question: string, answer: string): Promise<string[]> => {
    try {
      const res = await fetch(`${AI_URL}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.suggestions as string[]) || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    ws.on('stage', (msg: WsMessage) => {
      const stage = msg.data as PipelineStage;
      pipelineRef.current = [...pipelineRef.current, stage];
      setPipelineStages((prev) => [...prev, stage]);
    });

    ws.on('token', (msg: WsMessage) => {
      setStreamingContent((prev) => prev + (msg.data as string));
    });

    ws.on('sources', (msg: WsMessage) => {
      setStreamingSources((msg.data as Source[]) || []);
      if (msg.mode) { setPipelineMode(msg.mode); pipelineModeRef.current = msg.mode; }
      if (msg.sessionId) {
        setCurrentSessionId(msg.sessionId);
        onSessionChange(msg.sessionId);
      }
    });

    ws.on('done', () => {
      setStreamingContent((content) => {
        if (content) {
          const question = lastQuestionRef.current;
          const answer = content;
          setMessages((prev) => {
            const newMsg: Message = {
              role: 'assistant',
              content: answer,
              sources: streamingSources,
              timestamp: new Date().toISOString(),
              pipeline: pipelineRef.current.length ? [...pipelineRef.current] : undefined,
              mode: pipelineModeRef.current || undefined,
            };
            const updated = [...prev, newMsg];
            const newMsgIdx = updated.length - 1;
            if (question && answer && !suggestionsFetchedRef.current) {
              suggestionsFetchedRef.current = true;
              fetchSuggestions(question, answer).then((suggestions) => {
                if (suggestions.length) {
                  setMessages((msgs) =>
                    msgs.map((m, i) => (i === newMsgIdx ? { ...m, suggestions } : m))
                  );
                }
              });
            }
            return updated;
          });
        }
        return '';
      });
      setStreamingSources([]);
      setPipelineStages([]);
      setPipelineMode('');
      pipelineRef.current = [];
      pipelineModeRef.current = '';
      ws.stopStreaming();
    });

    ws.on('error', (msg: WsMessage) => {
      setStreamingContent('');
      setStreamingSources([]);
      setPipelineStages([]);
      setPipelineMode('');
      pipelineRef.current = [];
      pipelineModeRef.current = '';
      ws.stopStreaming();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${msg.data as string}`,
          sources: [],
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      ws.off('stage');
      ws.off('token');
      ws.off('sources');
      ws.off('done');
      ws.off('error');
    };
  }, [streamingSources]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const loadSession = async (sid: string) => {
    try {
      const { data } = await chatAPI.getSession(sid);
      setMessages((data.chat?.messages as Message[]) || []);
    } catch (err: unknown) {
      setMessages([]);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setCurrentSessionId('');
        onSessionChange('');
      }
    }
  };

  const handleSend = useCallback(
    (question: string) => {
      if (!selectedDocIds.length) return;

      lastQuestionRef.current = question;
      suggestionsFetchedRef.current = false;
      setPipelineStages([]);
      setPipelineMode('');
      pipelineRef.current = [];
      pipelineModeRef.current = '';

      const sid = currentSessionId || genId();
      if (!currentSessionId) {
        pendingLocalSessionRef.current = sid;
        setCurrentSessionId(sid);
        onSessionChange(sid);
      }

      setMessages((prev) => [
        ...prev.map((m) => ({ ...m, suggestions: undefined })),
        { role: 'user', content: question, sources: [], timestamp: new Date().toISOString() },
      ]);

      ws.sendMessage(question, selectedDocIds, sid);
    },
    [selectedDocIds, currentSessionId, ws, onSessionChange]
  );

  const handleRegenerate = useCallback(() => {
    if (!lastQuestionRef.current || ws.isStreaming) return;
    setMessages((prev) => {
      const lastAssistantIdx = [...prev].reverse().findIndex((m) => m.role === 'assistant');
      if (lastAssistantIdx === -1) return prev;
      return prev.slice(0, prev.length - 1 - lastAssistantIdx);
    });
    const sid = currentSessionId || genId();
    ws.sendMessage(lastQuestionRef.current, selectedDocIds, sid);
  }, [currentSessionId, selectedDocIds, ws]);

  const handleSuggestionClick = useCallback(
    (q: string) => handleSend(q),
    [handleSend]
  );

  const lastAssistantIdx = messages.reduce(
    (acc, m, i) => (m.role === 'assistant' ? i : acc),
    -1
  );

  const noDocsSelected = selectedDocIds.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-chat">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !streamingContent && (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center">
              <GlassFolder
                tone="dark"
                art="glacier"
                width={288}
                label="Your documents"
                meta="ask anything"
                action="none"
                files={[
                  { name: 'Report.pdf', meta: 'PDF', art: 'glacier' },
                  { name: 'Notes.md', meta: 'TXT', art: 'aurora' },
                  { name: 'Contract.pdf', meta: 'PDF' },
                ]}
              />
              <h2 className="mt-2 text-xl font-semibold text-ink mb-2">Ask your documents</h2>
              <p className="text-sm text-muted max-w-sm leading-relaxed">
                {noDocsSelected
                  ? 'Select documents from the sidebar, then ask questions about them.'
                  : 'Type a question below to get AI-powered answers with source citations.'}
              </p>
              {!noDocsSelected && (
                <div className="mt-6 flex gap-2 flex-wrap justify-center">
                  {['What is this document about?', 'Summarize the key points', 'What are the main conclusions?'].map((q) => (
                    <button key={q} onClick={() => handleSend(q)} className="chip">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onRegenerate={i === lastAssistantIdx && !ws.isStreaming ? handleRegenerate : undefined}
              onSuggestionClick={handleSuggestionClick}
            />
          ))}

          {ws.isStreaming && pipelineStages.length > 0 && (
            <div className="flex justify-start">
              <PipelineTrace stages={pipelineStages} mode={pipelineMode} done={!!streamingContent} />
            </div>
          )}

          {streamingContent && <StreamingMessage content={streamingContent} />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSend={handleSend}
        disabled={noDocsSelected || ws.isStreaming || !ws.isConnected}
        placeholder={
          noDocsSelected
            ? 'Select documents from the sidebar first...'
            : !ws.isConnected
            ? 'Connecting...'
            : ws.isStreaming
            ? 'Waiting for response...'
            : 'Ask a question about your documents...'
        }
      />
    </div>
  );
};

export default ChatWindow;
