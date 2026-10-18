import type { Metadata, Viewport } from 'next';
import 'lenis/dist/lenis.css';
import './globals.css';

/* TODO: set NEXT_PUBLIC_SITE_URL to your live domain so share links and previews resolve correctly */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const title = 'Nived | Freelance Web Developer in Kochi, Kerala';
const description =
  'Freelance full-stack developer building fast, hand-crafted websites, online stores and web apps for brands, academies and local businesses. Based in Kochi, working with clients worldwide.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: '%s | Nived' },
  description,
  applicationName: 'Nived',
  authors: [{ name: 'Nived' }],
  keywords: [
    'freelance web developer', 'web developer Kochi', 'web developer Kerala', 'Next.js developer',
    'full-stack developer', 'Shopify developer', 'website design', 'web apps',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Nived',
    title,
    description,
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0706',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Loaded as a stylesheet (not next/font) on purpose: the game and screen canvases draw text
          with the literal family names "VT323" and "Newsreader", which next/font would rename.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,500&family=JetBrains+Mono:wght@400&family=VT323&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
