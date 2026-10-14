'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { Logo } from './Logo';
import { CurrentIndicator } from './CurrentIndicator';
import { services } from '../../data/services';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { cn } from '../../utils/cn';
import { DURATION, EASE } from '../../utils/motion';
import { isCurrentPath } from '../../utils/navigation';
import {
  menuButtonStyles,
  primaryButtonStyles,
  sheetChevronStyles,
  sheetItemStyles,
  sheetSubItemStyles,
  viewAllLinkStyles,
  withState } from
'../../utils/navStyles';
import type { CtaPlacement } from '../../types/navigation';

export type MobileMenuPanelProps = {
  id: string;
  onClose: (returnFocus: boolean) => void;
  contained: boolean;
  ctaPlacement: CtaPlacement;
  currentPath: string;
  defaultServicesExpanded?: boolean;
};

export function MobileMenuPanel({
  id,
  onClose,
  contained,
  ctaPlacement,
  currentPath,
  defaultServicesExpanded = false
}: MobileMenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [servicesExpanded, setServicesExpanded] = useState(defaultServicesExpanded);
  const reduceMotion = useReducedMotion();
  const accordionId = useId();

  useFocusTrap(panelRef, !contained, closeButtonRef);
  useScrollLock(!contained);

  useEffect(() => {
    if (contained) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose(true);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [contained, onClose]);

  const onContainedKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose(true);
    }
  };

  const aboutCurrent = isCurrentPath('/about', currentPath);
  const servicesCurrent = isCurrentPath('/services', currentPath);
  const firstCtaVisibility =
  ctaPlacement === 'responsive' ? 'flex xs:hidden' : ctaPlacement === 'first' ? 'flex' : 'hidden';
  const lastCtaVisibility =
  ctaPlacement === 'responsive' ? 'hidden xs:flex' : ctaPlacement === 'last' ? 'flex' : 'hidden';
  const navigate = () => onClose(false);
  const transition = { duration: reduceMotion ? 0 : DURATION.dropdown, ease: EASE };

  return (
    <motion.div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal={contained ? undefined : true}
      aria-label="Site menu"
      initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
      transition={transition}
      onKeyDown={contained ? onContainedKeyDown : undefined}
      className={cn(
        contained ? 'absolute' : 'fixed',
        'inset-0 z-50 flex flex-col overflow-y-auto bg-ink-950 text-on-dark'
      )}>
      
      <div className="px-4 pt-4">
        <div className="flex h-14 items-center justify-between rounded-pill bg-ink-900 pl-3 pr-2">
          <Logo className="px-1" textClassName="text-body-lg-m" onClick={navigate} />
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close menu"
            onClick={() => onClose(true)}
            className={withState(menuButtonStyles)}>
            
            <XIcon size={24} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col px-4 pb-8 pt-6">
        <ul className="flex flex-col gap-1">
          <li className={cn(firstCtaVisibility, 'pb-4')}>
            <Link href="/book" onClick={navigate} className={cn(withState(primaryButtonStyles), 'h-14 w-full')}>
              Book a Consultation
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              onClick={navigate}
              aria-current={aboutCurrent ? 'page' : undefined}
              className={withState(sheetItemStyles)}>
              
              About
              {aboutCurrent && <CurrentIndicator variant="bar" />}
            </Link>
          </li>
          <li>
            <div className="flex items-center gap-2">
              <Link
                href="/services"
                onClick={navigate}
                aria-current={servicesCurrent ? 'page' : undefined}
                className={cn(withState(sheetItemStyles), 'flex-1')}>
                
                Services
                {servicesCurrent && <CurrentIndicator variant="bar" />}
              </Link>
              <button
                type="button"
                aria-label="Services submenu"
                aria-expanded={servicesExpanded}
                aria-controls={servicesExpanded ? accordionId : undefined}
                onClick={() => setServicesExpanded((value) => !value)}
                className={withState(sheetChevronStyles)}>
                
                <ChevronDownIcon
                  size={24}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className={cn('transition-transform duration-250', servicesExpanded && 'rotate-180')} />
                
              </button>
            </div>
            <AnimatePresence initial={false}>
              {servicesExpanded &&
              <motion.div
                id={accordionId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={transition}
                className="overflow-hidden">
                
                  <ul className="flex flex-col gap-1 py-2 pl-2">
                    {services.map(({ slug, name, description, icon: Icon }) =>
                  <li key={slug}>
                        <Link
                      href={`/services#${slug}`}
                      onClick={navigate}
                      className={withState(sheetSubItemStyles)}>
                      
                          <Icon size={24} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-aqua-400" />
                          <span className="flex flex-col">
                            <span className="text-body font-medium text-on-dark">{name}</span>
                            <span className="text-small text-muted-on-dark">{description}</span>
                          </span>
                        </Link>
                      </li>
                  )}
                    <li>
                      <Link href="/services" onClick={navigate} className={withState(viewAllLinkStyles)}>
                        View all services
                        <ArrowRightIcon size={20} strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    </li>
                  </ul>
                </motion.div>
              }
            </AnimatePresence>
          </li>
        </ul>

        <div className={cn(lastCtaVisibility, 'mt-auto pt-8')}>
          <Link href="/book" onClick={navigate} className={cn(withState(primaryButtonStyles), 'h-14 w-full')}>
            Book a Consultation
          </Link>
        </div>
      </nav>
    </motion.div>);

}