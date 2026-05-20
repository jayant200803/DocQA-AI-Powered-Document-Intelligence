import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, ArrowRight, FileText, Zap, MessageSquare, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#06081a' }}>

      {/* ── Left decorative panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] bg-auth relative overflow-hidden flex-col justify-between p-14 select-none">

        {/* Vivid animated orbs */}
        <div className="auth-orb w-[560px] h-[560px] -top-40 -left-40 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(76,110,245,0.25) 50%, transparent 70%)' }} />
        <div className="auth-orb w-[420px] h-[420px] top-1/3 -right-28 animate-orb-reverse"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)' }} />
        <div className="auth-orb w-[320px] h-[320px] -bottom-24 left-1/4 animate-orb-slow"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(37,99,235,0.15) 50%, transparent 70%)' }} />
        <div className="auth-orb w-[200px] h-[200px] top-1/4 left-1/3 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', animationDelay: '5s' }} />

        {/* Dot-grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Top gradient fade */}
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(6,8,26,0.6), transparent)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15"
            style={{ background: 'linear-gradient(135deg, #4c6ef5, #7c3aed)', boxShadow: '0 0 20px rgba(76,110,245,0.5)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">DocQA</span>
          <span className="text-white/30 font-mono text-xs ml-0.5">AI</span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 space-y-8">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 text-white/60 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Gemini 2.5 Flash
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-5xl font-bold text-white leading-[1.1] mb-4">
              Talk to your<br />
              <span style={{
                background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                documents.
              </span>
            </h2>
            <p className="text-white/45 text-base leading-relaxed max-w-xs">
              Upload a PDF and ask anything. Get cited answers from your own content, not the internet.
            </p>
          </div>

          {/* Floating demo card */}
          <div className="animate-float" style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))' }}>
            <div className="rounded-2xl p-4 max-w-sm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
              }}>
              {/* Doc header */}
              <div className="flex items-center gap-2.5 mb-3 pb-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(76,110,245,0.25)', border: '1px solid rgba(76,110,245,0.3)' }}>
                  <FileText className="w-3.5 h-3.5 text-brand-300" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium leading-none">Q4_Financial_Report.pdf</p>
                  <p className="text-white/35 text-[10px] mt-0.5">32 pages · ready</p>
                </div>
                <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-[9px] font-medium">Ready</span>
                </div>
              </div>

              {/* Question */}
              <div className="flex items-start gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-2.5 h-2.5 text-brand-300" />
                </div>
                <p className="text-white/70 text-xs leading-relaxed">What was the total revenue in Q4?</p>
              </div>

              {/* AI answer */}
              <div className="flex items-start gap-2 mb-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #4c6ef5, #7c3aed)' }}>
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
                <p className="text-white/85 text-xs leading-relaxed">
                  Total revenue in Q4 was <span className="text-emerald-400 font-semibold">$4.2 billion</span>, representing a 18% YoY growth.
                  <span className="ml-1 text-[9px] text-brand-400 font-medium">[Source 1]</span>
                </p>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-2.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {['YoY breakdown?', 'Operating margin?'].map(q => (
                  <div key={q} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] text-brand-300 cursor-pointer"
                    style={{ background: 'rgba(76,110,245,0.12)', border: '1px solid rgba(76,110,245,0.2)' }}>
                    <Zap className="w-2.5 h-2.5" />
                    {q}
                    <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                  </div>
                ))}
              </div>
            </div>
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

        {/* Subtle background glow behind form */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(76,110,245,0.08) 0%, transparent 65%)' }} />

        <div className="w-full max-w-sm animate-fadeUp relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4c6ef5, #7c3aed)', boxShadow: '0 0 16px rgba(76,110,245,0.4)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">DocQA</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to continue to DocQA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm flex items-start gap-2.5"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
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

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 active:scale-[0.97] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #4c6ef5, #7c3aed)',
                boxShadow: loading ? 'none' : '0 0 24px rgba(76,110,245,0.4), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
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
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors duration-150"
              style={{ color: '#748ffc' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#91a7ff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#748ffc')}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
