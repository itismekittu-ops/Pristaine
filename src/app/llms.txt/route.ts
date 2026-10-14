import { siteConfig } from '../../config/site';

export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.mission}`,
    '',
    '## Key pages',
    ...siteConfig.publicRoutes.map((route) => `- [${route.title.split(' | ')[0]}](${siteConfig.url}${route.path === '/' ? '/' : route.path}): ${route.summary}`),
    '',
    '## Content status',
    'Dedicated service detail pages and full Insights articles are not included in the current UI migration and are not listed as published resources.',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
