import React from 'react';
import { cn } from '../../utils/cn';

type CurrentIndicatorProps = {
  variant?: 'underline' | 'bar';
  className?: string;
};

/** Shape-based marker for the current page, paired with aria-current. */
export function CurrentIndicator({ variant = 'underline', className }: CurrentIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-pill border-aqua-400',
        variant === 'underline' ? 'bottom-1 left-3 right-3 border-t-2' : 'inset-y-3 left-0 border-l-2',
        className
      )} />);


}