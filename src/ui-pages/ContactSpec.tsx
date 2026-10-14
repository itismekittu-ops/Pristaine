import React from 'react';
import { PageIntro } from '../components/PageIntro';
import { ScaledFrame } from '../components/spec/ScaledFrame';
import { ScrollFrameContent } from '../components/spec/ScrollFrameContent';
import { SpecSection } from '../components/spec/SpecSection';
import { Faq } from '../components/faq/Faq';
import { Contact } from '../components/contact/Contact';
import { filledContactValues, invalidContactValues } from '../data/contactDemoStates';
import { validateContact } from '../utils/contactValidation';

const PLACEHOLDER = 'hello@pristaine.com is a placeholder address.';
const invalidErrors = validateContact(invalidContactValues);

export function ContactSpec() {
  return (
    <>
      <PageIntro
        title="Contact section"
        lede="Sits directly below the FAQ on ink-950, so the change from white separates the two without a divider. Two columns from 1024px, one column below. Five fields, three required; optional fields say so in their label." />
      

      <SpecSection
        id="contact-context-heading"
        title="In context, 1280px and 360px"
        description="Scroll inside each frame from the end of the FAQ into Contact. Both forms work: submit empty to see validation and focus jump to the first error, or fill the required fields to see sending and the thank-you message.">
        
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ScaledFrame width={1280} height={900} label={`Desktop, 1280 × 900, below the FAQ. ${PLACEHOLDER}`}>
              <ScrollFrameContent label="Desktop contact in context preview, scrollable">
                <Faq layout="desktop" reducedMotion />
                <Contact layout="desktop" />
              </ScrollFrameContent>
            </ScaledFrame>
          </div>
          <ScaledFrame width={360} height={900} label={`Mobile, 360 × 900. ${PLACEHOLDER}`}>
            <ScrollFrameContent label="Mobile contact preview, scrollable">
              <Contact layout="mobile" />
            </ScrollFrameContent>
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="contact-states-heading"
        title="Default, focus and validation, 1280px"
        description="Fields are 48px with a border-dark border and 16px text; the message field is three rows tall. Focus is a 2px aqua-400 ring with 2px offset. Errors show an icon and plain text below the field and a 2px error border, never colour alone; on submit, focus moves to the first error.">
        
        <div className="grid gap-6 md:grid-cols-2">
          <ScaledFrame width={1280} height={760} label="Default">
            <Contact layout="desktop" />
          </ScaledFrame>
          <ScaledFrame width={1280} height={760} label="Focus on Email">
            <Contact layout="desktop" initialValues={{ name: 'Sam Rivera' }} forcedFocus="email" />
          </ScaledFrame>
          <ScaledFrame width={1280} height={820} label="Validation error, submitted with gaps; focus on Name">
            <Contact layout="desktop" initialValues={invalidContactValues} initialErrors={invalidErrors} forcedFocus="name" />
          </ScaledFrame>
          <ScaledFrame width={1280} height={820} label="Sending: spinner and text, a second press does nothing">
            <Contact layout="desktop" initialValues={filledContactValues} initialStatus="submitting" />
          </ScaledFrame>
        </div>
      </SpecSection>

      <SpecSection
        id="contact-outcome-heading"
        title="Server error and success"
        description="If the message is not sent, a notice above the consent line says so, keeps everything typed, offers Try again and gives the email address; focus moves to the notice. Try again in these frames succeeds. On success the form is replaced by a short thank-you and focus moves to it.">
        
        <div className="grid gap-6 md:grid-cols-2">
          <ScaledFrame width={1280} height={900} label="Server error, values kept">
            <Contact layout="desktop" initialValues={filledContactValues} initialStatus="error" />
          </ScaledFrame>
          <ScaledFrame width={1280} height={900} label="Success">
            <Contact layout="desktop" initialValues={filledContactValues} initialStatus="success" />
          </ScaledFrame>
        </div>
        <div className="grid items-start gap-6 md:grid-cols-3">
          <ScaledFrame width={360} height={900} label="Mobile, validation error">
            <ScrollFrameContent label="Mobile validation error preview, scrollable">
              <Contact layout="mobile" initialValues={invalidContactValues} initialErrors={invalidErrors} />
            </ScrollFrameContent>
          </ScaledFrame>
          <ScaledFrame width={360} height={900} label="Mobile, server error">
            <ScrollFrameContent label="Mobile server error preview, scrollable">
              <Contact layout="mobile" initialValues={filledContactValues} initialStatus="error" />
            </ScrollFrameContent>
          </ScaledFrame>
          <ScaledFrame width={360} height={900} label="Mobile, success">
            <Contact layout="mobile" initialValues={filledContactValues} initialStatus="success" />
          </ScaledFrame>
        </div>
      </SpecSection>
    </>);

}