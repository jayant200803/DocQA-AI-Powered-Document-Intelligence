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
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      autoFocus={autoFocus}
      minLength={minLength}
      className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      onFocus={e => {
        e.currentTarget.style.border = '1px solid rgba(92,124,250,0.5)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(92,124,250,0.12)';
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

        {/* Vivid orbs — different palette from Login */}
        <div className="auth-orb w-[520px] h-[520px] -top-32 -left-20 animate-orb-reverse"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(109,40,217,0.2) 50%, transparent 70%)', animationDelay: '2s' }} />
        <div className="auth-orb w-[400px] h-[400px] top-1/2 -right-20 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(29,78,216,0.2) 50%, transparent 70%)' }} />
        <div className="auth-orb w-[260px] h-[260px] -bottom-16 left-1/3 animate-orb-slow"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)', animationDelay: '4s' }} />
        <div className="auth-orb w-[180px] h-[180px] top-1/3 right-1/3 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)', animationDelay: '7s' }} />

        {/* Dot-grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(6,8,26,0.6), transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4c6ef5)', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">DocQA</span>
          <span className="text-white/30 font-mono text-xs ml-0.5">AI</span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 text-white/60 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Free to get started
          </div>

          <div>
            <h2 className="text-5xl font-bold text-white leading-[1.1] mb-4">
              Chat with any<br />
              <span style={{
                background: 'linear-gradient(90deg, #c4b5fd, #93c5fd, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                document, fast.
              </span>
            </h2>
            <p className="text-white/45 text-base leading-relaxed max-w-xs">
              Upload PDFs and text files. Ask anything. Get precise, cited answers in seconds.
            </p>
          </div>

          {/* Feature checklist */}
          <div className="space-y-3.5 animate-float" style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.4))' }}>
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3.5 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <Icon className="w-4 h-4 text-violet-300" />
                </div>
                <span className="text-white/70 text-sm leading-snug flex-1">{label}</span>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/20 text-xs tracking-wide">MongoDB · Pinecone · Google Gemini · FastAPI · React</p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative"
        style={{ background: '#0a0c1e' }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.07) 0%, transparent 65%)' }} />

        <div className="w-full max-w-sm animate-fadeUp relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4c6ef5)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
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
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}

            <DarkInput label="Name"     type="text"     placeholder="Your name"          value={name}     onChange={setName}     required autoFocus />
            <DarkInput label="Email"    type="email"    placeholder="you@example.com"    value={email}    onChange={setEmail}    required />
            <DarkInput label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={setPassword} required minLength={6} />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.97] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4c6ef5)',
                boxShadow: loading ? 'none' : '0 0 24px rgba(124,58,237,0.4), 0 4px 12px rgba(0,0,0,0.3)',
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
              <span className="px-3 text-xs text-slate-600" style={{ background: '#0a0c1e' }}>or</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors duration-150"
              style={{ color: '#748ffc' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#91a7ff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#748ffc')}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
