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
    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      autoFocus={autoFocus}
      minLength={minLength}
      className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-700 outline-none transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      onFocus={e => {
        e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
      }}
      onBlur={e => {
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
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
    <div className="min-h-screen flex" style={{ background: '#06081a' }}>

      {/* ── Left decorative panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] bg-auth relative overflow-hidden flex-col justify-between p-14 select-none">

        {/* Dot-grid texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        {/* Subtle edge glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(99,102,241,0.1) 0%, transparent 65%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
            style={{ background: '#6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">DocQA</span>
          <span className="text-white/25 font-mono text-xs">AI</span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white/50 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Free to get started
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white leading-[1.08] mb-4">
              Chat with any<br />
              <span style={{
                background: 'linear-gradient(90deg, #a5b4fc, #818cf8, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                document, fast.
              </span>
            </h2>
            <p className="text-white/40 text-base leading-relaxed max-w-xs">
              Upload PDFs and text files. Ask anything. Get precise, cited answers in seconds.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3.5 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Icon className="w-4 h-4 text-brand-300" />
                </div>
                <span className="text-white/65 text-sm leading-snug flex-1">{label}</span>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/15 text-xs tracking-wide">MongoDB · Pinecone · Google Gemini · FastAPI · React</p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative"
        style={{ background: '#0a0c1e' }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(99,102,241,0.07) 0%, transparent 60%)' }} />

        <div className="w-full max-w-sm animate-fadeUp relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#6366f1', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">DocQA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1.5">Create your account</h1>
            <p className="text-slate-500 text-sm">Start querying documents with AI — free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}>
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}

            <DarkInput label="Name"     type="text"     placeholder="Your name"             value={name}     onChange={setName}     required autoFocus />
            <DarkInput label="Email"    type="email"    placeholder="you@example.com"       value={email}    onChange={setEmail}    required />
            <DarkInput label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={setPassword} required minLength={6} />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.97] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#6366f1',
                boxShadow: loading ? 'none' : '0 0 0 1px rgba(99,102,241,0.5), 0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
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
              <div className="w-full" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-slate-700" style={{ background: '#0a0c1e' }}>or</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-150">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
