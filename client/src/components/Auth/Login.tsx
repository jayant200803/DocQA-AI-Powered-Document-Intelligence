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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-muted text-xs font-medium bg-surface-2 border border-line">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Gemini 2.5 Flash
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-5xl font-semibold text-ink leading-[1.08] mb-4">
              Talk to your<br />
              <span className="text-accent">documents.</span>
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-xs">
              Upload a PDF and ask anything. Get cited answers from your own content, not the internet.
            </p>
          </div>

          {/* Demo card */}
          <div className="card p-4 max-w-sm">
            {/* Doc header */}
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-line">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-surface-2 border border-line">
                <FileText className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <p className="text-ink text-xs font-medium leading-none">Q4_Financial_Report.pdf</p>
                <p className="text-faint text-[10px] mt-0.5">32 pages · ready</p>
              </div>
              <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.18)]">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-[9px] font-medium">Ready</span>
              </div>
            </div>

            {/* Question */}
            <div className="flex items-start gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-surface-2 border border-line flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-2.5 h-2.5 text-muted" />
              </div>
              <p className="text-muted text-xs leading-relaxed">What was the total revenue in Q4?</p>
            </div>

            {/* AI answer */}
            <div className="flex items-start gap-2 mb-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-accent">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
              <p className="text-ink text-xs leading-relaxed">
                Total revenue in Q4 was <span className="text-emerald-400 font-semibold">$4.2 billion</span>, representing 18% YoY growth.
                <span className="ml-1 text-[9px] text-accent font-medium">[Source 1]</span>
              </p>
            </div>

            {/* Follow-up chips */}
            <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-line">
              {['YoY breakdown?', 'Operating margin?'].map(q => (
                <div key={q} className="chip gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  {q}
                  <ChevronRight className="w-2.5 h-2.5 opacity-40" />
                </div>
              ))}
            </div>
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
            <h1 className="text-2xl font-semibold text-ink mb-1.5">Welcome back</h1>
            <p className="text-muted text-sm">Sign in to continue to DocQA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm flex items-start gap-2.5 bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.18)] text-red-400">
                <span className="mt-0.5 shrink-0">⚠</span>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
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
              <div className="w-full h-px bg-line" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-faint bg-chat">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-accent hover:text-accent-hover transition-colors duration-150">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
