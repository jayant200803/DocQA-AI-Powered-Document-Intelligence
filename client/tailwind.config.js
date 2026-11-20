import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Design tokens (defined in index.css :root) — use these in screens.
        surface: 'rgb(var(--surface-1-rgb) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        ink: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        line: 'var(--border)',
        'line-strong': 'var(--border-strong)',
        accent: { DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)', hover: 'var(--accent-hover)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '30%':           { opacity: '1',    transform: 'translateY(-3px)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-6px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(59,130,246,0.3)' },
        },
        msgIn: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        fadeUp:    'fadeUp 0.28s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer:   'shimmer 1.8s linear infinite',
        typingDot: 'typingDot 1.4s ease-in-out infinite',
        slideIn:   'slideIn 0.2s ease-out forwards',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        msgIn:     'msgIn 0.26s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(59,130,246,0.25)',
        'glow':    '0 0 24px rgba(59,130,246,0.35)',
        'glow-lg': '0 0 48px rgba(59,130,246,0.3)',
        // Premium layered depth + accent glow for key surfaces/buttons.
        'premium': '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 8px 30px -8px rgba(0,0,0,0.6)',
        'btn-glow': '0 1px 0 0 rgba(255,255,255,0.18) inset, 0 8px 24px -6px rgba(59,130,246,0.5)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
        'glass': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
