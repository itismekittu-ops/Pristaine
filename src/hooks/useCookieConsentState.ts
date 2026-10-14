import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultCookieChoices } from '../data/cookieCategories';
import type { CookieChoices, CookieView } from '../types/cookies';

const STORAGE_KEY = 'pristaine-cookie-choices';

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
  acceptAll: () => void;
  rejectNonEssential: () => void;
  openManage: () => void;
  /** Reopen the choices from anywhere (footer); focus returns to the trigger afterwards */
  openSettings: () => void;
  closeManage: () => void;
  setDraft: (key: keyof CookieChoices, value: boolean) => void;
  saveChoices: () => void;
};

function readStored(): CookieChoices | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieChoices>;
    return { analytics: parsed.analytics === true, thirdParty: parsed.thirdParty === true };
  } catch {
    return null;
  }
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
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!persist) return;
    const stored = readStored();
    if (stored) {
      setChoices(stored);
      setDraftState(stored);
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
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
    acceptAll: () => commit({ analytics: true, thirdParty: true }),
    rejectNonEssential: () => commit({ analytics: false, thirdParty: false }),
    openManage,
    openSettings,
    closeManage,
    setDraft,
    saveChoices: () => commit(draft)
  };
}