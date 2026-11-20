import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, ArrowRight, FileText, Zap, MessageSquare, ChevronRight } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wordmark } from '@/components/ui/wordmark';

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
      navigate('/app');
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
    <AuroraBackground className="min-h-screen">
      <div className="flex min-h-screen flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2"
        >
          {/* ── Left: pitch ─────────────────────────────── */}
          <div className="hidden select-none flex-col gap-7 lg:flex">
            <Wordmark size="lg" />

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-[rgba(20,23,30,0.6)] px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Powered by Gemini 2.5 Flash
            </div>

            <h2 className="text-5xl font-semibold leading-[1.08] text-ink">
              Talk to your<br />
              <span className="bg-accent-gradient bg-clip-text text-transparent">documents.</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-muted">
              Upload a PDF and ask anything. Get cited answers from your own content, not the internet.
            </p>

            {/* Demo glass card */}
            <GlassCard className="max-w-sm p-4">
              <div className="mb-3 flex items-center gap-2.5 border-b border-line pb-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium leading-none text-ink">Q4_Financial_Report.pdf</p>
                  <p className="mt-0.5 text-[10px] text-faint">32 pages · ready</p>
                </div>
                <div className="ml-auto flex items-center gap-1 rounded-full border border-[rgba(52,211,153,0.18)] bg-[rgba(52,211,153,0.1)] px-2 py-0.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-medium text-emerald-400">Ready</span>
                </div>
              </div>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2">
                  <MessageSquare className="h-2.5 w-2.5 text-muted" />
                </div>
                <p className="text-xs leading-relaxed text-muted">What was the total revenue in Q4?</p>
              </div>
              <div className="mb-3 flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-gradient">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
                <p className="text-xs leading-relaxed text-ink">
                  Total revenue in Q4 was <span className="font-semibold text-emerald-400">$4.2 billion</span>, up 18% YoY.
                  <span className="ml-1 text-[9px] font-medium text-accent">[Source 1]</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 border-t border-line pt-2.5">
                {['YoY breakdown?', 'Operating margin?'].map((q) => (
                  <span key={q} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[10px] text-muted">
                    <Zap className="h-2.5 w-2.5" />
                    {q}
                    <ChevronRight className="h-2.5 w-2.5 opacity-40" />
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── Right: auth card ────────────────────────── */}
          <GlassCard className="w-full p-8">
            <div className="mb-8 flex justify-center lg:hidden">
              <Wordmark size="md" />
            </div>

            <div className="mb-8">
              <h1 className="mb-1.5 text-2xl font-semibold text-ink">Welcome back</h1>
              <p className="text-sm text-muted">Sign in to continue to DocQA</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.07)] px-4 py-3 text-sm text-red-400">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {error}
                </div>
              )}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted">Email</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted">Password</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center"><div className="h-px w-full bg-line" /></div>
              <div className="relative flex justify-center"><span className="bg-surface px-3 text-xs text-faint">or</span></div>
            </div>

            <p className="text-center text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-accent transition-colors hover:text-accent-hover">
                Create one free
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </AuroraBackground>
  );
};

export default Login;
