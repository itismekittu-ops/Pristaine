import type { MetadataRoute } from 'next';
import { siteConfig } from '../config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return siteConfig.publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path === '/' ? '/' : route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
