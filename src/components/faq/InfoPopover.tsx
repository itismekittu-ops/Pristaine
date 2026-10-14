'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { faqInfoButtonStyles } from '../../utils/faqStyles';
import { withState } from '../../utils/navStyles';
import type { InteractionState } from '../../utils/navStyles';
import type { FaqInfo } from '../../types/faq';

type InfoPopoverProps = {
  info: FaqInfo;
  reduced: boolean;
  /** Previews only: start open */
  defaultOpen?: boolean;
  /** Previews only: freeze the button in one state */
  state?: InteractionState;
};

/**
 * Opens on click or keyboard focus and stays open until dismissed:
 * Escape (focus returns to the icon), a second click, or a click outside.
 */
export function InfoPopover({ info, reduced, defaultOpen = false, state }: InfoPopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const popoverId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const skipFocusOpen = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      const button = buttonRef.current;
      if (button && document.activeElement !== button) {
        skipFocusOpen.current = true;
        button.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
    if (skipFocusOpen.current) {
      skipFocusOpen.current = false;
      return;
    }
    if (event.currentTarget.matches(':focus-visible')) setOpen(true);
  };

  return (
    <div ref={wrapRef} className="relative -mr-2 -mt-2 shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label={info.label}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-describedby={open ? popoverId : undefined}
        onFocus={handleFocus}
        onClick={() => setOpen((value) => !value)}
        className={withState(faqInfoButtonStyles, state)}>
        
        <InfoIcon size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <div
        id={popoverId}
        role="note"
        className={cn(
          'absolute right-0 top-full z-10 mt-2 w-[264px] origin-top-right rounded-card border border-hairline-light bg-surface-50 p-4 text-small text-on-light transition-[opacity,transform,visibility] ease-brand',
          reduced ? 'duration-0' : 'duration-150 motion-reduce:duration-0',
          open ? 'visible scale-100 opacity-100' : 'invisible scale-[0.96] opacity-0'
        )}>
        
        {info.text}
      </div>
    </div>);

}