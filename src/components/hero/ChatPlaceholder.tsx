'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { placeholderTopics } from '../../data/placeholderTopics';
import { useRotatingIndex } from '../../hooks/useRotatingIndex';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { DURATION, EASE } from '../../utils/motion';
import type { ViewportLayout } from '../../utils/layout';

type ChatPlaceholderProps = {
  layout: ViewportLayout;
  reduced: boolean;
};

/**
 * Decorative placeholder overlay (aria-hidden). The input keeps its fixed aria-label.
 * Only mounted while the input is unfocused and empty, so rotation stops on focus or typing.
 * Below 768px the prefix is shortened so the longest topic fits a 360px bar.
 */
export function ChatPlaceholder({ layout, reduced }: ChatPlaceholderProps) {
  const index = useRotatingIndex(placeholderTopics.length, !reduced, 3000);
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);
  const shortClass = pick('md:hidden', 'hidden', '');
  const longClass = pick('hidden md:inline', '', 'hidden');
  const topic = placeholderTopics[index];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap px-1 text-left text-muted-on-dark',
        pick('text-body md:text-body-lg-m', 'text-body-lg-m', 'text-body')
      )}>
      
      {reduced ?
      <>
          <span className={shortClass}>Ask about our services</span>
          <span className={longClass}>Ask a question about our services</span>
        </> :

      <>
          <span className={shortClass}>Ask about{'\u00A0'}</span>
          <span className={longClass}>Ask a question about{'\u00A0'}</span>
          {/* Fixed-width slot: sized by the longest topic so nothing shifts */}
          <span className="inline-grid overflow-hidden">
            {placeholderTopics.map((t) =>
          <span key={t} className="invisible col-start-1 row-start-1">
                {t}
              </span>
          )}
            <AnimatePresence initial={false}>
              <motion.span
              key={topic}
              className="col-start-1 row-start-1"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ duration: DURATION.card, ease: EASE }}>
              
                {topic}
              </motion.span>
            </AnimatePresence>
          </span>
        </>
      }
    </span>);

}