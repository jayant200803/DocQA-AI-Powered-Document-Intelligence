import * as React from 'react';
import { cn } from '@/lib/utils';

// Glass card: translucent surface, blur, layered depth. The premium container.
const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-line bg-[rgba(22,18,15,0.55)] bg-glass backdrop-blur-xl shadow-premium',
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';

export { GlassCard };
