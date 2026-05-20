import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
}

const StreamingMessage = ({ content }: StreamingMessageProps) => {
  return (
    <div className="flex gap-3 justify-start msg-enter">
      {/* Glowing animated bot avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 mt-0.5 animate-glowPulse"
        style={{ boxShadow: '0 0 16px rgba(92,124,250,0.35)' }}>
        <Bot className="w-4 h-4 text-white" />
      </div>

      <div className="max-w-[75%]">
        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200/80 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
          {content}
          <span className="streaming-cursor" />
        </div>

        {/* Typing indicator shown while no content yet */}
        {!content && (
          <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200/80 shadow-sm w-16">
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-brand-400" />
          </div>
        )}

        {/* Status line */}
        <div className="flex items-center gap-1.5 mt-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-gray-400 font-medium">AI is responding</span>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;
