'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { primaryButtonStyles, withState } from '../../utils/navStyles';
import type { InteractionState } from '../../utils/navStyles';
import type { ViewportLayout } from '../../utils/layout';

type ClosingCtaProps = {
  layout?: ViewportLayout;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Previews only: render the button in a fixed state */
  buttonState?: InteractionState;
};

const CTA_STILL = "/cta-still.webp";
const HEADLINE = 'Ready to see what AI can do?';

export function ClosingCta({ layout = 'responsive', reducedMotion, buttonState }: ClosingCtaProps) {
  const headingId = useId();
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'relative isolate flex items-center justify-center overflow-hidden bg-ink-950',
        pick('h-[400px] px-4 md:h-[480px] lg:px-6', 'h-[480px] px-6', 'h-[400px] px-4')
      )}>
      
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        {/*
           Stand-in for the slow looping video. When the clip is ready, render
           <video autoPlay muted loop playsInline poster={CTA_STILL}> here when motion is allowed,
           and keep this static still when the visitor prefers reduced motion.
          */}
        <img
          src={CTA_STILL}
          alt=""
          className={cn('absolute inset-0 h-full w-full object-cover object-center', !reduced && 'cta-drift')} />
        
        {/* Light ink-950 scrim at 35% so the edge streaks stay bright */}
        <div className="absolute inset-0 bg-ink-950/35" />
        {/* Soft ink-950 core (60%, ~700 × 300) behind the headline and button only */}
        <div className="cta-scrim-core absolute inset-0" />
      </div>

      <div className="flex w-full max-w-headline flex-col items-center gap-8 text-center">
        <h2
          id={headingId}
          className={cn('text-on-dark [text-wrap:balance]', pick('text-display-m md:text-display', 'text-display', 'text-display-m'))}>
          
          {HEADLINE}
        </h2>
        <Link
          href="/book"
          className={cn(
            buttonState ? withState(primaryButtonStyles, buttonState) : withState(primaryButtonStyles),
            'px-6'
          )}>
          
          Book a Consultation
        </Link>
      </div>
    </section>);

}