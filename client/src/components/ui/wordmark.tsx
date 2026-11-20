import { cn } from '@/lib/utils';

const sizes = {
  sm: { tile: 'h-6 w-6 rounded-md', icon: 'h-3.5 w-3.5', text: 'text-sm' },
  md: { tile: 'h-7 w-7 rounded-lg', icon: 'h-4 w-4', text: 'text-base' },
  lg: { tile: 'h-9 w-9 rounded-lg', icon: 'h-5 w-5', text: 'text-xl' },
};

// Brand lockup: a custom document-and-answer glyph + typographic wordmark.
// Deliberately not the generic sparkle-"AI" badge.
export function Wordmark({ size = 'sm', className }: { size?: keyof typeof sizes; className?: string }) {
  const s = sizes[size];
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative flex items-center justify-center bg-accent-gradient shadow-btn-glow', s.tile)}>
        <svg
          viewBox="0 0 24 24"
          className={cn('text-white', s.icon)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <circle cx="11.5" cy="14.5" r="2.2" />
        </svg>
      </span>
      <span className={cn('font-semibold tracking-tight text-ink', s.text)}>
        Doc<span className="text-accent">QA</span>
      </span>
    </span>
  );
}
