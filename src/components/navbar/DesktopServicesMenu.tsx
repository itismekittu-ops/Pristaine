'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon } from 'lucide-react';
import { NavItemLink } from './NavItemLink';
import { services } from '../../data/services';
import { useServicesDropdown } from '../../hooks/useServicesDropdown';
import { cn } from '../../utils/cn';
import { DURATION, EASE } from '../../utils/motion';
import {
  chevronButtonStyles,
  dropdownItemStyles,
  viewAllLinkStyles,
  withState } from
'../../utils/navStyles';

type DesktopServicesMenuProps = {
  current: boolean;
  defaultOpen?: boolean;
  scoped?: boolean;
};

export function DesktopServicesMenu({ current, defaultOpen, scoped }: DesktopServicesMenuProps) {
  const menu = useServicesDropdown({ defaultOpen, scoped });
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <div
      ref={menu.wrapperRef}
      className="flex items-center"
      onPointerEnter={menu.onPointerEnter}
      onPointerLeave={menu.onPointerLeave}
      onFocus={menu.onFocusWithin}
      onBlur={menu.onBlurWithin}>
      
      <NavItemLink to="/services" current={current} joined>
        Services
      </NavItemLink>
      <button
        ref={menu.chevronRef}
        type="button"
        aria-label="Services menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? panelId : undefined}
        onClick={menu.onChevronClick}
        onFocus={menu.onChevronFocus}
        onKeyDown={menu.onChevronKeyDown}
        className={withState(chevronButtonStyles)}>
        
        <ChevronDownIcon
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
          className={cn('transition-transform duration-250', menu.open && 'rotate-180')} />
        
      </button>

      <AnimatePresence>
        {menu.open &&
        <motion.div
          ref={menu.panelRef}
          id={panelId}
          initial={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
          transition={{ duration: reduceMotion ? 0 : DURATION.dropdown, ease: EASE }}
          onKeyDown={menu.onPanelKeyDown}
          className="absolute inset-x-0 top-full pt-2">
          
            <div className="rounded-card border border-hairline-dark bg-ink-900 p-4">
              <ul className="grid grid-cols-2 gap-2">
                {services.map(({ slug, name, description, icon: Icon }) =>
              <li key={slug}>
                    <Link
                  href={`/services#${slug}`}
                  data-menu-item
                  onClick={() => menu.close(false)}
                  className={withState(dropdownItemStyles)}>
                  
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-field border border-hairline-dark bg-ink-950 text-aqua-400">
                        <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="font-heading text-body font-semibold text-on-dark">{name}</span>
                        <span className="text-small text-muted-on-dark">{description}</span>
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
              <div className="mt-2 flex items-center border-t border-hairline-dark px-1 pt-3">
                <Link
                href="/services"
                data-menu-item
                onClick={() => menu.close(false)}
                className={withState(viewAllLinkStyles)}>
                
                  View all services
                  <ArrowRightIcon size={20} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}