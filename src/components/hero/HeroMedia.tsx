import React from 'react';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';

type HeroMediaProps = {
  poster: string;
  reduced: boolean;
  layout: ViewportLayout;
};

export function HeroMedia({ poster, reduced, layout }: HeroMediaProps) {
  const posterClass = pickLayout(layout, 'hero-poster', 'hero-poster-desktop', 'hero-poster-mobile');
  const scrimClass = pickLayout(layout, 'hero-scrim', 'hero-scrim-desktop', 'hero-scrim-mobile');

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-ink-950">
      {/*
         Stand-in for the looping service video. When clips are ready, render
         <video autoPlay muted loop playsInline poster={poster}> here when motion is allowed,
         and keep this static poster when the visitor prefers reduced motion.
         Covers the full hero (including behind the brand strip), anchored right and centre.
        */}
      <img
        src={poster}
        alt=""
        className={cn('absolute inset-0 h-full w-full object-cover', posterClass, !reduced && 'hero-drift')} />
      
      {/* Soft ink-950 scrim behind the centred text block */}
      <div className={cn('absolute inset-0', scrimClass)} />
      {/* Bottom 35% fades into solid ink-950, so there is no edge above or behind the strip */}
      <div className="hero-bottom-fade absolute inset-x-0 bottom-0" />
    </div>);

}