import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { SpecSection } from '../components/spec/SpecSection';
import { StateMatrix } from '../components/spec/StateMatrix';
import { ClosingCta } from '../components/cta/ClosingCta';
import { primaryButtonStyles, withState } from '../utils/navStyles';
import { cn } from '../utils/cn';
import type { StateRow } from '../types/spec';

const buttonRows: StateRow[] = [
{
  label: 'Book a Consultation',
  note: 'Aqua fill, ink text, glow allowed',
  render: (s) => <span className={cn(withState(primaryButtonStyles, s), 'px-6')}>Book a Consultation</span>
}];


export function ClosingCtaSpec() {
  return (
    <>
      <PageIntro
        title="Closing call to action"
        lede="Sits directly below How it works with no divider. A full-bleed still stands in for a slow looping video under a light 35% ink scrim, with a soft 60% ink core behind the headline and button. One centred headline and one primary button on a single centre line." />
      

      <SpecSection
        id="cta-desktop-heading"
        title="Desktop, 1280px"
        description="480px tall. The still drifts slowly to suggest the loop. Headline at Display size, button 48px high with the soft glow.">
        
        <ScaledFrame width={1280} height={480} label="Desktop, 1280 × 480, motion allowed. Headline is placeholder copy.">
          <ClosingCta layout="desktop" reducedMotion={false} />
        </ScaledFrame>
      </SpecSection>

      <SpecSection
        id="cta-states-heading"
        title="Button states"
        description="Hover lifts the glow and softens the fill. Focus adds a 2px aqua ring with 2px offset. Active presses down 1px and drops the glow. There is no loading state.">
        
        <StateMatrix rows={buttonRows} label="Closing CTA button states, scrollable" />
        <div className="grid gap-6 md:grid-cols-2">
          <ScaledFrame width={1280} height={480} label="In context, hover">
            <ClosingCta layout="desktop" reducedMotion buttonState="hover" />
          </ScaledFrame>
          <ScaledFrame width={1280} height={480} label="In context, keyboard focus">
            <ClosingCta layout="desktop" reducedMotion buttonState="focus" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="cta-static-heading"
        title="Reduced motion and mobile, 360px"
        description="With reduced motion the still is fully static. On mobile the section is 400px tall and the headline steps down to Display mobile size.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={480} label="Desktop, 1280 × 480, reduced motion (static still). Headline is placeholder copy.">
              <ClosingCta layout="desktop" reducedMotion />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={400} label="Mobile, 360 × 400. Headline is placeholder copy.">
            <ClosingCta layout="mobile" />
          </ScaledFrame>
        </div>
      </SpecSection>
    </>);

}