import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Private Deal Workspace',
  description: 'Private executive briefing workspace.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  other: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
