import React, { createContext, useContext } from 'react';
import { useCookieConsentState } from '../hooks/useCookieConsentState';
import type { CookieConsentState } from '../hooks/useCookieConsentState';

const CookieConsentContext = createContext<CookieConsentState | null>(null);

export function CookieConsentProvider({ children }: {children: React.ReactNode;}) {
  const consent = useCookieConsentState({ persist: true });
  return <CookieConsentContext.Provider value={consent}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentState | null {
  return useContext(CookieConsentContext);
}