'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { DURATION, EASE } from '../../utils/motion';

type ProcessOrbProps = {
  /** Text centred in the orb */
  title: string;
  /** Orb diameter in px */
  size: number;
  /** 0–1 ring fill; null renders the static ring with no progress */
  progress: number | null;
  /** Number of scenes; draws a marker where each one completes */
  steps?: number;
  /** False while the outgoing title fades out before the next one fades in */
  titleVisible?: boolean;
  /** Swap the title with no movement (reduced motion) */
  instant?: boolean;
};

/** Decorative CSS orb with a thin progress ring. Hidden from assistive tech. */
export function ProcessOrb({
  title,
  size,
  progress,
  steps = 3,
  titleVisible = true,
  instant = false
}: ProcessOrbProps) {
  const gap = Math.round(size * 0.08);
  const outer = size + gap * 2;
  const transition = { duration: DURATION.scene, ease: EASE };
  const animated = progress !== null;

  return (
    <div aria-hidden="true" className="relative shrink-0" style={{ width: outer, height: outer }}>
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="49" className="stroke-hairline-dark" strokeWidth="0.4" />
        {animated &&
        <motion.circle
          cx="50"
          cy="50"
          r="49"
          className="stroke-on-dark"
          strokeWidth="0.4"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: progress ?? 0 }}
          transition={transition} />

        }
      </svg>

      {animated &&
      Array.from({ length: steps }, (_, i) => {
        const at = (i + 1) / steps;
        const reached = (progress ?? 0) >= at - 0.001;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${at * 360}deg) translateY(-${outer / 2 - 0.5}px)` }}>
            
              <span
              className={cn(
                'absolute -left-1 -top-1 block h-2 w-2 rounded-pill border transition-colors duration-800 ease-brand',
                reached ? 'border-on-dark bg-on-dark' : 'border-border-dark bg-ink-950'
              )} />
            
            </span>);

      })}

      <div className="process-orb absolute rounded-pill" style={{ inset: gap }} />

      <div className="absolute inset-0 grid place-items-center">
        <motion.p
          key={title}
          className={cn(
            'text-balance text-center font-heading font-semibold text-on-dark',
            size >= 300 ? 'text-h3' : 'text-h3-m'
          )}
          style={{ maxWidth: size * 0.56 }}
          initial={animated && !instant ? { opacity: 0, y: 8 } : false}
          animate={titleVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{
            duration: instant ? 0 : titleVisible ? DURATION.stepIn : DURATION.stepOut,
            ease: EASE
          }}>
          
          {title}
        </motion.p>
      </div>
    </div>);

}