import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, ArrowRight, Shield, BarChart2, Brain, Check } from 'lucide-react';

const PERKS = [
  { icon: Brain,     label: 'Gemini 2.5 Flash for deep document understanding' },
  { icon: BarChart2, label: 'Real-time progress as your docs are indexed' },
  { icon: Shield,    label: 'Your documents stay private — never shared' },
];

const DarkInput = ({
  label, type, placeholder, value, onChange, required, autoFocus, minLength,
}: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; autoFocus?: boolean; minLength?: number;
}) => (
  <div>
    <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      autoFocus={autoFocus}
      minLength={minLength}
      className="input-field"
    />
  </div>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-chat">

      {/* ── Left decorative panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] bg-auth relative overflow-hidden flex-col justify-between p-14 select-none border-r border-line">

        {/* Dot-grid texture */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center card">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <span className="text-ink font-semibold text-xl tracking-tight">DocQA</span>
          <span className="text-faint font-mono text-xs">AI</span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-muted text-xs font-medium bg-surface-2 border border-line">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Free to get started
          </div>

          <div>
            <h2 className="text-5xl font-semibold text-ink leading-[1.08] mb-4">
              Chat with any<br />
              <span className="text-accent">document, fast.</span>
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-xs">
              Upload PDFs and text files. Ask anything. Get precise, cited answers in seconds.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3.5 px-4 py-3 rounded-lg card">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-surface-2 border border-line">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-muted text-sm leading-snug flex-1">{label}</span>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-faint text-xs tracking-wide">MongoDB · Pinecone · Google Gemini · FastAPI · React</p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-chat">
        <div className="w-full max-w-sm animate-fadeUp">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center card">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <span className="font-semibold text-ink text-lg tracking-tight">DocQA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-ink mb-1.5">Create your account</h1>
            <p className="text-muted text-sm">Start querying documents with AI — free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm flex items-start gap-2.5 bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)] text-red-400">
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}

            <DarkInput label="Name"     type="text"     placeholder="Your name"             value={name}     onChange={setName}     required autoFocus />
            <DarkInput label="Email"    type="email"    placeholder="you@example.com"       value={email}    onChange={setEmail}    required />
            <DarkInput label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={setPassword} required minLength={6} />

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-line" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-faint bg-chat">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:text-accent-hover transition-colors duration-150">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
