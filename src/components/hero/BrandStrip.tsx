import React from 'react';
import { brandPlaceholders } from '../../data/brandPlaceholders';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';

type BrandStripProps = {
  isStatic: boolean;
  layout?: ViewportLayout;
};

const focusRing =
'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400';

/*
  LAUNCH NOTE: This strip is hidden at launch if no approved client logos exist.
  It currently shows neutral placeholders only — never ship invented or unapproved logos.
*/
export function BrandStrip({ isStatic, layout = 'responsive' }: BrandStripProps) {
  const gutter = pickLayout(layout, 'px-4 lg:px-6', 'px-6', 'px-4');

  const pills = brandPlaceholders.map((logo) =>
  <li key={logo.id} className="shrink-0">
      <div
      role="img"
      aria-label={logo.alt}
      className="h-11 w-32 rounded-pill border border-hairline-dark bg-ink-900" />
    
    </li>
  );

  return (
    <div className="py-6">
      {isStatic ?
      <div
        role="region"
        aria-label="Logo placeholders"
        tabIndex={0}
        className={cn('overflow-x-auto rounded-card', focusRing)}>
        
          <ul className={cn('mx-auto flex w-max gap-4', gutter)}>{pills}</ul>
        </div> :

      <div
        role="region"
        aria-label="Logo placeholders, scrolling. Hover or focus to pause."
        tabIndex={0}
        className={cn('brand-marquee overflow-hidden rounded-card', focusRing)}>
        
          <div className="brand-marquee-track flex w-max">
            <ul className="flex gap-4 pr-4">{pills}</ul>
            <ul aria-hidden="true" className="flex gap-4 pr-4">
              {pills}
            </ul>
          </div>
        </div>
      }
    </div>);

}