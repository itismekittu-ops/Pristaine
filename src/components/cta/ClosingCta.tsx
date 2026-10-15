'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { primaryButtonStyles, withState } from '../../utils/navStyles';
import { useSaveData } from '../../hooks/useSaveData';
import type { InteractionState } from '../../utils/navStyles';
import type { ViewportLayout } from '../../utils/layout';

type ClosingCtaProps = {
  layout?: ViewportLayout;
  reducedMotion?: boolean;
  buttonState?: InteractionState;
};

const CTA_STILL = '/cta-still.webp';
const CTA_VIDEO = {
  webm: '/videos/cta-loop.webm',
  mp4: '/videos/cta-loop.mp4',
};
const HEADLINE = 'Ready to see what AI can do?';

export function ClosingCta({ layout = 'responsive', reducedMotion, buttonState }: ClosingCtaProps) {
  const headingId = useId();
  const systemReduced = useReducedMotion();
  const saveData = useSaveData();
  const reduced = reducedMotion ?? !!systemReduced;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const showVideo = !reduced && !saveData && !videoFailed;
  const pick = (responsive: string, desktop: string, mobile: string) =>
    pickLayout(layout, responsive, desktop, mobile);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, [showVideo]);

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'relative isolate flex items-center justify-center overflow-hidden bg-ink-950',
        pick('h-[400px] px-4 md:h-[480px] lg:px-6', 'h-[480px] px-6', 'h-[400px] px-4')
      )}>

      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        {showVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={CTA_STILL}
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={() => setVideoFailed(true)}
          >
            <source src={CTA_VIDEO.webm} type="video/webm" />
            <source src={CTA_VIDEO.mp4} type="video/mp4" />
          </video>
        ) : (
          <img
            src={CTA_STILL}
            alt=""
            className={cn('absolute inset-0 h-full w-full object-cover object-center', !reduced && 'cta-drift')}
          />
        )}

        <div className="absolute inset-0 bg-ink-950/35" />
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
    </section>
  );
}
