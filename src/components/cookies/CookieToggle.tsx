'use client';

import React from 'react';
import { cn } from '../../utils/cn';
import type { InteractionState } from '../../utils/navStyles';

type CookieToggleProps = {
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
  labelledBy?: string;
  describedBy?: string;
  /** Spec only: render a static snapshot of one state */
  sample?: InteractionState;
};

/** 44 × 44 switch: a 44 × 24 track inside a 44px-tall target, with an On/Off word so state is never colour alone */
export function CookieToggle({ checked, locked = false, onChange, labelledBy, describedBy, sample }: CookieToggleProps) {
  const track = cn(
    'relative block h-6 w-11 rounded-pill border transition-control duration-150',
    locked ?
    'border-hairline-dark bg-on-dark/10' :
    checked ?
    'border-aqua-400 bg-aqua-400' :
    'border-border-dark bg-ink-950',
    !locked &&
    !sample && (
    checked ? 'group-hover:bg-aqua-400/90 group-active:bg-aqua-400/80' : 'group-hover:border-muted-on-dark group-active:bg-on-dark/10'),
    !sample && 'group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-aqua-400',
    !locked && sample === 'hover' && (checked ? 'bg-aqua-400/90' : 'border-muted-on-dark'),
    !locked && sample === 'active' && (checked ? 'bg-aqua-400/80' : 'bg-on-dark/10'),
    sample === 'focus' && 'outline outline-2 outline-offset-2 outline-aqua-400'
  );
  const knob = cn(
    'absolute left-[3px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-pill transition-transform duration-150',
    checked ? 'translate-x-[20px]' : 'translate-x-0',
    locked ? 'bg-muted-on-dark' : checked ? 'bg-ink-950' : 'bg-muted-on-dark'
  );
  const word =
  <span aria-hidden="true" className="w-16 text-right text-small text-muted-on-dark">
      {locked ? 'Always on' : checked ? 'On' : 'Off'}
    </span>;


  if (sample) {
    return (
      <span className="inline-flex items-center gap-2">
        {word}
        <span className="inline-flex h-11 w-11 items-center justify-center">
          <span className={track}>
            <span className={knob} />
          </span>
        </span>
      </span>);

  }

  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      {word}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={locked || undefined}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onClick={() => {
          if (!locked) onChange?.(!checked);
        }}
        className={cn(
          'group inline-flex h-11 w-11 items-center justify-center rounded-pill focus:outline-none',
          locked && 'cursor-not-allowed'
        )}>
        
        <span className={track}>
          <span className={knob} />
        </span>
      </button>
    </span>);

}