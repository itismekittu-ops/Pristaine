'use client';

import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { CalendlyNotice } from '../cookies/CalendlyNotice';
import { cn } from '../../utils/cn';
import { compactButtonStyles, withState } from '../../utils/navStyles';

type CalendlyDemoProps = {
  layout: 'desktop' | 'mobile';
  initialOpen?: boolean;
  reducedMotion?: boolean;
};

/**
 * Starts as a static snapshot when initialOpen; once the notice is opened from
 * the frame's own button it traps focus and closes on Escape, as on the site.
 */
export function CalendlyDemo({ layout, initialOpen = false, reducedMotion }: CalendlyDemoProps) {
  const [open, setOpen] = useState(initialOpen);
  const [userOpened, setUserOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('absolute inset-0 bg-ink-950', layout === 'desktop' ? 'px-6 pt-24' : 'px-4 pt-16')}>
      <h2 className={cn('text-on-dark', layout === 'desktop' ? 'text-h2' : 'text-h2-m')}>Book a consultation</h2>
      {loaded ?
      <div className="mt-8 flex h-[280px] max-w-[640px] flex-col items-center justify-center gap-2 rounded-card border border-hairline-dark bg-ink-900 p-6 text-center">
          <CalendarIcon size={24} strokeWidth={1.5} aria-hidden="true" className="text-muted-on-dark" />
          <p className="text-body text-muted-on-dark">Calendly scheduling loads here.</p>
          <button
          type="button"
          onClick={() => setLoaded(false)}
          className="mt-2 inline-flex h-11 items-center rounded-button px-3 text-small font-medium text-on-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400">
          
            Reset preview
          </button>
        </div> :

      <button
        type="button"
        onClick={() => {
          setUserOpened(true);
          setOpen(true);
        }}
        className={cn(withState(compactButtonStyles), 'mt-8 px-6')}>
        
          Choose a time
        </button>
      }
      <CalendlyNotice
        open={open}
        onClose={() => setOpen(false)}
        onContinue={() => {
          setOpen(false);
          setLoaded(true);
        }}
        reducedMotion={reducedMotion}
        interactive={userOpened}
        lockScroll={false} />
      
    </div>);

}