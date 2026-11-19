import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-lg border border-line bg-[rgba(21,23,25,0.7)] px-3.5 text-sm text-ink',
        'placeholder:text-faint outline-none transition-all duration-200',
        'focus:border-accent focus:ring-2 focus:ring-[rgba(99,102,241,0.15)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
