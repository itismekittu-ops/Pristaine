import React from 'react';
import { ChevronDownIcon, InfoIcon } from 'lucide-react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { ScrollFrameContent } from '../components/spec/ScrollFrameContent';
import { SpecSection } from '../components/spec/SpecSection';
import { StateMatrix } from '../components/spec/StateMatrix';
import { Insights } from '../components/insights/Insights';
import { Faq } from '../components/faq/Faq';
import { cn } from '../utils/cn';
import { faqInfoButtonStyles, faqTriggerStyles } from '../utils/faqStyles';
import { withState } from '../utils/navStyles';
import type { StateRow } from '../types/spec';

const PLACEHOLDER = 'Questions and answers are placeholder copy.';

function TriggerSample({ open, state }: {open: boolean;state: Parameters<typeof withState>[1];}) {
  return (
    <span className="inline-flex w-[320px] rounded-field bg-white p-2">
      <span className={cn(withState(faqTriggerStyles, state), 'text-h4')}>
        <span>Question</span>
        <ChevronDownIcon size={20} strokeWidth={1.75} aria-hidden="true" className={cn('shrink-0', open && 'rotate-180')} />
      </span>
    </span>);

}

const controlRows: StateRow[] = [
{ label: 'Question, closed', note: 'Min 64px, chevron down', render: (s) => <TriggerSample open={false} state={s} /> },
{ label: 'Question, open', note: 'Chevron rotated 180°', render: (s) => <TriggerSample open state={s} /> },
{
  label: 'Info icon',
  note: '20px glyph, 44px target',
  render: (s) =>
  <span className="inline-flex rounded-field bg-white p-3">
        <span className={withState(faqInfoButtonStyles, s)}>
          <InfoIcon size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </span>

}];


export function FaqSpec() {
  return (
    <>
      <PageIntro
        title="FAQ section"
        lede="Sits directly below Insights on a white background, so the change from surface-50 separates the two without a divider. A centred heading over an accordion of seven questions. More than one answer can be open, and closed answers stay in the page, collapsed." />
      

      <SpecSection
        id="faq-context-heading"
        title="In context, 1280px"
        description="Scroll inside the frame from the end of Insights into the FAQ. The first answer starts open. Click any question, or Tab to it and press Enter or Space, to toggle it; the chevron turns in 250ms on the brand easing.">
        
        <ScaledFrame width={1280} height={800} label={`Desktop, 1280 × 800, below Insights. ${PLACEHOLDER}`}>
          <ScrollFrameContent label="FAQ in context preview, scrollable">
            <Insights layout="desktop" reducedMotion />
            <Faq layout="desktop" reducedMotion={false} initialOpen={['services']} />
          </ScrollFrameContent>
        </ScaledFrame>
      </SpecSection>

      <SpecSection
        id="faq-open-heading"
        title="Open, closed and the info popover"
        description="Questions one and three open together, the rest closed. The info icon on answer three opens a popover on click or keyboard focus. It stays open until Escape, a second click or a click outside; Escape returns focus to the icon.">
        
        <ScaledFrame width={1280} height={1080} label={`Desktop, 1280 × 1080, two answers open, popover open. ${PLACEHOLDER}`}>
          <Faq layout="desktop" reducedMotion={false} initialOpen={['services', 'privacy']} infoOpen />
        </ScaledFrame>
      </SpecSection>

      <SpecSection
        id="faq-states-heading"
        title="Hover, focus and active"
        description="Hover adds a 5% ink wash, active a 10% wash. Focus is a 2px indigo-600 ring with 2px offset. All text on the white background uses on-light.">
        
        <StateMatrix rows={controlRows} label="FAQ control states, scrollable" />
        <div className="grid gap-6 md:grid-cols-2">
          <ScaledFrame width={1280} height={760} label="Keyboard focus on question two">
            <Faq layout="desktop" reducedMotion forcedState={{ id: 'timeline', state: 'focus' }} />
          </ScaledFrame>
          <ScaledFrame width={1280} height={760} label="Hover on question four, question three open">
            <Faq layout="desktop" reducedMotion initialOpen={['privacy']} forcedState={{ id: 'testing', state: 'hover' }} />
          </ScaledFrame>
          <ScaledFrame width={1280} height={760} label="Active, question five pressed">
            <Faq layout="desktop" reducedMotion forcedState={{ id: 'tools', state: 'active' }} />
          </ScaledFrame>
          <ScaledFrame width={1280} height={760} label="Info icon focused, popover open">
            <Faq layout="desktop" reducedMotion initialOpen={['privacy']} infoOpen infoState="focus" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="faq-static-heading"
        title="Reduced motion and mobile, 360px"
        description="With reduced motion answers open and close instantly and the chevron turns without animation. At 360px the heading and questions step down a size; each question stays at least 64px high and long ones wrap within it. Try both frames.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={960} label={`Desktop, 1280 × 960, reduced motion. ${PLACEHOLDER}`}>
              <Faq layout="desktop" reducedMotion initialOpen={['timeline']} />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={740} label={`Mobile, 360 × 740. ${PLACEHOLDER}`}>
            <ScrollFrameContent label="Mobile FAQ preview, scrollable">
              <div className="min-h-full bg-white">
                <Faq layout="mobile" initialOpen={['services']} />
              </div>
            </ScrollFrameContent>
          </ScaledFrame>
        </div>
      </SpecSection>
    </>);

}