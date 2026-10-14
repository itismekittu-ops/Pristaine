'use client';

import React, { useState } from 'react';
import { ScaledFrame } from './ScaledFrame';
import { CookieBannerDemo } from './CookieBannerDemo';
import { CalendlyNotice } from '../cookies/CalendlyNotice';
import { cookieButtonStyles } from '../../utils/cookieStyles';
import { withState } from '../../utils/navStyles';
import { cn } from '../../utils/cn';

type MotionCompareDemoProps = {
  reducedMotion: boolean;
  label: string;
};

/** Replays the banner entrance and opens the Calendly notice in one motion mode */
export function MotionCompareDemo({ reducedMotion, label }: MotionCompareDemoProps) {
  const [replay, setReplay] = useState(0);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const name = reducedMotion ? 'reduced motion' : 'standard motion';

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setReplay((n) => n + 1)} className={cn(withState(cookieButtonStyles), 'w-auto')}>
          Replay banner<span className="sr-only">, {name}</span>
        </button>
        <button type="button" onClick={() => setNoticeOpen(true)} className={cn(withState(cookieButtonStyles), 'w-auto')}>
          Open Calendly notice<span className="sr-only">, {name}</span>
        </button>
      </div>
      <ScaledFrame width={1280} height={720} label={label}>
        <CookieBannerDemo key={replay} layout="desktop" label={`Banner preview, ${name}, scrollable`} reducedMotion={reducedMotion} />
        <CalendlyNotice
          open={noticeOpen}
          onClose={() => setNoticeOpen(false)}
          onContinue={() => setNoticeOpen(false)}
          reducedMotion={reducedMotion}
          lockScroll={false} />
        
      </ScaledFrame>
    </div>);

}