import type { Metadata } from 'next';
import { Petrona, Albert_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Petrona({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE = 'https://madbenofficial.github.io/rosetta/';

export const metadata: Metadata = {
  title: 'Rosetta - two descriptions, one reconciled intent',
  description:
    'Two people describe the same thing in their own words. A Mediator weaves a single reconciled specification and marks where they truly diverge, settled under GenLayer validator consensus on the count of real disagreements.',
  metadataBase: new URL(SITE),
  openGraph: {
    title: 'Rosetta',
    description:
      'On-chain intent reconciliation: two independent descriptions, one reconciled spec, a margin of real divergences.',
    url: SITE,
    siteName: 'Rosetta',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rosetta',
    description: 'Two descriptions, one reconciled intent, settled on GenLayer.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
