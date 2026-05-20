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
    <header className="h-14 flex items-center justify-between px-4 shrink-0"
      style={{
        background: 'linear-gradient(90deg, #0d0f1a 0%, #141628 40%, #1a1260 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
      }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4c6ef5, #4263eb)', boxShadow: '0 0 10px rgba(76,110,245,0.4)' }}>
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">DocQA</span>
          <span className="text-white/25 font-mono text-[10px]">AI</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Voice selector */}
        <div className="relative">
          <button
            onClick={() => setVoiceOpen(!voiceOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 hover:text-white text-xs font-medium transition-all duration-150"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <Mic className="w-3.5 h-3.5 text-brand-400" />
            <span>{voice}</span>
            <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-200 ${voiceOpen ? 'rotate-180' : ''}`} />
          </button>

          {voiceOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl overflow-hidden z-50 py-1"
              style={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => handleVoice(v)}
                  className="w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2"
                  style={v === voice
                    ? { background: 'rgba(76,110,245,0.2)', color: '#93b4ff' }
                    : { color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  <Mic className="w-3 h-3 opacity-60 shrink-0" />
                  {v}
                  {v === voice && <span className="ml-auto text-brand-400 text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #4c6ef5, #7c3aed)' }}>
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <span className="text-xs text-white/60 font-medium max-w-[100px] truncate">
            {user?.name || user?.email}
          </span>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
