import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a1224',
          soft: '#1a2540',
          mute: '#4a5878',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f6f8fc',
          cool: '#eef2f9',
        },
        line: {
          DEFAULT: '#e3e8f1',
          strong: '#c9d2e2',
        },
        accent: {
          cyan: '#00bcd4',
          blue: '#0057ff',
          deep: '#001845',
        },
        state: {
          ok: '#0f7a55',
          warn: '#8a5a00',
          err: '#a11226',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        hero: ['clamp(2.5rem, 5vw, 4.25rem)', { lineHeight: '1.03', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 3.4vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.5rem, 2.4vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
      },
      boxShadow: {
        elev1: '0 1px 2px rgba(10,18,36,0.04), 0 2px 6px rgba(10,18,36,0.04)',
        elev2: '0 4px 12px rgba(10,18,36,0.06), 0 12px 32px rgba(10,18,36,0.06)',
        elev3: '0 8px 24px rgba(10,18,36,0.08), 0 24px 64px rgba(10,18,36,0.10)',
        glow: '0 0 0 1px rgba(0, 87, 255, 0.14), 0 8px 24px rgba(0, 87, 255, 0.12)',
        ring: '0 0 0 4px rgba(0, 87, 255, 0.14)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'aurora': {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(-3%,2%,0) scale(1.05)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
        'fade-in': 'fade-in 500ms ease-out both',
        'aurora-slow': 'aurora 14s ease-in-out infinite',
        'aurora-fast': 'aurora 9s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
