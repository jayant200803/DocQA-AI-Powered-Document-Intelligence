import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChromeArcs } from '@/components/ui/chrome-arcs';
import { GlassCard } from '@/components/ui/card';
import { Wordmark } from '@/components/ui/wordmark';
import { cn } from '@/lib/utils';

const tab = (active: boolean) =>
  cn(
    'rounded-md py-2 text-center text-sm font-medium transition-colors',
    active ? 'bg-accent-gradient text-white shadow-btn-glow' : 'text-muted hover:text-ink'
  );

// Centered glass auth card over a chrome-arcs backdrop, with Login / Sign Up
// tabs. Shared by the login and register pages (image-2 layout).
export function AuthLayout({
  active,
  title,
  subtitle,
  children,
}: {
  active: 'login' | 'register';
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-chat p-6">
      <ChromeArcs />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-8">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Wordmark size="md" />
            <div className="text-center">
              <h1 className="text-xl font-semibold text-ink">{title}</h1>
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface-2/60 p-1">
            <Link to="/login" className={tab(active === 'login')}>Login</Link>
            <Link to="/register" className={tab(active === 'register')}>Sign Up</Link>
          </div>

          {children}
        </GlassCard>
      </motion.div>
    </div>
  );
}
