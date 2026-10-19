'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';

import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { DURATION, EASE } from '../../utils/motion';

type Stage = {
  id: string;
  title: string;
  description: string;
  image: string;
};

const STAGES: Stage[] = [
  {
    id: 'discover',
    title: 'Discover',
    description: 'Understand the business, identify its challenges, and find opportunities for AI.',
    image: '/process/discover.webp'
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Define the solution, agree on scope, and plan the necessary architecture and integrations.',
    image: '/process/design.webp'
  },
  {
    id: 'integrate',
    title: 'Integrate',
    description: 'Build the agreed AI capabilities and connect the relevant systems and workflows.',
    image: '/process/integrate.webp'
  },
  {
    id: 'validate-launch',
    title: 'Validate & Launch',
    description: 'Test realistic scenarios, refine the solution, and launch when ready.',
    image: '/process/validate-launch.webp'
  }
];

export function ProcessJourney() {
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const systemReduced = useReducedMotion();
  const reduced = !!systemReduced;
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const scrollDriven = isDesktop && !reduced;
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  });

  const indexFromProgress = (value: number) =>
    Math.min(STAGES.length - 1, Math.max(0, Math.floor(value * STAGES.length)));

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setActive(indexFromProgress(value));
  });

  // Re-sync after mount so the active stage is correct when the page
  // loads at a saved scroll position (no change event fires then).
  useEffect(() => {
    if (!scrollDriven) return;
    setActive(indexFromProgress(scrollYProgress.get()));
  }, [scrollDriven, scrollYProgress]);

  if (scrollDriven) {
    return (
      <section
        ref={sectionRef}
        aria-labelledby={headingId}
        className="relative isolate bg-ink-950"
        style={{ height: `${STAGES.length + 1}00vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-content grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-center gap-16 px-6">
            <div className="flex flex-col gap-10">
              <h2 id={headingId} className="text-h2-m text-on-dark md:text-h2">
                How we work
              </h2>

              <div className="grid">
                {STAGES.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    className={cn(
                      'col-start-1 row-start-1 flex flex-col gap-4',
                      index !== active && 'pointer-events-none'
                    )}
                    initial={false}
                    animate={{
                      opacity: index === active ? 1 : 0,
                      y: index === active ? 0 : index < active ? -12 : 12
                    }}
                    transition={{ duration: index === active ? DURATION.stepIn : DURATION.stepOut, ease: EASE }}
                    aria-hidden={index !== active}
                  >
                    <span aria-hidden="true" className="outline-numeral text-display-m">
                      {`0${index + 1}`}
                    </span>
                    <h3 className="text-h2-m text-on-dark md:text-h3">{stage.title}</h3>
                    <p className="max-w-prose text-body-lg-m text-muted-on-dark md:text-body-lg">
                      {stage.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <ol className="flex flex-col gap-3">
                {STAGES.map((stage, index) => (
                  <li
                    key={stage.id}
                    aria-current={index === active ? 'step' : undefined}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        'text-small font-medium tabular-nums',
                        index === active ? 'text-aqua-400' : 'text-muted-on-dark'
                      )}
                    >
                      {`0${index + 1}`}
                    </span>
                    <span
                      className={cn(
                        'text-small font-medium',
                        index === active ? 'text-on-dark' : 'text-muted-on-dark'
                      )}
                    >
                      {stage.title}
                    </span>
                  </li>
                ))}
              </ol>

              <div
                aria-hidden="true"
                className="relative h-1 overflow-hidden rounded-pill bg-on-dark/10"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-pill bg-aqua-400"
                  style={{ scaleX: scrollYProgress }}
                />
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-hairline-dark">
              {STAGES.map((stage, index) => (
                <motion.img
                  key={stage.id}
                  src={stage.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={false}
                  animate={{
                    opacity: index === active ? 1 : 0,
                    scale: index === active ? 1 : 1.04
                  }}
                  transition={{ duration: DURATION.card, ease: EASE }}
                />
              ))}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/70 to-transparent"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      className="bg-ink-950 px-4 py-16 md:py-24 lg:px-6"
    >
      <div className="mx-auto flex max-w-content flex-col gap-12">
        <h2 id={headingId} className="text-h2-m text-on-dark md:text-h2">
          How we work
        </h2>
        <ol className="flex flex-col gap-8 md:gap-12">
          {STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className="flex flex-col overflow-hidden rounded-card border border-hairline-dark bg-ink-900/60"
            >
              <img
                src={stage.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="flex flex-col gap-3 p-6 md:p-8">
                <span aria-hidden="true" className="outline-numeral text-h3-m md:text-h3">
                  {`0${index + 1}`}
                </span>
                <h3 className="text-h4 text-on-dark">{stage.title}</h3>
                <p className="max-w-prose text-body text-muted-on-dark">{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
