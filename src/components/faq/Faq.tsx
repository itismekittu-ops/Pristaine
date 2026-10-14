'use client';

import React, { useId, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FaqItem } from './FaqItem';
import { faqs } from '../../data/faqs';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import type { ViewportLayout } from '../../utils/layout';
import type { InteractionState } from '../../utils/navStyles';

type FaqProps = {
  layout?: ViewportLayout;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Previews only: items open on first render */
  initialOpen?: string[];
  /** Previews only: freeze one question in a state */
  forcedState?: {id: string;state: InteractionState;};
  /** Previews only: show the info popover open, or freeze its button in a state */
  infoOpen?: boolean;
  infoState?: InteractionState;
};

const TITLE = 'Frequently asked questions';

export function Faq({ layout = 'responsive', reducedMotion, initialOpen = [], forcedState, infoOpen, infoState }: FaqProps) {
  const headingId = useId();
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const [openIds, setOpenIds] = useState<string[]>(initialOpen);
  const pick = (responsive: string, desktop: string, mobile: string) => pickLayout(layout, responsive, desktop, mobile);

  const toggle = (id: string) =>
  setOpenIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);

  return (
    <>
    <section
        aria-labelledby={headingId}
        className={cn('bg-white text-on-light', pick('px-4 py-16 md:py-24 lg:px-6', 'px-6 py-24', 'px-4 py-16'))}>
        
      <div className="mx-auto max-w-chat">
        <h2
            id={headingId}
            className={cn('text-center text-on-light', pick('mb-8 text-h2-m md:mb-12 md:text-h2', 'mb-12 text-h2', 'mb-8 text-h2-m'))}>
            
          {TITLE}
        </h2>

        <ul className="divide-y divide-hairline-light">
          {faqs.map((faq) =>
            <li key={faq.id}>
              <FaqItem
                faq={faq}
                open={openIds.includes(faq.id)}
                onToggle={toggle}
                reduced={reduced}
                questionClass={pick('text-body-lg-m md:text-h4', 'text-h4', 'text-body-lg-m')}
                state={forcedState?.id === faq.id ? forcedState.state : undefined}
                infoOpen={infoOpen}
                infoState={infoState} />
              
            </li>
            )}
        </ul>
      </div>
    </section>
    </>);

}