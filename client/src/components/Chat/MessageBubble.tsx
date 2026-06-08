import { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { Message, Source } from '../../types';
import VoiceButton from './VoiceButton';

interface SourceCardProps {
  source: Source;
  index: number;
}

const SourceCard = ({ source, index }: SourceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-left w-full rounded-xl p-2.5 transition-all duration-150"
      style={{
        background: expanded ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
        border: expanded ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.07)',
      }}
      onMouseEnter={e => {
        if (!expanded) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={e => {
        if (!expanded) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-500 text-white rounded-md text-[10px] font-bold shrink-0">
            {index}
          </span>
          <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-xs font-medium text-slate-300 truncate">{source.fileName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-brand-400 font-semibold font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            {(source.relevanceScore * 100).toFixed(0)}%
          </span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          }
        </div>
      </div>
      {expanded && (
        <p className="mt-2 text-xs text-slate-500 leading-relaxed pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}>
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isUser ? 'text-white rounded-br-md' : 'text-slate-200 rounded-bl-md'}`}
          style={isUser
            ? { background: '#6366f1', boxShadow: '0 0 0 1px rgba(99,102,241,0.4)' }
            : { background: '#18181d', border: '1px solid rgba(255,255,255,0.07)' }
          }
        >
          {message.content}
        </div>

        {/* Action row: voice + copy + regenerate */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <VoiceButton text={message.content} />
            <button
              onClick={handleCopy}
              title="Copy response"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={copied
                ? { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
              }
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#818cf8';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Sources */}
        {!isUser && sources.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-600 px-1 uppercase tracking-widest">Sources</p>
            {sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i + 1} />
            ))}
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-600 px-1 uppercase tracking-widest">Follow-up</p>
            <div className="flex flex-col gap-1.5">
              {message.suggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick?.(q)}
                  className="text-left px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                  style={{ background: 'rgba(99,102,241,0.06)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.12)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.28)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.15)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <User className="w-4 h-4 text-slate-400" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
