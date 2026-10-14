'use client';

import React, { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import { InsightsCarousel } from './InsightsCarousel';
import { PinnedInsightsSlider } from './PinnedInsightsSlider';
import { insights } from '../../data/insights';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';
import type { InsightsSample } from '../../types/insight';

type InsightsProps = {
  layout?: ViewportLayout;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Previews only: render just the pinned stage, frozen at one position */
  sample?: InsightsSample;
};

const TITLE = 'Insights';
const INTRO = 'Practical notes on choosing, testing and running AI assistants in a small business.';

export function Insights({ layout = 'responsive', reducedMotion, sample }: InsightsProps) {
  const headingId = useId();
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const isWide = useMediaQuery('(min-width: 768px)');
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
  const wide = layout === 'responsive' ? isWide : layout === 'desktop';
  const touch = layout === 'responsive' && isTouch;
  const pinned = wide && !reduced && !touch;
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);

  if (sample) {
    return (
      <section aria-label={TITLE} className="h-full bg-surface-50">
        <PinnedInsightsSlider insights={insights} sample={sample} />
      </section>);

  }

  return (
    <section
      aria-labelledby={headingId}
      className={cn('bg-surface-50 text-on-light', !pinned && pick('pb-16 md:pb-24', 'pb-24', 'pb-16'))}>
      
      <header
        className={cn(
          'mx-auto flex max-w-content flex-col items-center gap-4 text-center',
          pinned ? 'px-6 pt-24' : pick('px-4 pb-8 pt-16 md:pb-12 md:pt-24 lg:px-6', 'px-6 pb-12 pt-24', 'px-4 pb-8 pt-16')
        )}>
        
        <h2 id={headingId} className={cn('text-on-light', pinned ? 'text-h2' : pick('text-h2-m md:text-h2', 'text-h2', 'text-h2-m'))}>
          {TITLE}
        </h2>
        <p
          className={cn(
            'max-w-prose text-slate-600',
            pinned ? 'text-body-lg' : pick('text-body-lg-m md:text-body-lg', 'text-body-lg', 'text-body-lg-m')
          )}>
          
          {INTRO}
        </p>
      </header>

      {pinned ?
      <PinnedInsightsSlider insights={insights} /> :

      <InsightsCarousel insights={insights} layout={layout} reduced={reduced} />
      }
    </section>);

}