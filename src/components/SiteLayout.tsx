'use client';

import React from 'react';
import { Navbar } from './navbar/Navbar';
import { SiteFooter } from './SiteFooter';
import { CookieBanner } from './cookies/CookieBanner';
import { CookieConsentProvider, useCookieConsent } from '../contexts/CookieConsentContext';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <div className="flex min-h-screen w-full flex-col bg-ink-950 text-on-dark">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-button focus:bg-aqua-400 focus:px-4 focus:text-button focus:font-semibold focus:text-ink-950 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-aqua-400">
          
          Skip to content
        </a>
        <SiteCookieBanner />
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
      </div>
    </CookieConsentProvider>);

}

/** Early in the reading order so keyboard users reach it first; fixed, so it never shifts the page */
function SiteCookieBanner() {
  const consent = useCookieConsent();
  if (!consent) return null;
  return <CookieBanner consent={consent} />;
}