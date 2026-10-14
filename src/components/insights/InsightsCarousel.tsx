'use client';

import React, { useId, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { InsightsEndPanel } from './InsightsEndPanel';
import { useSnapCarousel } from '../../hooks/useSnapCarousel';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { withState } from '../../utils/navStyles';
import { carouselNavStyles } from '../../utils/insightStyles';
import type { ViewportLayout } from '../../utils/layout';
import type { Insight } from '../../types/insight';

type InsightsCarouselProps = {
  insights: Insight[];
  layout: ViewportLayout;
  reduced: boolean;
};

/** Swipe carousel for touch, small screens and reduced motion. */
export function InsightsCarousel({ insights, layout, reduced }: InsightsCarouselProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const { index, atStart, atEnd, scrollToIndex } = useSnapCarousel(listRef, reduced);
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);
  const itemHeight = pick('aspect-card-mobile md:aspect-auto md:h-[560px]', 'h-[560px]', 'aspect-card-mobile');

  return (
    <div role="region" aria-label="Insights articles">
      <ul
        id={listId}
        ref={listRef}
        role="list"
        className={cn(
          'relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-[7.5%] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          pick('gap-2 md:gap-4', 'gap-4', 'gap-2')
        )}>
        
        {insights.map((insight, i) =>
        <li key={insight.slug} className={cn('w-[85%] shrink-0 snap-center', itemHeight)}>
            <InsightCard insight={insight} variant="carousel" layout={layout} onFocus={() => scrollToIndex(i)} />
          </li>
        )}
        <li className={cn('shrink-0 snap-center', pick('w-[85%] md:w-1/2', 'w-1/2', 'w-[85%]'), itemHeight)}>
          <InsightsEndPanel rounded onFocus={() => scrollToIndex(insights.length)} />
        </li>
      </ul>

      <div className="mt-6 flex justify-end gap-2 px-[7.5%]">
        <button
          type="button"
          aria-controls={listId}
          aria-label="Previous insight"
          disabled={atStart}
          onClick={() => scrollToIndex(index - 1)}
          className={withState(carouselNavStyles)}>
          
          <ChevronLeftIcon size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-controls={listId}
          aria-label="Next insight"
          disabled={atEnd}
          onClick={() => scrollToIndex(index + 1)}
          className={withState(carouselNavStyles)}>
          
          <ChevronRightIcon size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>);

}