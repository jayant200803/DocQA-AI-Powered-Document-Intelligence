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
      className="text-left w-full border border-gray-200/80 rounded-xl p-2.5 hover:bg-gray-50 transition-all duration-150 hover:border-brand-200 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-md text-xs font-bold shrink-0 shadow-sm">
            {index}
          </span>
          <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-xs font-medium text-gray-700 truncate">{source.fileName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-brand-600 font-semibold font-mono bg-brand-50 px-1.5 py-0.5 rounded-md">
            {(source.relevanceScore * 100).toFixed(0)}%
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </div>
      {expanded && (
        <p className="mt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
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
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-brand-200">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
            ${isUser
              ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-br-md shadow-brand-200'
              : 'bg-white border border-gray-200/80 text-gray-800 rounded-bl-md'
            }`}
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                ${copied
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                title="Regenerate response"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 hover:bg-brand-50 hover:text-brand-600 border border-gray-200 hover:border-brand-200 transition-all duration-200"
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
            <p className="text-xs font-semibold text-gray-400 px-1 uppercase tracking-wide">Sources</p>
            {sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i + 1} />
            ))}
          </div>
        )}

        {/* Suggested follow-up questions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 px-1 uppercase tracking-wide">Follow-up questions</p>
            <div className="flex flex-col gap-1.5">
              {message.suggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick?.(q)}
                  className="text-left px-3 py-2 rounded-xl text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100 hover:border-brand-200 transition-all duration-150 font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
