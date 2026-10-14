import React from 'react';
import { ArrowRightIcon, ChevronDownIcon, MenuIcon } from 'lucide-react';
import { Logo } from '../navbar/Logo';
import { CurrentIndicator } from '../navbar/CurrentIndicator';
import { services } from '../../data/services';
import { cn } from '../../utils/cn';
import {
  chevronButtonStyles,
  compactButtonStyles,
  dropdownItemStyles,
  menuButtonStyles,
  navLinkStyles,
  primaryButtonStyles,
  sheetItemStyles,
  viewAllLinkStyles,
  withState } from
'../../utils/navStyles';
import type { StateRow } from '../../types/spec';

const sampleService = services[0];
const SampleIcon = sampleService.icon;

export const navbarStateRows: StateRow[] = [
{ label: 'Logo', note: 'Links home', render: (s) => <Logo sample={s} /> },
{
  label: 'Nav link',
  render: (s) => <span className={withState(navLinkStyles, s)}>About</span>
},
{
  label: 'Nav link, current page',
  note: 'Aqua underline plus aria-current',
  render: (s) =>
  <span className={cn(withState(navLinkStyles, s), 'text-on-dark')}>
        About
        <CurrentIndicator />
      </span>

},
{
  label: 'Services chevron',
  note: 'Opens after 150ms on hover or focus',
  render: (s) =>
  <span className={withState(chevronButtonStyles, s)}>
        <ChevronDownIcon size={20} strokeWidth={1.5} aria-hidden="true" />
      </span>

},
{
  label: 'Primary button',
  note: 'Only element with a glow',
  render: (s) => <span className={withState(primaryButtonStyles, s)}>Book a Consultation</span>
},
{
  label: 'Compact button',
  note: 'Mobile, 360px and up',
  render: (s) => <span className={withState(compactButtonStyles, s)}>Book consultation</span>
},
{
  label: 'Menu button',
  note: 'Below 768px',
  render: (s) =>
  <span className={withState(menuButtonStyles, s)}>
        <MenuIcon size={24} strokeWidth={1.5} aria-hidden="true" />
      </span>

},
{
  label: 'Dropdown item',
  render: (s) =>
  <span className={cn(withState(dropdownItemStyles, s), 'max-w-xs')}>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-field border border-hairline-dark bg-ink-950 text-aqua-400">
          <SampleIcon size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-heading text-body font-semibold text-on-dark">{sampleService.name}</span>
          <span className="text-small text-muted-on-dark">{sampleService.description}</span>
        </span>
      </span>

},
{
  label: 'View all link',
  note: 'Underline on hover, not color alone',
  render: (s) =>
  <span className={withState(viewAllLinkStyles, s)}>
        View all services
        <ArrowRightIcon size={20} strokeWidth={1.5} aria-hidden="true" />
      </span>

},
{
  label: 'Menu sheet item',
  note: 'Mobile',
  render: (s) => <span className={cn(withState(sheetItemStyles, s), 'w-auto')}>About</span>
}];