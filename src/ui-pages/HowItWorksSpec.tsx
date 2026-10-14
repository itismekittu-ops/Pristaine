import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { ScrollFrameContent } from '../components/spec/ScrollFrameContent';
import { SpecSection } from '../components/spec/SpecSection';
import { HowItWorks } from '../components/process/HowItWorks';
import { processSteps } from '../data/processSteps';

export function HowItWorksSpec() {
  return (
    <>
      <PageIntro
        title="How it works section"
        lede="Three placeholder steps below the service cards. On desktop with motion allowed the section pins while you scroll and each scroll scene advances the step and the ring. On mobile or with reduced motion the steps stack and the orb is static." />
      

      <SpecSection
        id="process-desktop-heading"
        title="Pinned scroll, 1280px"
        description="The section stays pinned for three scenes. Each scene swaps the step and the orb title and fills a third of the ring, with 800ms transitions. Scroll inside the frame.">
        
        <ScaledFrame width={1280} height={720} label="Desktop, 1280 × 720, motion allowed">
          <ScrollFrameContent label="Pinned how it works preview, scrollable">
            <HowItWorks layout="desktop" reducedMotion={false} />
          </ScrollFrameContent>
        </ScaledFrame>
      </SpecSection>

      <SpecSection
        id="process-states-heading"
        title="Active states"
        description="Ring fill and markers per scene: one third, two thirds, then complete.">
        
        <div className="grid gap-6 lg:grid-cols-3">
          {processSteps.map((step, index) =>
          <ScaledFrame
            key={step.number}
            width={1280}
            height={720}
            label={`Step ${step.number} active, ${step.title}`}>
            
              <HowItWorks layout="desktop" reducedMotion={false} sample={{ step: index, height: 720 }} />
            </ScaledFrame>
          )}
        </div>
      </SpecSection>

      <SpecSection
        id="process-static-heading"
        title="Reduced motion and mobile, 360px"
        description="No pinning. The three steps stack in reading order and the orb is static, showing the section title. The orb is hidden from screen readers.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={720} label="Desktop, 1280 × 720, reduced motion">
              <ScrollFrameContent label="Reduced-motion preview, scrollable">
                <HowItWorks layout="desktop" reducedMotion />
              </ScrollFrameContent>
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={740} label="Mobile, 360 × 740">
            <ScrollFrameContent label="Mobile preview, scrollable">
              <HowItWorks layout="mobile" />
            </ScrollFrameContent>
          </ScaledFrame>
        </div>
      </SpecSection>
    </>);

}