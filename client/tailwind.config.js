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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(99,102,241,0.3)' },
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
        'glow-sm': '0 0 12px rgba(99,102,241,0.25)',
        'glow':    '0 0 24px rgba(99,102,241,0.35)',
        'glow-lg': '0 0 48px rgba(99,102,241,0.3)',
      },
    },
  },
  plugins: [],
};
