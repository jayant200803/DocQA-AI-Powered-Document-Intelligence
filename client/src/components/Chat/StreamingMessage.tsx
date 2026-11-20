import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
}

const StreamingMessage = ({ content }: StreamingMessageProps) => {
  return (
    <div className="flex gap-3 justify-start msg-enter">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 card">
        <Bot className="w-4 h-4 text-accent" />
      </div>

      <div className="max-w-[75%]">
        {content ? (
          <div className="px-4 py-3 rounded-lg rounded-bl-sm bg-surface border border-line text-ink text-sm leading-relaxed whitespace-pre-wrap">
            {content}
            <span className="streaming-cursor" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-4 py-3.5 rounded-lg rounded-bl-sm w-16 bg-surface border border-line">
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 mt-1.5 px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-faint font-medium">AI is responding</span>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;
