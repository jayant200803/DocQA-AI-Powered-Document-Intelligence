import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Animated perspective dot field (recreated from a 21st "wave mesh" reference).
// Pure canvas-2D, no WebGL/deps: a grid of dots receding to a horizon with a
// slow sine wave. Pauses when offscreen and when reduced-motion is set.
export function WaveMesh({ children, className }: { children?: ReactNode; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, t = 0, raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const cols = 54, rows = 24;
    const draw = () => {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const horizon = h * 0.3;
      for (let j = 0; j < rows; j++) {
        const pz = j / (rows - 1);           // 0 at horizon, 1 nearest
        const persp = Math.pow(pz, 1.9);      // rows bunch up near the horizon
        const y = horizon + persp * (h - horizon);
        const spread = 0.1 + persp * 1.0;     // columns fan out toward the viewer
        const alpha = 0.06 + persp * 0.45;
        for (let i = 0; i < cols; i++) {
          const fx = (i / (cols - 1)) * 2 - 1;
          const wave = Math.sin(fx * 3 + pz * 6 - t * 1.1) * 6 * persp;
          const x = cx + fx * spread * w * 0.72;
          const radius = 0.5 + persp * 1.5;
          ctx.beginPath();
          ctx.fillStyle = `rgba(140,175,255,${alpha})`;
          ctx.arc(x, y + wave, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = () => {
      t += 0.016;
      draw();
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf) tick(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(canvas);
    draw();

    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {/* fade the field into the page at top and bottom */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#08090c_0%,transparent_30%,transparent_70%,#08090c_100%)]" />
      <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
    </div>
  );
}
