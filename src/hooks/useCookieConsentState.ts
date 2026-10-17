import { useCallback, useEffect, useRef, useState } from 'react';
import { consentPolicyVersion, defaultCookieChoices } from '../data/cookieCategories';
import type { CookieChoices, CookieView } from '../types/cookies';

const STORAGE_KEY = 'pristaine-cookie-choices';
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export type CookieConsentOptions = {
  /** Save choices to this browser (live site). Previews keep state in memory. */
  persist?: boolean;
  /** Previews only: start in a given view */
  initialView?: CookieView;
  initialChoices?: CookieChoices;
};

export type CookieConsentState = {
  view: CookieView;
  choices: CookieChoices;
  draft: CookieChoices;
  decided: boolean;
  /** True when the browser sent a Global Privacy Control signal */
  gpcActive: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  openManage: () => void;
  /** Reopen the choices from anywhere (footer); focus returns to the trigger afterwards */
  openSettings: () => void;
  closeManage: () => void;
  setDraft: (key: keyof CookieChoices, value: boolean) => void;
  saveChoices: () => void;
};

type StoredConsent = {
  version: string;
  timestamp: number;
  choices: CookieChoices;
};

export function detectGpc(): boolean {
  try {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    return nav.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

/**
 * Valid stored consent only: the record must carry the current policy version,
 * a readable timestamp and be younger than 12 months. Older-format records
 * (choices only) and expired or version-invalidated records are discarded so
 * the banner appears again.
 */
export function readStoredConsent(storage: Storage | null): StoredConsent | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (typeof parsed.timestamp !== 'number' || !Number.isFinite(parsed.timestamp)) return null;
    if (parsed.version !== consentPolicyVersion) return null;
    if (Date.now() - parsed.timestamp >= CONSENT_MAX_AGE_MS) return null;
    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      choices: {
        analytics: parsed.choices?.analytics === true,
        thirdParty: parsed.choices?.thirdParty === true,
      },
    };
  } catch {
    return null;
  }
}

/**
 * BR-35: with a GPC signal, a stored affirmative choice is not applied —
 * optional categories stay off until the visitor chooses again. A stored
 * rejection still applies (it already matches the GPC default).
 */
export function shouldApplyStoredConsent(
  stored: StoredConsent | null,
  gpcActive: boolean,
): boolean {
  if (!stored) return false;
  if (!gpcActive) return true;
  return !(stored.choices.analytics || stored.choices.thirdParty);
}

export function useCookieConsentState({
  persist = true,
  initialView,
  initialChoices
}: CookieConsentOptions = {}): CookieConsentState {
  // Do not read localStorage during render: it is unavailable on the server and
  // could produce different HTML during hydration for returning visitors.
  const [choices, setChoices] = useState<CookieChoices>(initialChoices ?? defaultCookieChoices);
  const [draft, setDraftState] = useState<CookieChoices>(initialChoices ?? defaultCookieChoices);
  const [decided, setDecided] = useState<boolean>(false);
  const [view, setView] = useState<CookieView>(initialView ?? 'banner');
  const [gpcActive, setGpcActive] = useState<boolean>(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!persist) return;
    const gpc = detectGpc();
    setGpcActive(gpc);
    const stored = readStoredConsent(window.localStorage);
    if (stored && shouldApplyStoredConsent(stored, gpc)) {
      setChoices(stored.choices);
      setDraftState(stored.choices);
      setDecided(true);
      setView('hidden');
    }
  }, [persist]);

  const restoreFocus = useCallback(() => {
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target && target.isConnected) requestAnimationFrame(() => target.focus());
  }, []);

  const commit = useCallback(
    (next: CookieChoices) => {
      setChoices(next);
      setDraftState(next);
      setDecided(true);
      setView('hidden');
      if (persist) {
        try {
          const record: StoredConsent = {
            version: consentPolicyVersion,
            timestamp: Date.now(),
            choices: next,
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        } catch {

          // Storage unavailable: choices still apply for this visit
        }}
      restoreFocus();
    },
    [persist, restoreFocus]
  );

  const openManage = useCallback(() => {
    setDraftState(choices);
    setView('manage');
  }, [choices]);

  const openSettings = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDraftState(choices);
    setView('manage');
  }, [choices]);

  const closeManage = useCallback(() => {
    setDraftState(choices);
    setView(decided ? 'hidden' : 'banner');
    if (decided) restoreFocus();
  }, [choices, decided, restoreFocus]);

  const setDraft = useCallback((key: keyof CookieChoices, value: boolean) => {
    setDraftState((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    view,
    choices,
    draft,
    decided,
    gpcActive,
    acceptAll: () => commit({ analytics: true, thirdParty: true }),
    rejectNonEssential: () => commit({ analytics: false, thirdParty: false }),
    openManage,
    openSettings,
    closeManage,
    setDraft,
    saveChoices: () => commit(draft)
  };
}
