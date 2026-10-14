import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteLayout } from '../components/SiteLayout';
import { siteConfig } from '../config/site';
import '../index.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.publicRoutes[0].title, template: '%s' },
  description: siteConfig.publicRoutes[0].description,
  applicationName: siteConfig.name,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
    title: siteConfig.publicRoutes[0].title,
    description: siteConfig.publicRoutes[0].description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.publicRoutes[0].title,
    description: siteConfig.publicRoutes[0].description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B1020',
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: `${siteConfig.url}/`,
    description: siteConfig.mission,
    areaServed: ['United States', 'Canada'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: `${siteConfig.url}/`,
    publisher: { '@id': `${siteConfig.url}/#organization` },
  },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteLayout>{children}</SiteLayout>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  );
}
