import React from 'react';
import Link from 'next/link';
import { cn } from '../../utils/cn';
import { navLinkStyles, withState } from '../../utils/navStyles';
import { CurrentIndicator } from './CurrentIndicator';

type NavItemLinkProps = {
  to: string;
  current: boolean;
  children: React.ReactNode;
  /** Tighter right padding when followed by a chevron button */
  joined?: boolean;
};

export function NavItemLink({ to, current, children, joined = false }: NavItemLinkProps) {
  return (
    <Link
      href={to}
      aria-current={current ? 'page' : undefined}
      className={cn(withState(navLinkStyles), joined && 'pr-1', current && 'text-on-dark')}>
      
      {children}
      {current && <CurrentIndicator className={joined ? 'right-1' : undefined} />}
    </Link>);

}