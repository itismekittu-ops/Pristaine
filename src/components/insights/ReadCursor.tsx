'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../../utils/motion';
import type { MotionValue } from 'framer-motion';
import type { CursorMode } from '../../types/insight';

type ReadCursorProps = {
  x: MotionValue<number> | number;
  y: MotionValue<number> | number;
  mode: CursorMode;
  pressed?: boolean;
  /** Skip the grow/shrink animation (static previews) */
  instant?: boolean;
};

/** Small dot ≈ 12px of the 88px disc */
const DOT_SCALE = 0.14;

/** Decorative 88px aqua disc that follows the mouse over the pinned stage. */
export function ReadCursor({ x, y, mode, pressed = false, instant = false }: ReadCursorProps) {
  const target =
  mode === 'read' ?
  { scale: pressed ? 0.9 : 1, opacity: 1 } :
  mode === 'dot' ?
  { scale: DOT_SCALE, opacity: 1 } :
  { scale: DOT_SCALE, opacity: 0 };

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-10 -ml-11 -mt-11 flex h-[88px] w-[88px] items-center justify-center rounded-pill bg-aqua-400"
      style={{ x, y }}
      initial={false}
      animate={target}
      transition={{ duration: instant ? 0 : pressed ? 0.12 : 0.2, ease: EASE }}>
      
      <motion.span
        className="font-sans text-small font-semibold text-ink-950"
        initial={false}
        animate={{ opacity: mode === 'read' ? 1 : 0 }}
        transition={{ duration: instant ? 0 : 0.15, ease: EASE }}>
        
        Read
      </motion.span>
    </motion.div>);

}