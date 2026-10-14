import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { ScrollFrameContent } from '../components/spec/ScrollFrameContent';
import { SpecSection } from '../components/spec/SpecSection';
import { StateMatrix } from '../components/spec/StateMatrix';
import { ClosingCta } from '../components/cta/ClosingCta';
import { Insights } from '../components/insights/Insights';
import { ChevronRightIcon } from 'lucide-react';
import { withState } from '../utils/navStyles';
import { carouselNavStyles, outlineButtonStyles } from '../utils/insightStyles';
import type { StateRow } from '../types/spec';

const PLACEHOLDER = 'Titles, summaries, tags and the intro line are placeholder copy.';

const controlRows: StateRow[] = [
{
  label: 'View all insights',
  note: 'End panel, indigo-600 outline, 48px',
  render: (s) =>
  <span className="inline-flex rounded-field bg-white p-3">
        <span className={withState(outlineButtonStyles, s)}>View all insights</span>
      </span>

},
{
  label: 'Carousel next',
  note: 'Swipe mode only, 44px ink disc',
  render: (s) =>
  <span className="inline-flex rounded-field bg-surface-50 p-3">
        <span className={withState(carouselNavStyles, s)}>
          <ChevronRightIcon size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </span>

}];


export function InsightsSpec() {
  return (
    <>
      <PageIntro
        title="Insights section"
        lede="Sits directly below the closing CTA on a surface-50 background, with no divider. On desktop with motion allowed, vertical scrolling drives a pinned horizontal track of six article cards and an end panel. On touch, small screens and reduced motion it becomes a swipe carousel." />
      

      <SpecSection
        id="insights-live-heading"
        title="Pinned scroll, 1280px"
        description="Scroll inside the frame. The heading scrolls away, the stage pins, and the track moves sideways with scroll, lightly smoothed. It unpins as soon as the end panel is fully shown. Move the mouse over the cards to see the Read cursor; Tab through the cards to watch the slider centre each one.">
        
        <ScaledFrame width={1280} height={720} label={`Desktop, 1280 × 720, motion allowed, shown below the closing CTA. ${PLACEHOLDER}`}>
          <ScrollFrameContent label="Pinned insights preview, scrollable">
            <ClosingCta layout="desktop" reducedMotion />
            <Insights layout="desktop" reducedMotion={false} />
            <div className="flex h-[320px] items-center justify-center bg-ink-950 text-small text-muted-on-dark">
              Next section
            </div>
          </ScrollFrameContent>
        </ScaledFrame>
      </SpecSection>

      <SpecSection
        id="insights-positions-heading"
        title="Three scroll positions"
        description="First card centred with a sliver of the next. Between cards, both titles shift to indigo-400 and fade slightly while the text runs 12% ahead of the image. At the end the last card leaves and the white end panel is fully shown, then the stage unpins.">
        
        <div className="grid gap-6 lg:grid-cols-3">
          <ScaledFrame width={1280} height={720} label="First card centred">
            <Insights layout="desktop" reducedMotion={false} sample={{ at: 0, height: 720 }} />
          </ScaledFrame>
          <ScaledFrame width={1280} height={720} label="Between cards 2 and 3">
            <Insights layout="desktop" reducedMotion={false} sample={{ at: 1.5, height: 720 }} />
          </ScaledFrame>
          <ScaledFrame width={1280} height={720} label="End panel fully shown">
            <Insights layout="desktop" reducedMotion={false} sample={{ at: 'end', height: 720 }} />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="insights-states-heading"
        title="Hover, focus and active"
        description="Hover: the 88px aqua Read cursor follows the mouse with a slight lag, and the native cursor is hidden over the image only; over tags and the arrow it shrinks to a dot and the native pointer returns. Focus: a 2px white ring with 2px offset, drawn inside the card on the dark image. Active: a light ink wash over the image and the cursor presses in.">
        
        <div className="grid gap-6 lg:grid-cols-3">
          <ScaledFrame width={1280} height={720} label="Hover over the image, Read cursor">
            <Insights
              layout="desktop"
              reducedMotion={false}
              sample={{ at: 0, height: 720, cursor: { x: 560, y: 330, mode: 'read' } }} />
            
          </ScaledFrame>
          <ScaledFrame width={1280} height={720} label="Keyboard focus, white ring">
            <Insights layout="desktop" reducedMotion={false} sample={{ at: 0, height: 720, cardState: 'focus' }} />
          </ScaledFrame>
          <ScaledFrame width={1280} height={720} label="Active, mouse pressed">
            <Insights
              layout="desktop"
              reducedMotion={false}
              sample={{ at: 0, height: 720, cardState: 'active', cursor: { x: 560, y: 330, mode: 'read', pressed: true } }} />
            
          </ScaledFrame>
        </div>
        <StateMatrix rows={controlRows} label="Insights control states, scrollable" />
      </SpecSection>

      <SpecSection
        id="insights-static-heading"
        title="Reduced motion and mobile, 360px"
        description="No pinning and no scroll-driven movement. Cards sit in a scroll-snap carousel at about 85% width so the next one peeks, each with a visible Read link and no colour shift or parallax. Previous and next buttons sit below, and the end panel is the last item. Scroll each frame, then swipe or use the buttons.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={820} label={`Desktop, 1280 × 820, reduced motion. ${PLACEHOLDER}`}>
              <ScrollFrameContent label="Reduced-motion insights preview, scrollable">
                <Insights layout="desktop" reducedMotion />
              </ScrollFrameContent>
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={740} label={`Mobile, 360 × 740. ${PLACEHOLDER}`}>
            <ScrollFrameContent label="Mobile insights preview, scrollable">
              <Insights layout="mobile" />
            </ScrollFrameContent>
          </ScaledFrame>
        </div>
      </SpecSection>
    </>);

}