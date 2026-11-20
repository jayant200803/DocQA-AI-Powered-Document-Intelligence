import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animated aurora gradient backdrop (adapted from a 21st.dev component).
// Tuned for this app's always-dark theme: subtle, vignetted to the app bg.
const auroraVars: CSSProperties = {
  // Electric blue / cyan drift (same var names the gradient references).
  ['--blue-700' as string]: '#1d4ed8',
  ['--indigo-500' as string]: '#3b82f6',
  ['--blue-500' as string]: '#22d3ee',
  ['--violet-400' as string]: '#60a5fa',
  ['--blue-600' as string]: '#2563eb',
};

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({ children, className, showRadialGradient = true }: AuroraBackgroundProps) {
  return (
    <div className={cn('relative flex flex-col overflow-hidden', className)}>
      <div className="absolute inset-0 overflow-hidden" style={auroraVars}>
        <motion.div
          initial={{ backgroundPosition: '0% 50%' }}
          animate={{ backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'] }}
          transition={{ duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-[1.6] transform-gpu opacity-[0.35] blur-[2px] [--aurora:repeating-linear-gradient(100deg,var(--blue-700)_10%,var(--indigo-500)_15%,var(--blue-500)_20%,var(--violet-400)_25%,var(--blue-600)_30%)] [background-image:var(--aurora)] [background-size:200%_200%]"
        />
        {showRadialGradient && (
          <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-[radial-gradient(ellipse_at_center,transparent_5%,#08090c_72%)]" />
        )}
      </div>
      <div className="relative z-20 flex w-full flex-1 flex-col">{children}</div>
    </div>
  );
}
