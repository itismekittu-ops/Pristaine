import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { ScrollFrameContent } from '../components/spec/ScrollFrameContent';
import { SpecSection } from '../components/spec/SpecSection';
import { ServiceCard } from '../components/services/ServiceCard';
import { WhatWeBuild } from '../components/services/WhatWeBuild';
import { services } from '../data/services';
import type { InteractionState } from '../utils/navStyles';

const STATES: InteractionState[] = ['default', 'hover', 'focus', 'active'];

export function ServicesSectionSpec() {
  return (
    <>
      <PageIntro
        title="What we build section"
        lede="Four full-width service cards below the hero. On desktop with motion allowed they stack as you scroll; on mobile or with reduced motion they form a plain list. Scroll inside each preview to try it." />
      

      <SpecSection
        id="services-desktop-heading"
        title="Desktop stack, 1280px"
        description="Each card slides up over the previous one and sticks 16px lower, with an 800ms entrance. Scroll inside the frame.">
        
        <ScaledFrame width={1280} height={720} label="Desktop, 1280 × 720, motion allowed">
          <ScrollFrameContent label="Desktop stack preview, scrollable">
            <WhatWeBuild layout="desktop" reducedMotion={false} />
          </ScrollFrameContent>
        </ScaledFrame>
      </SpecSection>

      <SpecSection
        id="services-mobile-heading"
        title="Mobile list and reduced motion"
        description="At 360px, and on any screen with reduced motion, the cards are a plain vertical list with no overlap or entrance motion.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={720} label="Desktop, 1280 × 720, reduced motion">
              <ScrollFrameContent label="Desktop reduced-motion preview, scrollable">
                <WhatWeBuild layout="desktop" reducedMotion />
              </ScrollFrameContent>
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={740} label="Mobile, 360 × 740">
            <ScrollFrameContent label="Mobile list preview, scrollable">
              <WhatWeBuild layout="mobile" />
            </ScrollFrameContent>
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="services-states-heading"
        title="Card states"
        description="The whole card is one link named after the service. Hover zooms the image slightly and nudges the arrow; focus shows a 2px aqua ring with 2px offset; active presses the card down 1px.">
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {STATES.map((state) =>
          <figure key={state} className="flex flex-col gap-3">
              <ServiceCard service={services[0]} layout="mobile" sample={state} />
              <figcaption className="text-small capitalize text-muted-on-dark">{state}</figcaption>
            </figure>
          )}
        </div>
      </SpecSection>
    </>);

}