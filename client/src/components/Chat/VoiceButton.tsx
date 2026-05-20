import { useState, useRef } from 'react';
import { Volume2, Loader2, Square, Download } from 'lucide-react';

const AI_URL = 'http://localhost:8000';

interface VoiceButtonProps {
  text: string;
}

const VoiceButton = ({ text }: VoiceButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
    try {
      const res = await fetch(`${AI_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error('TTS request failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    } catch (e) {
      console.error('TTS error:', e);
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
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={handlePlay}
        disabled={loading}
        title={playing ? 'Stop' : 'Listen with AI voice'}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
          ${playing
            ? 'bg-brand-600 text-white shadow-md shadow-brand-200'
            : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
          } disabled:opacity-40`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : playing ? (
          <Square className="w-3 h-3 fill-current" />
        ) : (
          <Volume2 className="w-3 h-3" />
        )}
        {loading ? 'Generating…' : playing ? 'Stop' : 'Listen'}
      </button>

      {audioUrl && !loading && (
        <button
          onClick={handleDownload}
          title="Download WAV"
          className="p-1.5 rounded-full text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100"
        >
          <Download className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default VoiceButton;
