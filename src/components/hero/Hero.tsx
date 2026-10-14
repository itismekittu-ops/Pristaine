'use client';

import React, { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import { HeroMedia } from './HeroMedia';
import { ChatBar } from './ChatBar';
import { ServiceCaption } from './ServiceCaption';
import { BrandStrip } from './BrandStrip';
import { heroClips } from '../../data/heroClips';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';

type HeroProps = {
  layout?: ViewportLayout;
  /** Fill a preview frame instead of the viewport */
  contained?: boolean;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Previews render the headline as a paragraph to keep one H1 per page */
  headingAs?: 'h1' | 'p';
  activeClipIndex?: number;
};

export function Hero({
  layout = 'responsive',
  contained = false,
  reducedMotion,
  headingAs = 'h1',
  activeClipIndex = 0
}: HeroProps) {
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const headingId = useId();
  const Heading = headingAs;
  const clip = heroClips[activeClipIndex] ?? heroClips[0];
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);

  return (
    <>
    <section
        aria-labelledby={headingId}
        className={cn(
          'relative isolate flex w-full flex-col bg-ink-950',
          contained ? 'h-full' : 'h-hero min-h-hero max-h-hero'
        )}>
        
      <HeroMedia poster={clip.poster} reduced={reduced} layout={layout} />

      <div className={cn('flex flex-1 items-center pb-6 pt-24', pick('px-4 lg:px-6', 'px-6', 'px-4'))}>
        <div className="mx-auto flex w-full max-w-content flex-col items-center gap-8 text-center">
          <Heading
              id={headingId}
              className={cn(
                'mx-auto max-w-headline text-center font-heading font-semibold text-on-dark',
                pick('text-display-m md:text-display', 'text-display', 'text-display-m')
              )}>
              
            Reliable AI for every customer conversation
          </Heading>
          <ChatBar layout={layout} reducedMotion={reduced} />
          <ServiceCaption clips={heroClips} activeIndex={activeClipIndex} />
        </div>
      </div>

      <BrandStrip isStatic={reduced} layout={layout} />
    </section>
    </>);

}