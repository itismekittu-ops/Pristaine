'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon } from 'lucide-react';
import { Logo } from './Logo';
import { NavItemLink } from './NavItemLink';
import { DesktopServicesMenu } from './DesktopServicesMenu';
import { MobileMenuSheet } from './MobileMenuSheet';
import { cn } from '../../utils/cn';
import { isCurrentPath } from '../../utils/navigation';
import {
  compactButtonStyles,
  menuButtonStyles,
  primaryButtonStyles,
  withState } from
'../../utils/navStyles';
import type { CtaPlacement, NavbarLayout } from '../../types/navigation';

type NavbarProps = {
  layout?: NavbarLayout;
  /** Render inside a preview frame instead of fixed to the viewport */
  contained?: boolean;
  defaultDropdownOpen?: boolean;
  defaultMenuOpen?: boolean;
  defaultServicesExpanded?: boolean;
  currentPath?: string;
  label?: string;
};

export function Navbar({
  layout = 'responsive',
  contained = false,
  defaultDropdownOpen = false,
  defaultMenuOpen = false,
  defaultServicesExpanded = false,
  currentPath,
  label = 'Primary'
}: NavbarProps) {
  const pathname = usePathname();
  const path = currentPath ?? pathname;
  const [menuOpen, setMenuOpen] = useState(defaultMenuOpen);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!contained) setMenuOpen(false);
  }, [pathname, contained]);

  useEffect(() => {
    if (layout !== 'responsive' || !menuOpen) return;
    const query = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (query.matches) setMenuOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [layout, menuOpen]);

  const pick = (responsive: string, desktop: string, mobile: string) =>
  layout === 'responsive' ? responsive : layout === 'desktop' ? desktop : mobile;

  const ctaPlacement: CtaPlacement =
  layout === 'responsive' ? 'responsive' : layout === 'mobile-narrow' ? 'first' : 'last';
  const compactVisibility =
  layout === 'responsive' ? 'hidden xs:inline-flex md:hidden' : layout === 'mobile' ? 'inline-flex' : 'hidden';

  const Wrapper = contained ? 'div' : 'header';

  return (
    <>
      <Wrapper
        className={cn(
          contained ? 'absolute' : 'fixed',
          'inset-x-0 top-4 z-40',
          pick('px-4 lg:px-6', 'px-6', 'px-4')
        )}>
        
        <nav
          aria-label={label}
          className={cn(
            'relative mx-auto flex max-w-content items-center rounded-pill bg-ink-900/90 backdrop-blur-md',
            pick('h-14 pl-3 pr-2 md:h-16 md:pl-4', 'h-16 pl-4 pr-2', 'h-14 pl-3 pr-2')
          )}>
          
          <div className="flex flex-1 items-center">
            <Logo
              className={pick('px-1 md:px-2', 'px-2', 'px-1')}
              textClassName={pick('text-body-lg-m md:text-h4', 'text-h4', 'text-body-lg-m')} />
            
          </div>

          <ul className={cn('items-center gap-1', pick('hidden md:flex', 'flex', 'hidden'))}>
            <li>
              <NavItemLink to="/about" current={isCurrentPath('/about', path)}>
                About
              </NavItemLink>
            </li>
            <li>
              <DesktopServicesMenu
                current={isCurrentPath('/services', path)}
                defaultOpen={defaultDropdownOpen}
                scoped={contained} />
              
            </li>
          </ul>

          <div className={cn('flex items-center justify-end gap-2', pick('md:flex-1', 'flex-1', ''))}>
            <Link
              href="/book"
              className={cn(withState(primaryButtonStyles), pick('hidden md:inline-flex', 'inline-flex', 'hidden'))}>
              
              Book a Consultation
            </Link>
            <Link href="/book" className={cn(withState(compactButtonStyles), compactVisibility)}>
              Book consultation
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? sheetId : undefined}
              onClick={() => setMenuOpen(true)}
              className={cn(withState(menuButtonStyles), pick('inline-flex md:hidden', 'hidden', 'inline-flex'))}>
              
              <MenuIcon size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </Wrapper>

      {layout !== 'desktop' &&
      <MobileMenuSheet
        id={sheetId}
        open={menuOpen}
        onClose={closeMenu}
        contained={contained}
        ctaPlacement={ctaPlacement}
        currentPath={path}
        defaultServicesExpanded={defaultServicesExpanded} />

      }
    </>);

}