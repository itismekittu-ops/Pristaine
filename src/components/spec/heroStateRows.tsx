import React from 'react';
import { ArrowUpIcon, XIcon } from 'lucide-react';
import { ChatBarSample } from './ChatBarSample';
import { cn } from '../../utils/cn';
import {
  panelPrimaryButtonStyles,
  privacyLinkStyles,
  secondaryButtonStyles,
  submitButtonStyles } from
'../../utils/heroStyles';
import { chevronButtonStyles, withState } from '../../utils/navStyles';
import type { StateRow } from '../../types/spec';

const stripLabel = { default: 'Scrolling', hover: 'Paused', focus: 'Paused', active: 'Paused' };

export const heroStateRows: StateRow[] = [
{
  label: 'Chat bar',
  note: 'Active shows typing',
  render: (s) => <ChatBarSample state={s} />
},
{
  label: 'Submit button',
  note: 'Named “Send question”',
  render: (s) =>
  <span className={withState(submitButtonStyles, s)}>
        <ArrowUpIcon size={20} strokeWidth={1.5} aria-hidden="true" />
      </span>

},
{
  label: 'Privacy Policy link',
  note: 'Underlined, not color alone',
  render: (s) =>
  <span className="whitespace-nowrap text-small text-muted-on-dark">
        Sensitive details. <span className={withState(privacyLinkStyles, s)}>Privacy Policy</span>
      </span>

},
{
  label: 'Brand strip',
  note: 'Pauses on hover and focus',
  render: (s) =>
  <span
    className={cn(
      'inline-flex items-center gap-3 rounded-card p-1',
      s === 'focus' && 'outline outline-2 outline-offset-2 outline-aqua-400'
    )}>
    
        <span className="flex h-11 items-center whitespace-nowrap rounded-pill border border-hairline-dark bg-ink-950 px-6 text-small text-muted-on-dark">
          Logo placeholder
        </span>
        <span className="whitespace-nowrap text-small text-on-dark">{stripLabel[s]}</span>
      </span>

},
{
  label: 'Panel: Book a Consultation',
  note: 'Aqua fill, ink text, no glow',
  render: (s) => <span className={withState(panelPrimaryButtonStyles, s)}>Book a Consultation</span>
},
{
  label: 'Panel: Send message',
  note: '1px outline',
  render: (s) => <span className={withState(secondaryButtonStyles, s)}>Send message</span>
},
{
  label: 'Panel: Close',
  note: '44px target, Escape also closes',
  render: (s) =>
  <span className={withState(chevronButtonStyles, s)}>
        <XIcon size={20} strokeWidth={1.5} aria-hidden="true" />
      </span>

}];