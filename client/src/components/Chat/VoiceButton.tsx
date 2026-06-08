import { useState, useRef } from 'react';
import { Volume2, Loader2, Square, Download } from 'lucide-react';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

interface VoiceButtonProps {
  text: string;
}

const VoiceButton = ({ text }: VoiceButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voice = localStorage.getItem('selectedVoice') || 'Kore';

  const handlePlay = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    setHasError(false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${AI_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('TTS request failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    } catch {
      clearTimeout(timeoutId);
      setHasError(true);
      setTimeout(() => setHasError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'answer.wav';
    a.click();
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePlay}
        disabled={loading}
        title={playing ? 'Stop' : 'Listen with AI voice'}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 disabled:opacity-40"
        style={
          hasError
            ? { background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
            : playing
            ? { background: 'rgba(99,102,241,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }
            : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
        }
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : playing ? (
          <Square className="w-3 h-3 fill-current" />
        ) : (
          <Volume2 className="w-3 h-3" />
        )}
        {loading ? 'Generating…' : hasError ? 'Failed' : playing ? 'Stop' : 'Listen'}
      </button>

      {audioUrl && !loading && (
        <button
          onClick={handleDownload}
          title="Download WAV"
          className="p-1.5 rounded-full transition-all duration-200"
          style={{ color: '#64748b' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#818cf8';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <Download className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default VoiceButton;
