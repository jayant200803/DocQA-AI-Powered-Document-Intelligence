import { cn } from '@/lib/utils';

// Glossy metallic arcs backdrop (recreated from a 21st reference): a blurred,
// slowly rotating conic sweep with chrome + warm highlights, vignetted to the
// page. Pure CSS, no deps.
export function ChromeArcs({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div
        className="animate-chrome absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 opacity-70"
        style={{
          background:
            'conic-gradient(from 0deg, #0a0c12 0%, #1b2742 7%, #cfe0ff 11%, #2a3a5e 15%, #0a0c12 24%, #0a0c12 50%, #17213a 57%, #e8c79a 62%, #26304a 67%, #0a0c12 76%, #0a0c12 100%)',
          filter: 'blur(44px)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,#08090c_86%)]" />
    </div>
  );
}
