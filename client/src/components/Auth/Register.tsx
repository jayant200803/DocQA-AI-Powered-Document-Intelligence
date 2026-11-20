import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Shield, BarChart2, Brain, Check } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wordmark } from '@/components/ui/wordmark';

const PERKS = [
  { icon: Brain,     label: 'Gemini 2.5 Flash for deep document understanding' },
  { icon: BarChart2, label: 'Real-time progress as your docs are indexed' },
  { icon: Shield,    label: 'Your documents stay private — never shared' },
];

const Field = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</label>
    <Input {...props} />
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
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Free to get started
            </div>

            <h2 className="text-5xl font-semibold leading-[1.08] text-ink">
              Chat with any<br />
              <span className="bg-accent-gradient bg-clip-text text-transparent">document, fast.</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-muted">
              Upload PDFs and text files. Ask anything. Get precise, cited answers in seconds.
            </p>

            <div className="flex flex-col gap-3">
              {PERKS.map(({ icon: Icon, label }) => (
                <GlassCard key={label} className="flex items-center gap-3.5 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <span className="flex-1 text-sm leading-snug text-muted">{label}</span>
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                </GlassCard>
              ))}
            </div>
          </div>

          {/* ── Right: auth card ────────────────────────── */}
          <GlassCard className="w-full p-8">
            <div className="mb-8 flex justify-center lg:hidden">
              <Wordmark size="md" />
            </div>

            <div className="mb-8">
              <h1 className="mb-1.5 text-2xl font-semibold text-ink">Create your account</h1>
              <p className="text-sm text-muted">Start querying documents with AI — free</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.07)] px-4 py-3 text-sm text-red-400">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {error}
                </div>
              )}
              <Field label="Name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
              <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Field label="Password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account…
                  </>
                ) : (
                  <>Create account <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center"><div className="h-px w-full bg-line" /></div>
              <div className="relative flex justify-center"><span className="bg-surface px-3 text-xs text-faint">or</span></div>
            </div>

            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-accent transition-colors hover:text-accent-hover">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </AuroraBackground>
  );
};

export default Register;
