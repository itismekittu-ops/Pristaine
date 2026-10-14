export type ViewportLayout = 'responsive' | 'desktop' | 'mobile';

/**
 * Picks responsive (media-query) classes for the live site, or fixed
 * desktop/mobile classes for fixed-width previews.
 */
export function pickLayout(
layout: ViewportLayout,
responsive: string,
desktop: string,
mobile: string)
: string {
  if (layout === 'responsive') return responsive;
  return layout === 'desktop' ? desktop : mobile;
}