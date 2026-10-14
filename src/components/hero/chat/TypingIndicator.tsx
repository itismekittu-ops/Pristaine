'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TypingIndicator({ reduced }: {reduced: boolean;}) {
  if (reduced) {
    return <span className="text-small text-muted-on-dark">Writing...</span>;
  }
  return (
    <span className="flex h-6 items-center gap-1">
      <span className="sr-only">Writing...</span>
      {[0, 1, 2].map((i) =>
      <motion.span
        key={i}
        aria-hidden="true"
        className="h-2 w-2 rounded-pill bg-muted-on-dark"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }} />

      )}
    </span>);

}