'use client';

import React from 'react';
import Link from 'next/link';
import { CookieIcon, MailIcon } from 'lucide-react';
import { Logo } from './navbar/Logo';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { contactEmail } from '../data/contact';
import { footerGroups, footerTagline } from '../data/footerLinks';
import { cn } from '../utils/cn';
import { footerLinkStyles } from '../utils/cookieStyles';
import { pickLayout } from '../utils/layout';
import { withState } from '../utils/navStyles';
import type { ViewportLayout } from '../utils/layout';

type SiteFooterProps = {
  layout?: ViewportLayout;
  /** Previews: reopen a local set of cookie choices instead of the site's */
  onCookieSettings?: () => void;
};

export function SiteFooter({ layout = 'responsive', onCookieSettings }: SiteFooterProps) {
  const consent = useCookieConsent();
  const openCookieSettings = onCookieSettings ?? consent?.openSettings;
  const pick = (responsive: string, desktop: string, mobile: string) => pickLayout(layout, responsive, desktop, mobile);
  const link = withState(footerLinkStyles);

  return (
    <footer className={cn('border-t border-hairline-dark bg-ink-900 text-on-dark', pick('px-4 pb-8 pt-16 lg:px-6', 'px-6 pb-8 pt-16', 'px-4 pb-8 pt-12'))}>
      <div className="mx-auto max-w-content">
        <div className={cn('grid', pick('gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16', 'grid-cols-[5fr_7fr] gap-16', 'gap-8'))}>
          <div className="flex flex-col items-start">
            <Logo className="-ml-2" />
            <p className="mt-2 max-w-[320px] text-body text-muted-on-dark">{footerTagline}</p>
            <a href={`mailto:${contactEmail}`} className={cn(link, 'mt-4 text-on-dark')}>
              <MailIcon size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-muted-on-dark" />
              {contactEmail}
            </a>
          </div>

          <nav
            aria-label="Footer"
            className={cn('grid', pick('grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr]', 'grid-cols-[2fr_1fr_1fr] gap-8', 'grid-cols-2 gap-8'))}>
            
            {footerGroups.map((group, index) =>
            <div key={group.title} className={cn(index === 0 && pick('col-span-2 md:col-span-1', '', 'col-span-2'))}>
                <h2 className="font-sans text-small font-semibold text-on-dark">{group.title}</h2>
                <ul className="mt-2 flex flex-col">
                  {group.links.map((item) =>
                <li key={item.to}>
                      <Link href={item.to} className={link}>
                        {item.label}
                      </Link>
                    </li>
                )}
                </ul>
              </div>
            )}
          </nav>
        </div>

        <div
          className={cn(
            'mt-12 flex border-t border-hairline-dark pt-6',
            pick('flex-col-reverse gap-2 md:flex-row md:items-center md:justify-between', 'flex-row items-center justify-between', 'flex-col-reverse gap-2')
          )}>
          
          <p className="text-small text-muted-on-dark">© 2026 Pristaine</p>
          {openCookieSettings &&
          <button type="button" onClick={openCookieSettings} className={cn(link, 'text-small')}>
              <CookieIcon size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
              Cookie settings
            </button>
          }
        </div>
      </div>
    </footer>);

}