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
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
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
      },
    },
  },
  plugins: [],
};

export default config;
