import { useState, FormEvent, KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, disabled, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = !disabled && !!input.trim();

  return (
    <div className="px-4 pt-2 pb-4" style={{ background: '#0c0c0f' }}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="chat-input-wrap flex items-end gap-2 p-2.5 rounded-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Ask a question about your documents…'}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-200 placeholder-slate-600 leading-relaxed py-1 px-1.5 min-h-[28px] max-h-32 disabled:opacity-40"
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <button
            type="submit"
            disabled={!canSend}
            title="Send message"
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
            style={canSend ? {
              background: '#6366f1',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)',
            } : {
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <ArrowUp className={`w-4 h-4 ${canSend ? 'text-white' : 'text-slate-600'}`} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-700 mt-1.5 select-none">
          Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
