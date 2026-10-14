'use client';

import React, { useId, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ProcessOrb } from './ProcessOrb';
import { ProcessStepContent } from './ProcessStepContent';
import { processSteps } from '../../data/processSteps';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePinnedSteps } from '../../hooks/usePinnedSteps';
import { useSequencedStep } from '../../hooks/useSequencedStep';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { DURATION, EASE } from '../../utils/motion';
import type { ViewportLayout } from '../../utils/layout';

type HowItWorksProps = {
  layout?: ViewportLayout;
  /** Force the reduced-motion version (previews); defaults to the visitor's setting */
  reducedMotion?: boolean;
  /** Previews only: freeze the pinned scene on one step at a fixed viewport height */
  sample?: {step: number;height: number;};
};

const SECTION_TITLE = 'How it works';

export function HowItWorks({ layout = 'responsive', reducedMotion, sample }: HowItWorksProps) {
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? !!systemReduced;
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const isDesktop = layout === 'responsive' ? isLargeScreen : layout === 'desktop';
  const pinned = isDesktop && !reduced;
  const { activeIndex, viewportHeight } = usePinnedSteps(
    sectionRef,
    processSteps.length,
    pinned && !sample
  );
  const active = sample ? sample.step : activeIndex;
  const { shown, visible } = useSequencedStep(active, reduced);
  const sceneHeight = sample ? sample.height : viewportHeight;
  const pick = (responsive: string, desktop: string, mobile: string) =>
  pickLayout(layout, responsive, desktop, mobile);

  const header =
  <header className="flex flex-col items-center gap-2 text-center">
      <h2
      id={headingId}
      className={cn('text-on-dark', pinned ? 'text-h2' : pick('text-h2-m md:text-h2', 'text-h2', 'text-h2-m'))}>
      
        {SECTION_TITLE}
      </h2>
    </header>;



  if (pinned) {
    return (
      <>
      <section
          ref={sectionRef}
          aria-labelledby={headingId}
          className="relative bg-ink-950 px-6"
          style={{ height: sample ? sceneHeight : sceneHeight * processSteps.length }}>
          
        <div
            className="sticky top-0 mx-auto flex max-w-content flex-col justify-center gap-12 pb-16 pt-24"
            style={{ height: sceneHeight }}>
            
          {header}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-16">
            <ol className="grid">
              {processSteps.map((step, index) => {
                  const isShown = index === shown;
                  const isVisible = isShown && visible;
                  return (
                    <motion.li
                      key={step.number}
                      aria-current={index === active ? 'step' : undefined}
                      className={cn('col-start-1 row-start-1', !isVisible && 'pointer-events-none')}
                      initial={false}
                      animate={
                      isVisible ?
                      { opacity: 1, y: 0 } :
                      isShown ?
                      { opacity: 0, y: -8 } :
                      { opacity: 0, y: 8 }
                      }
                      transition={{
                        duration: reduced || !isShown ? 0 : isVisible ? DURATION.stepIn : DURATION.stepOut,
                        ease: EASE
                      }}>
                      
                    <ProcessStepContent step={step} layout="desktop" />
                  </motion.li>);

                })}
            </ol>
            <ProcessOrb
                title={processSteps[shown].title}
                size={360}
                progress={(active + 1) / processSteps.length}
                steps={processSteps.length}
                titleVisible={visible}
                instant={reduced} />
              
          </div>
        </div>
      </section>
      </>);

  }

  return (
    <>
    <section
        ref={sectionRef}
        aria-labelledby={headingId}
        className={cn('bg-ink-950', pick('px-4 py-16 md:py-24 lg:px-6', 'px-6 py-24', 'px-4 py-16'))}>
        
      <div className="mx-auto flex max-w-content flex-col gap-12">
        {header}
        <div
            className={cn(
              'grid',
              pick(
                'gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-16',
                'grid-cols-[minmax(0,1fr)_auto] items-start gap-16',
                'gap-12'
              )
            )}>
            
          <ol className={cn('flex flex-col gap-16', pick('order-2 lg:order-1', 'order-1', 'order-2'))}>
            {processSteps.map((step) =>
              <li key={step.number}>
                <ProcessStepContent step={step} layout={layout} />
              </li>
              )}
          </ol>
          <div className={cn('flex justify-center', pick('order-1 lg:order-2', 'order-2', 'order-1'))}>
            <ProcessOrb title={SECTION_TITLE} size={isDesktop ? 360 : 248} progress={null} />
          </div>
        </div>
      </div>
    </section>
    </>);

}