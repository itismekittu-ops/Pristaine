import type { MetadataRoute } from 'next';
import { siteConfig } from '../config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'], allow: '/' },
      // Conservative default pending the owner's explicit training-crawler decision (AEO/SEO OQ-02).
      { userAgent: ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended'], disallow: '/' },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
