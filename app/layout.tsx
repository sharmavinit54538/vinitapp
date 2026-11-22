import type {Metadata, Viewport} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'OFC360 – Enterprise Workforce Platform',
  description:
    'Enterprise HRMS and workforce operations platform for OFC360.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OFC360',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'OFC360 – Enterprise Workforce Platform',
    description:
      'Enterprise HRMS and workforce operations platform for OFC360.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OFC360 – Enterprise Workforce Platform',
    description:
      'Enterprise HRMS and workforce operations platform for OFC360.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${inter.className} bg-[#F3F2EF] dark:bg-neutral-950 text-[#171717] dark:text-neutral-100 antialiased selection:bg-[#0A66C2]/15 selection:text-[#0A66C2] overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
