'use client';

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ServiceCard } from './ServiceCard';
import { services } from '../../data/services';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { DURATION, EASE } from '../../utils/motion';
import type { ViewportLayout } from '../../utils/layout';

type WhatWeBuildProps = {
  layout?: ViewportLayout;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
};

/** Sticky offset: clears the floating navbar (16 + 64), then steps 16px per card. */
const STACK_TOP = 96;
const STACK_STEP = 16;

export function WhatWeBuild({ layout = 'responsive', reducedMotion }: WhatWeBuildProps) {
  const headingId = useId();
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isDesktop = layout === 'responsive' ? isLargeScreen : layout === 'desktop';
  const stacked = isDesktop && !reduced;
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);

  return (
    <section
      aria-labelledby={headingId}
      className={cn('bg-ink-950', pick('px-4 py-16 md:py-24 lg:px-6', 'px-6 py-24', 'px-4 py-16'))}>
      
      <div className="mx-auto flex max-w-content flex-col gap-12">
        <header className="mx-auto flex max-w-prose flex-col items-center gap-4 text-center">
          <h2 id={headingId} className={cn('text-on-dark', pick('text-h2-m md:text-h2', 'text-h2', 'text-h2-m'))}>
            What we build
          </h2>
          <p className={cn('text-muted-on-dark', pick('text-body-lg-m md:text-body-lg', 'text-body-lg', 'text-body-lg-m'))}>
            Four ways we put AI to work for growing businesses, from first conversation to everyday operations.
          </p>
        </header>

        {stacked ?
        <ol className="flex flex-col gap-16">
            {services.map((service, index) =>
          <motion.li
            key={service.slug}
            // A focused card rises above the cards stacked over it, so its focus ring is never covered
            className="sticky focus-within:z-10"
            style={{ top: STACK_TOP + index * STACK_STEP }}
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: DURATION.dropdown, ease: EASE }}>
            
                <ServiceCard service={service} layout={layout} />
              </motion.li>
          )}
          </ol> :

        <ul className="flex flex-col gap-6">
            {services.map((service) =>
          <li key={service.slug}>
                <ServiceCard service={service} layout={layout} />
              </li>
          )}
          </ul>
        }
      </div>
    </section>);

}