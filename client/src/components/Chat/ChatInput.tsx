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
    <div className="px-4 pt-2 pb-4"
      style={{ background: 'linear-gradient(to top, #f8faff 75%, rgba(248,250,255,0))' }}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="chat-input-wrap flex items-end gap-2 p-2.5 rounded-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Ask a question about your documents…'}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed py-1 px-1.5 min-h-[28px] max-h-32 disabled:opacity-50"
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
              background: 'linear-gradient(135deg, #4c6ef5, #4263eb)',
              boxShadow: '0 0 16px rgba(76,110,245,0.45)',
            } : {
              background: '#e9ecef',
            }}
          >
            <ArrowUp className={`w-4 h-4 ${canSend ? 'text-white' : 'text-gray-400'}`} />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400/70 mt-1.5 select-none">
          Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
