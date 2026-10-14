'use client';

import React, { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { calendlyPrivacyUrl, calendlyUrl } from '../../data/cookieCategories';
import { cn } from '../../utils/cn';
import { cookieIconButtonStyles, cookieInlineLinkStyles, cookieTextLinkStyles } from '../../utils/cookieStyles';
import { DURATION, EASE } from '../../utils/motion';
import { compactButtonStyles, withState } from '../../utils/navStyles';

type CalendlyNoticeProps = {
  open: boolean;
  onClose: () => void;
  /** Load booking in place */
  onContinue: () => void;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Trap focus, close on Escape and return focus on close. Off only for static previews. */
  interactive?: boolean;
  /** Lock page scrolling while open (off inside previews) */
  lockScroll?: boolean;
};

export function CalendlyNotice({
  open,
  onClose,
  onContinue,
  reducedMotion,
  interactive = true,
  lockScroll = true
}: CalendlyNoticeProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const active = open && interactive;

  useFocusTrap(dialogRef, active, continueRef);
  useScrollLock(open && lockScroll);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (trigger?.isConnected) requestAnimationFrame(() => trigger.focus());
    };
  }, [active]);

  const fade = { duration: reduced ? 0.15 : 0.2, ease: EASE };

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        key="calendly-notice"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}>
        
          <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: reduced ? 0.15 : DURATION.dropdown, ease: EASE }}
          className="w-full max-w-[400px] rounded-card border border-hairline-dark bg-ink-900 p-6 text-on-dark">
          
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="pt-2 text-h4 text-on-dark">
                Booking is provided by Calendly
              </h2>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(withState(cookieIconButtonStyles), '-mr-2 -mt-1')}>
              
                <XIcon size={20} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            <p id={descId} className="mt-2 text-body text-muted-on-dark">
              Calendly may set its own cookies when the booking page loads. Read{' '}
              <a
              href={calendlyPrivacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={withState(cookieInlineLinkStyles)}>
              
                Calendly's privacy policy
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              className={cn(withState(compactButtonStyles), 'px-6')}>
              
                Continue
              </button>
              <a
              href={calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={withState(cookieTextLinkStyles)}>
              
                Open in new tab
                <ExternalLinkIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only"> (opens Calendly in a new tab)</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}