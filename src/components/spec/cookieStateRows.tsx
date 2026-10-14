import React from 'react';
import { CookieIcon, ExternalLinkIcon, XIcon } from 'lucide-react';
import { CookieToggle } from '../cookies/CookieToggle';
import { CookieDetailsLink } from '../cookies/CookieDetailsLink';
import { cn } from '../../utils/cn';
import {
  cookieButtonStyles,
  cookieIconButtonStyles,
  cookieInlineLinkStyles,
  cookieTextLinkStyles,
  footerLinkStyles } from
'../../utils/cookieStyles';
import { compactButtonStyles, withState } from '../../utils/navStyles';
import type { StateRow } from '../../types/spec';

export const footerStateRows: StateRow[] = [
{
  label: 'Footer link',
  note: 'Underline on hover, not colour alone',
  render: (s) => <span className={withState(footerLinkStyles, s)}>Voice AI</span>
},
{
  label: 'Cookie settings',
  note: 'Button; reopens the choices panel',
  render: (s) =>
  <span className={cn(withState(footerLinkStyles, s), 'text-small')}>
        <CookieIcon size={16} strokeWidth={1.75} aria-hidden="true" />
        Cookie settings
      </span>

}];


export const cookieStateRows: StateRow[] = [
{
  label: 'Choice button',
  note: 'Accept all, Reject non-essential, Manage choices and Save choices share it',
  render: (s) => <span className={cn(withState(cookieButtonStyles, s), 'w-48')}>Reject non-essential</span>
},
{ label: 'Cookie details link', note: 'To the Cookies section of the Privacy Policy', render: (s) => <CookieDetailsLink sample={s} /> },
{ label: 'Toggle, off', note: 'Analytics and Third-party services start off', render: (s) => <CookieToggle checked={false} sample={s} /> },
{ label: 'Toggle, on', render: (s) => <CookieToggle checked sample={s} /> },
{ label: 'Toggle, Necessary', note: 'Always on; only focus changes', render: (s) => <CookieToggle checked locked sample={s} /> },
{
  label: 'Close button',
  note: 'Panel and Calendly notice',
  render: (s) =>
  <span className={withState(cookieIconButtonStyles, s)}>
        <XIcon size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>

}];


export const calendlyStateRows: StateRow[] = [
{ label: 'Continue', note: 'Gets focus when the notice opens', render: (s) => <span className={cn(withState(compactButtonStyles, s), 'px-6')}>Continue</span> },
{
  label: 'Open in new tab',
  render: (s) =>
  <span className={withState(cookieTextLinkStyles, s)}>
        Open in new tab
        <ExternalLinkIcon size={16} strokeWidth={1.75} aria-hidden="true" />
      </span>

},
{
  label: "Calendly's privacy policy",
  note: 'Inline in the sentence',
  render: (s) => <span className={cn(withState(cookieInlineLinkStyles, s), 'text-body')}>Calendly's privacy policy</span>
}];