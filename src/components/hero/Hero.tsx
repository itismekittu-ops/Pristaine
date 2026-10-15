'use client';

import React, { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import { HeroMedia } from './HeroMedia';
import { ChatBar } from './ChatBar';
import { ServiceCaption } from './ServiceCaption';
import { BrandStrip } from './BrandStrip';
import { heroClips } from '../../data/heroClips';
import { useRotatingIndex } from '../../hooks/useRotatingIndex';
import { useSaveData } from '../../hooks/useSaveData';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';

const CLIP_INTERVAL_MS = 7000;

type HeroProps = {
  layout?: ViewportLayout;
  contained?: boolean;
  reducedMotion?: boolean;
  headingAs?: 'h1' | 'p';
  activeClipIndex?: number;
};

export function Hero({
  layout = 'responsive',
  contained = false,
  reducedMotion,
  headingAs = 'h1',
  activeClipIndex,
}: HeroProps) {
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const saveData = useSaveData();
  const headingId = useId();
  const Heading = headingAs;

  const canRotate = !reduced && !saveData;
  const rotatedIndex = useRotatingIndex(heroClips.length, canRotate, CLIP_INTERVAL_MS);
  const clipIndex = activeClipIndex ?? rotatedIndex;
  const clip = heroClips[clipIndex] ?? heroClips[0];
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

      <HeroMedia
  key={`${clip.videoSrc?.webm ?? ''}|${clip.videoSrc?.mp4 ?? ''}|${clip.poster}`}
  poster={clip.poster}
  videoSrc={clip.videoSrc}
  reduced={reduced || saveData}
  layout={layout}
/>

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
          <ServiceCaption clips={heroClips} activeIndex={clipIndex} />
        </div>
      </div>

      <BrandStrip isStatic={reduced} layout={layout} />
    </section>
    </>);
}
