'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ExternalLinkIcon, CalendarIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react';
import { PageIntro } from '../components/PageIntro';
import { CalendlyNotice } from '../components/cookies/CalendlyNotice';
import { cookieDetailsHref, calendlyUrl } from '../data/cookieCategories';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { cn } from '../utils/cn';
import { compactButtonStyles, withState } from '../utils/navStyles';
import { cookieInlineLinkStyles } from '../utils/cookieStyles';


type EmbedState = 'idle' | 'loading' | 'loaded' | 'error';

const CALENDLY_SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';
const CALENDLY_STYLESHEET_URL = 'https://assets.calendly.com/assets/external/widget.css';

export function BookConsultation() {
  const consent = useCookieConsent();
  const systemReduced = useReducedMotion();
  const reduced = !!systemReduced;

  const [noticeOpen, setNoticeOpen] = useState(false);
  const [embedState, setEmbedState] = useState<EmbedState>('idle');
  const [embedConsented, setEmbedConsented] = useState(false);
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const noticeTriggerRef = useRef<HTMLButtonElement>(null);

  // If the visitor already granted third-party consent, load the embed directly.
  const hasThirdPartyConsent = consent?.choices.thirdParty === true && consent.decided;

  const loadCalendlyScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${CALENDLY_SCRIPT_URL}"]`);
      if (existing) {
        if (window.Calendly) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('script_error')), { once: true });
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CALENDLY_STYLESHEET_URL;
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = CALENDLY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('script_error'));
      document.head.appendChild(script);
    });
  }, []);

  const renderEmbed = useCallback(() => {
    const container = embedContainerRef.current;
    if (!container || !window.Calendly) return;

    container.innerHTML = '';
    window.Calendly.initInlineWidget({
      url: calendlyUrl,
      parentElement: container,
    });
    setEmbedState('loaded');
  }, []);

  const loadEmbed = useCallback(async () => {
    setEmbedState('loading');
    try {
      await loadCalendlyScript();
      // Small delay to ensure Calendly global is ready
      requestAnimationFrame(() => {
        if (window.Calendly) {
          renderEmbed();
        } else {
          // Poll briefly for the global
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            if (window.Calendly) {
              clearInterval(interval);
              renderEmbed();
            } else if (attempts > 20) {
              clearInterval(interval);
              setEmbedState('error');
            }
          }, 100);
        }
      });
    } catch {
      setEmbedState('error');
    }
  }, [loadCalendlyScript, renderEmbed]);

  const handleContinue = useCallback(() => {
    setNoticeOpen(false);
    setEmbedConsented(true);
    loadEmbed();
  }, [loadEmbed]);

  const handleOpenScheduler = useCallback(() => {
    if (hasThirdPartyConsent) {
      loadEmbed();
    } else {
      setNoticeOpen(true);
    }
  }, [hasThirdPartyConsent, loadEmbed]);

  // Auto-load if visitor already has third-party consent
  useEffect(() => {
    if (hasThirdPartyConsent && embedState === 'idle' && !embedConsented) {
      setEmbedConsented(true);
      loadEmbed();
    }
  }, [hasThirdPartyConsent, embedState, embedConsented, loadEmbed]);

  const showEmbed = embedConsented || hasThirdPartyConsent;
  const showDirectLink = embedState === 'error';

  return (
    <>
      <PageIntro
        title="Book a consultation"
        lede="Tell us about your business and we'll show you where AI can save time or win revenue first."
      />

      <section className="px-4 pb-16 md:pb-24 lg:px-6">
        <div className="mx-auto max-w-content">
          {!showEmbed && embedState !== 'loading' && (
            <div className="flex flex-col items-start gap-6">
              <div className="max-w-prose space-y-4">
                <p className="text-body-lg-m text-muted-on-dark md:text-body-lg">
                  Choose a time that works for you. Booking is provided by Calendly, which may set its own cookies.
                  See our{' '}
                  <a
                    href={cookieDetailsHref}
                    className={withState(cookieInlineLinkStyles)}
                  >
                    cookie details
                  </a>{' '}
                  for more information.
                </p>
              </div>
              <button
                ref={noticeTriggerRef}
                type="button"
                onClick={handleOpenScheduler}
                className={cn(withState(compactButtonStyles), 'px-6')}
              >
                <CalendarIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                Continue to scheduling
              </button>
            </div>
          )}

          {embedState === 'loading' && (
            <div
              className="flex min-h-[400px] items-center justify-center rounded-card border border-hairline-dark bg-ink-900"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3 text-muted-on-dark">
                <LoaderIcon
                  size={28}
                  strokeWidth={1.75}
                  className={reduced ? '' : 'animate-spin'}
                  aria-hidden="true"
                />
                <span className="text-body">Loading the scheduler…</span>
              </div>
            </div>
          )}

          {showEmbed && embedState !== 'loading' && !showDirectLink && (
            <div
              ref={embedContainerRef}
              className="calendly-inline-widget min-h-[600px] w-full rounded-card border border-hairline-dark"
              data-url={calendlyUrl}
              aria-label="Calendly scheduling widget"
            />
          )}

          {showDirectLink && (
            <div
              className="flex flex-col items-start gap-4 rounded-card border border-hairline-dark bg-ink-900 p-6"
              role="alert"
            >
              <div className="flex items-center gap-3 text-on-dark">
                <AlertCircleIcon size={24} strokeWidth={1.75} aria-hidden="true" />
                <h2 className="text-h4">Scheduler unavailable</h2>
              </div>
              <p className="max-w-prose text-body text-muted-on-dark">
                We couldn't load the scheduling widget. You can book directly on Calendly instead.
              </p>
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(withState(compactButtonStyles), 'px-6')}
              >
                Book on Calendly
                <ExternalLinkIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setEmbedState('idle');
                  setEmbedConsented(false);
                }}
                className="text-small text-muted-on-dark underline decoration-border-dark underline-offset-4 transition-control duration-150 hover:decoration-on-dark hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua-400"
              >
                Try the embedded scheduler again
              </button>
            </div>
          )}

          {/* Always-available direct link for keyboard users and fallback */}
          {showEmbed && !showDirectLink && embedState !== 'loading' && (
            <p className="mt-4 text-small text-muted-on-dark">
              Having trouble with the embedded scheduler?{' '}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={withState(cookieInlineLinkStyles)}
              >
                Book directly on Calendly
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          )}
        </div>
      </section>

      <CalendlyNotice
        open={noticeOpen}
        onClose={() => setNoticeOpen(false)}
        onContinue={handleContinue}
        reducedMotion={reduced}
      />
    </>
  );
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}