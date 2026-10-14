import type { Metadata } from 'next';
import { siteConfig } from './site';

export function metadataForPath(path: string): Metadata {
  const route = siteConfig.publicRoutes.find((item) => item.path === path);
  if (!route) throw new Error(`Missing SEO metadata for public route: ${path}`);

  const ogImage = `${siteConfig.url}/og?title=${encodeURIComponent(route.title)}&description=${encodeURIComponent(route.description)}`;

  return {
    title: { absolute: route.title },
    description: route.description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: route.title,
      description: route.description,
      url: path,
      images: [{ url: ogImage, width: 1200, height: 630, alt: route.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: route.title,
      description: route.description,
      images: [ogImage],
    },
  };
}
