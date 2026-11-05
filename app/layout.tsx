import type {Metadata} from 'next';
import {Plus_Jakarta_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'OFC360 – Enterprise Authentication',
  description:
    'Modern enterprise SaaS authentication and identity verification system for OFC360.',
  openGraph: {
    title: 'OFC360 – Enterprise Authentication',
    description:
      'Modern enterprise SaaS authentication and identity verification system for OFC360.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OFC360 – Enterprise Authentication',
    description:
      'Modern enterprise SaaS authentication and identity verification system for OFC360.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-400 overflow-x-hidden transition-colors duration-200"
        style={{fontFamily: 'var(--font-sans), sans-serif'}}
      >
        {children}
      </body>
    </html>
  );
}
