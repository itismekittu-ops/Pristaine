'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { CalendarIcon, MailIcon } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { ContactSuccess } from './ContactSuccess';
import { useContactForm } from '../../hooks/useContactForm';
import { contactEmail } from '../../data/contact';
import { cn } from '../../utils/cn';
import { pickLayout } from '../../utils/layout';
import { contactLinkStyles, contactLinkTextStyles } from '../../utils/contactStyles';
import type { ContactFormOptions } from '../../hooks/useContactForm';
import type { ContactFieldName } from '../../types/contact';
import type { ViewportLayout } from '../../utils/layout';

type ContactProps = ContactFormOptions & {
  layout?: ViewportLayout;
  /** Previews only: show one field's focus ring */
  forcedFocus?: ContactFieldName;
};

export function Contact({ layout = 'responsive', forcedFocus, ...formOptions }: ContactProps) {
  const headingId = useId();
  const form = useContactForm(formOptions);
  const pick = (responsive: string, desktop: string, mobile: string) => pickLayout(layout, responsive, desktop, mobile);

  return (
    <section
      id="contact"
      aria-labelledby={headingId}
      className={cn('bg-ink-950 text-on-dark', pick('px-4 py-16 md:py-24 lg:px-6', 'px-6 py-24', 'px-4 py-16'))}>
      
      <div
        className={cn(
          'mx-auto grid max-w-content items-start',
          pick('gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16', 'grid-cols-[5fr_7fr] gap-16', 'gap-12')
        )}>
        
        <div>
          <h2 id={headingId} className={cn('text-on-dark', pick('text-h2-m md:text-h2', 'text-h2', 'text-h2-m'))}>
            Contact us
          </h2>
          <p className={cn('mt-4 text-muted-on-dark', pick('text-body-lg-m md:text-body-lg', 'text-body-lg', 'text-body-lg-m'))}>
            Tell us what you are working on and we will reply.
          </p>
          <ul className="mt-8 flex flex-col gap-2">
            <li>
              <a href={`mailto:${contactEmail}`} className={contactLinkStyles}>
                <MailIcon size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-muted-on-dark" />
                <span className={contactLinkTextStyles}>{contactEmail}</span>
              </a>
            </li>
            <li>
              <Link href="/book" className={contactLinkStyles}>
                <CalendarIcon size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-muted-on-dark" />
                <span className={contactLinkTextStyles}>Book a Consultation</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          {form.status === 'success' ?
          <ContactSuccess headingRef={form.successRef} /> :

          <ContactForm form={form} pick={pick} labelledBy={headingId} forcedFocus={forcedFocus} />
          }
        </div>
      </div>
    </section>);

}