'use client';

import React, { useEffect, useId, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { InfoPopover } from './InfoPopover';
import { cn } from '../../utils/cn';
import { faqTriggerStyles } from '../../utils/faqStyles';
import { withState } from '../../utils/navStyles';
import type { InteractionState } from '../../utils/navStyles';
import type { FaqEntry } from '../../types/faq';

type FaqItemProps = {
  faq: FaqEntry;
  open: boolean;
  onToggle: (id: string) => void;
  reduced: boolean;
  /** Question type size for the current layout */
  questionClass: string;
  /** Previews only */
  state?: InteractionState;
  infoOpen?: boolean;
  infoState?: InteractionState;
};

const EXPAND_MS = 250;

export function FaqItem({ faq, open, onToggle, reduced, questionClass, state, infoOpen, infoState }: FaqItemProps) {
  const baseId = useId();
  const buttonId = `${baseId}-question`;
  const panelId = `${baseId}-answer`;
  // Let the info popover overflow the panel only once it has finished expanding
  const [settled, setSettled] = useState(open);

  useEffect(() => {
    if (!open) {
      setSettled(false);
      return;
    }
    if (reduced) {
      setSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setSettled(true), EXPAND_MS);
    return () => window.clearTimeout(timer);
  }, [open, reduced]);

  const duration = reduced ? 'duration-0' : 'duration-250 motion-reduce:duration-0';

  return (
    <div className="py-1">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(faq.id)}
          className={cn(withState(faqTriggerStyles, state), questionClass)}>
          
          <span>{faq.question}</span>
          <ChevronDownIcon
            size={20}
            strokeWidth={1.75}
            aria-hidden="true"
            className={cn('shrink-0 transition-transform ease-brand', duration, open && 'rotate-180')} />
          
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          'grid transition-[grid-template-rows,visibility] ease-brand',
          duration,
          open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
        )}>
        
        <div className={cn('min-h-0', open && settled ? 'overflow-visible' : 'overflow-hidden')}>
          <div className="flex items-start gap-2 px-4 pb-6 pt-1">
            <p className="max-w-prose flex-1 text-body text-on-light">{faq.answer}</p>
            {faq.info && <InfoPopover info={faq.info} reduced={reduced} defaultOpen={infoOpen} state={infoState} />}
          </div>
        </div>
      </div>
    </div>);

}