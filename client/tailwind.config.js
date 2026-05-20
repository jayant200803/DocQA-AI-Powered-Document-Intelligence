/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
          950: '#1e2d8a',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        orb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.94)' },
        },
        orbReverse: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-50px, 30px) scale(0.96)' },
          '66%': { transform: 'translate(40px, -40px) scale(1.06)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(92, 124, 250, 0)' },
          '50%': { boxShadow: '0 0 24px 6px rgba(92, 124, 250, 0.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        typingDot: {
          '0%, 60%, 100%': { opacity: '0.2', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-4px)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        orb: 'orb 10s ease-in-out infinite',
        'orb-reverse': 'orbReverse 13s ease-in-out infinite',
        'orb-slow': 'orb 16s ease-in-out infinite 3s',
        fadeUp: 'fadeUp 0.3s ease-out forwards',
        glowPulse: 'glowPulse 2.5s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        typingDot: 'typingDot 1.4s ease-in-out infinite',
        slideIn: 'slideIn 0.2s ease-out forwards',
      },
      boxShadow: {
        glow: '0 0 20px rgba(92, 124, 250, 0.4)',
        'glow-sm': '0 0 10px rgba(92, 124, 250, 0.25)',
        'glow-lg': '0 0 40px rgba(92, 124, 250, 0.3)',
      },
    },
  },
  plugins: [],
};
