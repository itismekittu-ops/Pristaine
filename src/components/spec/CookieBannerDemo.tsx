import React from 'react';
import { ScrollFrameContent } from './ScrollFrameContent';
import { Contact } from '../contact/Contact';
import { SiteFooter } from '../SiteFooter';
import { CookieBanner } from '../cookies/CookieBanner';
import { useCookieConsentState } from '../../hooks/useCookieConsentState';
import type { CookieView } from '../../types/cookies';

type CookieBannerDemoProps = {
  layout: 'desktop' | 'mobile';
  label: string;
  initialView?: CookieView;
  reducedMotion?: boolean;
  /** Static previews of the open panel should not pull focus on load */
  autoFocusPanel?: boolean;
};

/** Contact and footer with its own in-memory cookie choices, so each frame works on its own */
export function CookieBannerDemo({ layout, label, initialView = 'banner', reducedMotion, autoFocusPanel = true }: CookieBannerDemoProps) {
  const consent = useCookieConsentState({ persist: false, initialView });

  return (
    <>
      <ScrollFrameContent label={label}>
        <Contact layout={layout} />
        <SiteFooter layout={layout} onCookieSettings={consent.openSettings} />
      </ScrollFrameContent>
      <CookieBanner consent={consent} layout={layout} reducedMotion={reducedMotion} autoFocusPanel={autoFocusPanel} />
    </>);

}