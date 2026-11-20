import { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Text that reveals out of a motion blur (recreated from a 21st reference).
export function MotionBlurText({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, filter: 'blur(16px)', y: 14 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ display: 'inline-block', willChange: 'filter, transform, opacity' }}
    >
      {children}
    </motion.span>
  );
}
