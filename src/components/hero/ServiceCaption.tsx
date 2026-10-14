import React from 'react';
import { cn } from '../../utils/cn';
import type { HeroClip } from '../../types/hero';

type ServiceCaptionProps = {
  clips: HeroClip[];
  activeIndex: number;
};

export function ServiceCaption({ clips, activeIndex }: ServiceCaptionProps) {
  const active = clips[activeIndex] ?? clips[0];

  return (
    <div className="inline-flex items-center gap-3 rounded-pill border border-hairline-dark bg-ink-950/80 px-4 py-2 backdrop-blur-md">
      <p className="text-small text-on-dark">
        <span className="sr-only">Now showing: </span>
        {active.caption}
      </p>
      <span aria-hidden="true" className="h-4 border-l border-hairline-dark" />
      <div role="img" aria-label={`Clip ${activeIndex + 1} of ${clips.length}`} className="flex items-center gap-1">
        {clips.map((clip, index) =>
        <span
          key={clip.slug}
          className={cn(
            'h-2 rounded-pill transition-control duration-400',
            index === activeIndex ? 'w-6 bg-aqua-400' : 'w-2 bg-border-dark'
          )} />

        )}
      </div>
    </div>);

}