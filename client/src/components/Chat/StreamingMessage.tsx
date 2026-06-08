import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
}

const StreamingMessage = ({ content }: StreamingMessageProps) => {
  return (
    <div className="flex gap-3 justify-start msg-enter">
      {/* Glowing bot avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 animate-glowPulse"
        style={{ background: '#6366f1', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="max-w-[75%]">
        {content ? (
          <div
            className="px-4 py-3 rounded-2xl rounded-bl-md text-slate-200 text-sm leading-relaxed whitespace-pre-wrap"
            style={{ background: '#18181d', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {content}
            <span className="streaming-cursor" />
          </div>
        ) : (
          <div
            className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl rounded-bl-md w-16"
            style={{ background: '#18181d', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-500" />
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mt-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-slate-600 font-medium">AI is responding</span>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;
