'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CookiePreferences } from './CookiePreferences';
import { CookieDetailsLink } from './CookieDetailsLink';
import { cookieBannerLine } from '../../data/cookieCategories';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { cookieButtonStyles } from '../../utils/cookieStyles';
import { DURATION, EASE } from '../../utils/motion';
import { withState } from '../../utils/navStyles';
import type { CookieConsentState } from '../../hooks/useCookieConsentState';
import type { ViewportLayout } from '../../utils/layout';

type CookieBannerProps = {
  consent: CookieConsentState;
  layout?: ViewportLayout;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Previews: skip moving focus into the panel on first render */
  autoFocusPanel?: boolean;
};

/**
 * Fixed overlay: never pushes page content and never locks scrolling.
 * Card at bottom left from 768px, full-width sheet below.
 */
export function CookieBanner({ consent, layout = 'responsive', reducedMotion, autoFocusPanel = true }: CookieBannerProps) {
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const { view } = consent;
  // After "Back" from the panel, return focus to Manage choices
  const cameFromManage = useRef(false);
  if (view === 'manage') cameFromManage.current = true;
  const focusManageButton = (el: HTMLButtonElement | null) => {
    if (el && cameFromManage.current) {
      cameFromManage.current = false;
      el.focus();
    }
  };

  useEffect(() => {
    if (view !== 'manage' || !autoFocusPanel) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') consent.closeManage();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [view, consent, autoFocusPanel]);

  const enter = reduced ? { opacity: 0 } : { opacity: 0, y: 16 };
  const shown = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <AnimatePresence>
      {view !== 'hidden' &&
      <motion.section
        key="cookie-banner"
        aria-label="Cookie choices"
        initial={enter}
        animate={shown}
        exit={{ ...enter, transition: { duration: reduced ? 0.15 : 0.2, ease: EASE } }}
        transition={{ duration: reduced ? 0.15 : DURATION.dropdown, ease: EASE }}
        className={cn(
          'fixed z-40 overflow-y-auto overscroll-contain border border-hairline-dark bg-ink-900 text-on-dark',
          pickLayout(
            layout,
            'inset-x-0 bottom-0 max-h-[85svh] rounded-t-card border-b-0 p-4 md:inset-x-auto md:bottom-6 md:left-6 md:w-[400px] md:rounded-card md:border-b md:p-6',
            'bottom-6 left-6 max-h-[85%] w-[400px] rounded-card p-6',
            'inset-x-0 bottom-0 max-h-[85%] rounded-t-card border-b-0 p-4'
          )
        )}>
        
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : DURATION.hover, ease: EASE }}>
            
              {view === 'manage' ?
            <CookiePreferences consent={consent} autoFocus={autoFocusPanel} /> :

            <div className="flex flex-col">
                  <p className="text-body text-on-dark">{cookieBannerLine}</p>
                  <div className="mt-1">
                    <CookieDetailsLink />
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <button type="button" onClick={consent.acceptAll} className={withState(cookieButtonStyles)}>
                      Accept all
                    </button>
                    <button type="button" onClick={consent.rejectNonEssential} className={withState(cookieButtonStyles)}>
                      Reject non-essential
                    </button>
                    <button
                  type="button"
                  ref={focusManageButton}
                  onClick={consent.openManage}
                  className={withState(cookieButtonStyles)}>
                  
                      Manage choices
                    </button>
                  </div>
                </div>
            }
            </motion.div>
          </AnimatePresence>
        </motion.section>
      }
    </AnimatePresence>);

}