import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const themeScript = `try{const theme=localStorage.getItem('signal-desk-theme');if(theme==='light'||theme==='dark')document.documentElement.dataset.theme=theme}catch{}`;

const siteOrigin = process.env.SITE_ORIGIN || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'Mirror Desk · Diligent Plane Trade Tracker',
  description: 'A source-linked reconstruction of @DiligentPlane trades, portfolio exposure, and new mirror actions.',
  openGraph: {
    title: 'Mirror Desk',
    description: 'Track disclosed trades. Keep the evidence.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Mirror Desk trade tracker' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mirror Desk',
    description: 'Track disclosed trades. Keep the evidence.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
