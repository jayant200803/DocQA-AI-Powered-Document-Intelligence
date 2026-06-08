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
    <header
      className="h-12 flex items-center justify-between px-4 shrink-0"
      style={{
        background: '#111115',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.4)' }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">DocQA</span>
          <span className="text-slate-700 font-mono text-[10px]">AI</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Voice selector */}
        <div className="relative">
          <button
            onClick={() => setVoiceOpen(!voiceOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Mic className="w-3 h-3 text-brand-400" />
            <span>{voice}</span>
            <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${voiceOpen ? 'rotate-180' : ''}`} />
          </button>

          {voiceOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-32 rounded-xl overflow-hidden z-50 py-1"
              style={{ background: '#18181d', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
            >
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => handleVoice(v)}
                  className="w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2"
                  style={v === voice
                    ? { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }
                    : { color: 'rgba(255,255,255,0.45)' }
                  }
                >
                  <Mic className="w-3 h-3 opacity-50 shrink-0" />
                  {v}
                  {v === voice && <span className="ml-auto text-brand-400 text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User chip */}
        <div
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
            style={{ background: '#6366f1' }}
          >
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <span className="text-xs text-slate-400 font-medium max-w-[100px] truncate">
            {user?.name || user?.email}
          </span>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
