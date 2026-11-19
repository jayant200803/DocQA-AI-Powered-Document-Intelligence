import { useState } from 'react';
import { Sparkles, LogOut, Menu, ChevronDown, Mic } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const VOICES = ['Kore', 'Aoede', 'Puck', 'Charon', 'Fenrir'];

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [voice, setVoice] = useState(() => localStorage.getItem('selectedVoice') || 'Kore');
  const [voiceOpen, setVoiceOpen] = useState(false);

  const handleVoice = (v: string) => {
    setVoice(v);
    localStorage.setItem('selectedVoice', v);
    setVoiceOpen(false);
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 shrink-0 bg-surface border-b border-line">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="btn-ghost lg:hidden p-1.5">
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center card">
            <Sparkles className="w-3 h-3 text-accent" />
          </div>
          <span className="text-ink font-semibold text-sm tracking-tight">DocQA</span>
          <span className="text-faint font-mono text-[10px]">AI</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Voice selector */}
        <div className="relative">
          <button
            onClick={() => setVoiceOpen(!voiceOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted hover:text-ink text-xs font-medium bg-surface-2 border border-line hover:border-line-strong transition-colors duration-150"
          >
            <Mic className="w-3 h-3 text-accent" />
            <span>{voice}</span>
            <ChevronDown className={`w-3 h-3 text-faint transition-transform duration-200 ${voiceOpen ? 'rotate-180' : ''}`} />
          </button>

          {voiceOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-32 rounded-lg overflow-hidden z-50 py-1 bg-surface-2 border border-line shadow-2xl">
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => handleVoice(v)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                    v === voice ? 'text-accent bg-[rgba(99,102,241,0.12)]' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Mic className="w-3 h-3 opacity-50 shrink-0" />
                  {v}
                  {v === voice && <span className="ml-auto text-accent text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User chip */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-line">
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-accent text-white text-[10px] font-bold shrink-0">
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <span className="text-xs text-muted font-medium max-w-[100px] truncate">
            {user?.name || user?.email}
          </span>
        </div>

        <button onClick={logout} title="Sign out" className="btn-ghost p-1.5">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
