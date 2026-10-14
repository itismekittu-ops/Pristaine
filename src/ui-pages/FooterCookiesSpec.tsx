import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { SpecSection } from '../components/spec/SpecSection';
import { StateMatrix } from '../components/spec/StateMatrix';
import { CookieBannerDemo } from '../components/spec/CookieBannerDemo';
import { CalendlyDemo } from '../components/spec/CalendlyDemo';
import { MotionCompareDemo } from '../components/spec/MotionCompareDemo';
import { calendlyStateRows, cookieStateRows, footerStateRows } from '../components/spec/cookieStateRows';

const PLACEHOLDER = 'hello@pristaine.com is a placeholder address.';

export function FooterCookiesSpec() {
  return (
    <>
      <PageIntro
        title="Footer, cookie choices and Calendly notice"
        lede="The footer sits directly below Contact on ink-900. The cookie banner and the Calendly notice float above the page, so neither moves any content. Every preview below works on its own." />
      

      <SpecSection
        id="footer-context-heading"
        title="Footer, 1280px and 360px"
        description="Scroll inside each frame from Contact into the footer. Logo and tagline, the email address, then Services, Company and Legal. Nine links in total plus the Cookie settings button, which reopens the choices panel; try it here.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={900} label={`Desktop, 1280 × 900, below Contact. ${PLACEHOLDER}`}>
              <CookieBannerDemo layout="desktop" initialView="hidden" label="Desktop footer preview, scrollable" />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={900} label={`Mobile, 360 × 900. ${PLACEHOLDER}`}>
            <CookieBannerDemo layout="mobile" initialView="hidden" label="Mobile footer preview, scrollable" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="banner-heading"
        title="Cookie banner, first visit"
        description="A 400px card 24px from the bottom left from 768px; a full-width sheet below. It overlays the page and never locks scrolling, so the frame still scrolls behind it. The three buttons share one style and size. Nothing optional runs until the visitor chooses.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={720} label="Desktop, 1280 × 720, card at bottom left">
              <CookieBannerDemo layout="desktop" label="Desktop banner preview, scrollable" />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={720} label="Mobile, 360 × 720, full-width sheet">
            <CookieBannerDemo layout="mobile" label="Mobile banner preview, scrollable" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="manage-heading"
        title="Manage choices"
        description="Opens in place of the banner, in the same spot. Focus moves to the panel heading and Escape goes back. Each category has a plain explanation, an On or Off word and a 44px toggle. Necessary is always on; Analytics and Third-party services start off. Save choices closes the panel.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={720} label="Desktop, 1280 × 720">
              <CookieBannerDemo layout="desktop" initialView="manage" autoFocusPanel={false} label="Desktop choices panel preview, scrollable" />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={720} label="Mobile, 360 × 720; the sheet scrolls if it runs taller than the screen">
            <CookieBannerDemo layout="mobile" initialView="manage" autoFocusPanel={false} label="Mobile choices panel preview, scrollable" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="calendly-heading"
        title="Calendly notice"
        description="Shown before booking loads while Third-party services is off. Focus starts on Continue, stays inside the notice, and returns to the trigger on close. Escape, the close button and the backdrop all close it. Close it here, then press Choose a time to try the keyboard behaviour.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={640} label="Desktop, 1280 × 640">
              <CalendlyDemo layout="desktop" initialOpen />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={640} label="Mobile, 360 × 640">
            <CalendlyDemo layout="mobile" initialOpen />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="states-heading"
        title="Default, hover, focus and active"
        description="Focus is the site's 2px aqua-400 ring with 2px offset everywhere. Hover and active add a light fill or a heavier underline, never colour alone. Every control has a 44px target.">
        
        <div className="flex flex-col gap-6">
          <StateMatrix rows={footerStateRows} label="Footer control states, scrollable table" />
          <StateMatrix rows={cookieStateRows} label="Cookie control states, scrollable table" />
          <StateMatrix rows={calendlyStateRows} label="Calendly notice control states, scrollable table" />
        </div>
      </SpecSection>

      <SpecSection
        id="motion-heading"
        title="Reduced motion"
        description="Standard: the banner rises 16px and fades in over 250ms, the notice scales from 0.96 and fades over 250ms, and toggle knobs slide over 150ms. Reduced: the banner and notice only fade, over 150ms, and toggles switch instantly. Nothing moves on scroll in either version.">
        
        <div className="grid items-start gap-6 md:grid-cols-2">
          <MotionCompareDemo reducedMotion={false} label="Standard motion" />
          <MotionCompareDemo reducedMotion label="Reduced motion" />
        </div>
      </SpecSection>
    </>);

}