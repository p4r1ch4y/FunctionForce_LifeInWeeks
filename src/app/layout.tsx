import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LifeWeeks - Your Life in 4,000 Weeks',
  description: 'Visualize your life week by week with AI-powered insights, personal narratives, and historical context. Map your journey through time.',
  keywords: 'life timeline, personal development, AI insights, life visualization, weekly planner',
  authors: [{ name: 'LifeWeeks Team' }],
  metadataBase: new URL('https://lifeweeks.vercel.app'),
  openGraph: {
    title: 'LifeWeeks - Your Life in 4,000 Weeks',
    description: 'Visualize your life week by week with AI-powered insights and historical context.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeWeeks - Your Life in 4,000 Weeks',
    description: 'Visualize your life week by week with AI-powered insights and historical context.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-white antialiased`}>
        {children}
      </body>
    </html>
  );
}