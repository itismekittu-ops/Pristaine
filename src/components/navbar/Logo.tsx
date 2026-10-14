'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '../../utils/cn';
import { logoStyles, withState } from '../../utils/navStyles';
import type { InteractionState } from '../../utils/navStyles';

type LogoProps = {
  className?: string;
  textClassName?: string;
  onClick?: () => void;
  /** Render a static snapshot of a state (spec only) */
  sample?: InteractionState;
};

export function Logo({ className, textClassName = 'text-h4', onClick, sample }: LogoProps) {
  const wordmark =
  <span aria-hidden="true" className={cn('whitespace-nowrap', textClassName)}>
      Pr
      <span className="relative inline-block">
        ı
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-pill bg-aqua-400" />
      </span>
      staine
    </span>;


  if (sample) {
    return (
      <span className={cn(withState(logoStyles, sample), className)}>
        {wordmark}
        <span className="sr-only">Pristaine</span>
      </span>);

  }

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Pristaine, home"
      className={cn(withState(logoStyles), className)}>
      
      {wordmark}
    </Link>);

}