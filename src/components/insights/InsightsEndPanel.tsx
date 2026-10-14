'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '../../utils/cn';
import { withState } from '../../utils/navStyles';
import { outlineButtonStyles } from '../../utils/insightStyles';
import type { InteractionState } from '../../utils/navStyles';

type InsightsEndPanelProps = {
  rounded?: boolean;
  /** Static snapshot of the button state (spec only) */
  buttonState?: InteractionState;
  onFocus?: () => void;
};

export function InsightsEndPanel({ rounded = false, buttonState, onFocus }: InsightsEndPanelProps) {
  return (
    <div
      data-cursor="hide"
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center',
        rounded && 'rounded-card'
      )}>
      
      <h3 className="text-h3-m text-on-light md:text-h3">Want more?</h3>
      {buttonState ?
      <span className={withState(outlineButtonStyles, buttonState)}>View all insights</span> :

      <Link href="/insights" onFocus={onFocus} className={withState(outlineButtonStyles)}>
          View all insights
        </Link>
      }
    </div>);

}