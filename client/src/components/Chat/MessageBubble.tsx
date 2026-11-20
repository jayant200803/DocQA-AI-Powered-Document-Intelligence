import { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { Message, Source } from '../../types';
import VoiceButton from './VoiceButton';
import PipelineTrace from './PipelineTrace';

interface SourceCardProps {
  source: Source;
  index: number;
}

const SourceCard = ({ source, index }: SourceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={`text-left w-full rounded-lg p-2.5 border transition-colors duration-150 ${
        expanded ? 'border-accent bg-[rgba(59,130,246,0.06)]' : 'border-line bg-surface-2 hover:border-line-strong'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-accent text-white rounded-md text-[10px] font-semibold shrink-0">
            {index}
          </span>
          <FileText className="w-3.5 h-3.5 text-faint shrink-0" />
          <span className="text-xs font-medium text-ink truncate">{source.fileName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-accent font-mono px-1.5 py-0.5 rounded bg-[rgba(59,130,246,0.1)]">
            {(source.relevanceScore * 100).toFixed(0)}%
          </span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-faint" />
            : <ChevronDown className="w-3.5 h-3.5 text-faint" />
          }
        </div>
      </div>
      {expanded && (
        <p className="mt-2 pt-2 text-xs text-muted leading-relaxed border-t border-line">
          {source.chunkText}
        </p>
      )}
    </button>
  );
};

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onSuggestionClick?: (q: string) => void;
}

const MessageBubble = ({ message, onRegenerate, onSuggestionClick }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const sources = message.sources || [];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex gap-3 msg-enter ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 card">
          <Bot className="w-4 h-4 text-accent" />
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        {!isUser && message.pipeline && (
          <div className="mb-2">
            <PipelineTrace stages={message.pipeline} mode={message.mode || ''} done collapsible />
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-surface border border-line text-ink rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>

        {/* Action row: voice + copy + regenerate */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <VoiceButton text={message.content} />
            <button onClick={handleCopy} title="Copy response" className="chip gap-1.5">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onRegenerate && (
              <button onClick={onRegenerate} title="Regenerate response" className="chip gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Sources */}
        {!isUser && sources.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="text-[10px] font-semibold text-faint px-1 uppercase tracking-widest">Sources</p>
            {sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i + 1} />
            ))}
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-faint px-1 uppercase tracking-widest">Follow-up</p>
            <div className="flex flex-col gap-1.5">
              {message.suggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick?.(q)}
                  className="btn-secondary w-full justify-start text-left text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 card">
          <User className="w-4 h-4 text-muted" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
