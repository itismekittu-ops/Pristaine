'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';
import type { VideoSources } from '../../types/hero';

type HeroMediaProps = {
  poster: string;
  videoSrc?: VideoSources;
  reduced: boolean;
  layout: ViewportLayout;
};

export function HeroMedia({ poster, videoSrc, reduced, layout }: HeroMediaProps) {
  const posterClass = pickLayout(layout, 'hero-poster', 'hero-poster-desktop', 'hero-poster-mobile');
  const scrimClass = pickLayout(layout, 'hero-scrim', 'hero-scrim-desktop', 'hero-scrim-mobile');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const showVideo = !reduced && !!videoSrc && !videoFailed;

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, [showVideo]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-ink-950">
      {showVideo && videoSrc ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className={cn('absolute inset-0 h-full w-full object-cover', posterClass)}
          onError={() => setVideoFailed(true)}
        >
          <source src={videoSrc.webm} type="video/webm" />
          <source src={videoSrc.mp4} type="video/mp4" />
        </video>
      ) : (
        <img
          src={poster}
          alt=""
          className={cn('absolute inset-0 h-full w-full object-cover', posterClass, !reduced && 'hero-drift')}
        />
      )}

      <div className={cn('absolute inset-0', scrimClass)} />
      <div className="hero-bottom-fade absolute inset-x-0 bottom-0" />
    </div>
  );
}
