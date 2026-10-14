import React from 'react';
import { Hero } from '../components/hero/Hero';
import { ChatBar } from '../components/hero/ChatBar';
import { Navbar } from '../components/navbar/Navbar';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { SpecSection } from '../components/spec/SpecSection';
import { StateMatrix } from '../components/spec/StateMatrix';
import { heroStateRows } from '../components/spec/heroStateRows';
import { ChatPanelFrame } from '../components/spec/ChatPanelFrame';
import { chatDemoStates } from '../data/chatDemoStates';
import { chatPanelDemos } from '../data/chatPanelDemos';

export function HeroSpec() {
  return (
    <>
      <Hero />

      <SpecSection
        id="hero-views-heading"
        title="Hero at 1280px and 360px"
        description="The full-motion version. Every element shares one centre line. The poster sits between the navbar and the brand strip on the right, and a soft ink scrim keeps text at 4.5:1 or better.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={688} label="Desktop, 1280 × 688">
              <Hero layout="desktop" contained headingAs="p" />
              <Navbar layout="desktop" contained label="Desktop preview" />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={740} label="Mobile, 360 × 740">
            <Hero layout="mobile" contained headingAs="p" />
            <Navbar layout="mobile" contained label="Mobile preview" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="hero-reduced-heading"
        title="Reduced motion"
        description="When the visitor prefers reduced motion, the poster stays still, the placeholder is a static “Ask a question about our services”, and the brand strip is a static row.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={688} label="Desktop, 1280 × 688, reduced motion">
              <Hero layout="desktop" contained reducedMotion headingAs="p" />
              <Navbar layout="desktop" contained label="Desktop reduced-motion preview" />
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={740} label="Mobile, 360 × 740, reduced motion">
            <Hero layout="mobile" contained reducedMotion headingAs="p" />
            <Navbar layout="mobile" contained label="Mobile reduced-motion preview" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="chat-feedback-heading"
        title="Chat bar feedback"
        description="Short messages appear under the bar and are announced to screen readers. The privacy notice is always visible.">
        
        <div className="grid gap-6 md:grid-cols-2">
          {chatDemoStates.map((demo) =>
          <figure key={demo.label} className="flex flex-col gap-4 rounded-card border border-hairline-dark p-6">
              <figcaption className="text-small font-medium text-muted-on-dark">{demo.label}</figcaption>
              <ChatBar initialValue={demo.initialValue} initialStatus={demo.initialStatus} />
            </figure>
          )}
        </div>
      </SpecSection>

      <SpecSection
        id="chat-panel-heading"
        title="Chat panel"
        description="Opens directly below the chat bar on the same centre line, up to 60% of the screen height, and scrolls inside itself. It overlays the content below without shifting the page. On mobile it spans the full width as a sheet. Escape or the close button returns focus to the chat bar.">
        
        <div className="flex flex-col gap-16">
          {chatPanelDemos.map((demo) =>
          <div key={demo.id} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-h4 text-on-dark">{demo.title}</h3>
                <p className="max-w-prose text-body text-muted-on-dark">{demo.description}</p>
              </div>
              <div className="grid items-start gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ScaledFrame width={1280} height={600} label={`${demo.title}, 1280px`}>
                    <ChatPanelFrame demo={demo} layout="desktop" frameHeight={600} />
                  </ScaledFrame>
                </div>
                <ScaledFrame width={360} height={640} label={`${demo.title}, 360px`}>
                  <ChatPanelFrame demo={demo} layout="mobile" frameHeight={640} />
                </ScaledFrame>
              </div>
              {demo.showReducedVariant &&
            <div className="grid items-start gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <ScaledFrame width={1280} height={600} label={`${demo.title}, 1280px, reduced motion`}>
                      <ChatPanelFrame demo={demo} layout="desktop" frameHeight={600} reducedMotion />
                    </ScaledFrame>
                  </div>
                  <ScaledFrame width={360} height={640} label={`${demo.title}, 360px, reduced motion`}>
                    <ChatPanelFrame demo={demo} layout="mobile" frameHeight={640} reducedMotion />
                  </ScaledFrame>
                </div>
            }
            </div>
          )}
        </div>
      </SpecSection>

      <SpecSection
        id="hero-states-heading"
        title="Control states"
        description="Focus is a 2px aqua ring with a 2px offset. The submit button is a 44px circle.">
        
        <StateMatrix rows={heroStateRows} label="Hero control states" />
      </SpecSection>
    </>);

}