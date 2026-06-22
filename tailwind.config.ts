import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080f',
        surface: '#0f0f1a',
        card: '#16162a',
        accent: '#8b5cf6',
        'accent-dim': '#6d28d9',
        storm0: '#3b82f6',
        storm1: '#f59e0b',
        storm2: '#ef4444',
        storm3: '#ff0033',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"',
          'Inter', 'system-ui', 'sans-serif',
        ],
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.4,0,0.2,1)',
        'fade-in': 'fadeIn 0.2s ease',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
