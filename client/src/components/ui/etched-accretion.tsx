import { cn } from '@/lib/utils';

// Black-hole accretion backdrop (recreated from a 21st reference): a rotating
// conic glow disk around a dark core, vignetted to the page. Pure CSS, no deps.
export function EtchedAccretion({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="animate-accretion absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, rgba(255,59,47,0.33) 10%, rgba(255,217,169,0.33) 16%, transparent 27%, transparent 60%, rgba(255,59,47,0.26) 72%, rgba(255,255,255,0.33) 78%, transparent 89%)',
          filter: 'blur(26px)',
        }}
      />
      {/* event horizon: dark core with a warm rim */}
      <div
        className="absolute left-1/2 top-1/2 h-[30vmin] w-[30vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
        style={{ boxShadow: '0 0 70px 12px rgba(255,120,80,0.3), inset 0 0 24px 6px rgba(0,0,0,1)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,#08090c_82%)]" />
    </div>
  );
}
