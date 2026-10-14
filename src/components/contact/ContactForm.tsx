'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { Loader2Icon } from 'lucide-react';
import { ContactField } from './ContactField';
import { ServerErrorNotice } from './ServerErrorNotice';
import { contactFieldRows } from '../../data/contact';
import { cn } from '../../utils/cn';
import { inlineLinkStyles } from '../../utils/contactStyles';
import { primaryButtonStyles, withState } from '../../utils/navStyles';
import type { ContactFormState } from '../../hooks/useContactForm';
import type { ContactFieldName } from '../../types/contact';

type ContactFormProps = {
  form: ContactFormState;
  pick: (responsive: string, desktop: string, mobile: string) => string;
  labelledBy: string;
  /** Previews only: show one field's focus ring */
  forcedFocus?: ContactFieldName;
};

export function ContactForm({ form, pick, labelledBy, forcedFocus }: ContactFormProps) {
  const idPrefix = useId();
  const sending = form.status === 'submitting';

  return (
    <form noValidate onSubmit={form.handleSubmit} aria-labelledby={labelledBy} className="flex flex-col gap-6">
      {contactFieldRows.map((row) =>
      <div
        key={row.map((field) => field.name).join('-')}
        className={cn('grid items-start gap-6', row.length > 1 && pick('md:grid-cols-2', 'grid-cols-2', ''))}>
        
          {row.map((field) =>
        <ContactField
          key={field.name}
          config={field}
          idPrefix={idPrefix}
          value={form.values[field.name]}
          error={form.errors[field.name]}
          onChange={(value) => form.setValue(field.name, value)}
          fieldRef={form.registerField(field.name)}
          forcedFocus={forcedFocus === field.name} />

        )}
        </div>
      )}

      {form.status === 'error' && <ServerErrorNotice alertRef={form.alertRef} onRetry={form.retry} />}

      <div className="flex flex-col gap-4">
        <p className="text-small text-muted-on-dark">
          We use your details only to reply to your message. See our{' '}
          <Link href="/privacy" className={inlineLinkStyles}>
            Privacy Policy
          </Link>
          .
        </p>
        <div>
          <button
            ref={form.submitRef}
            type="submit"
            aria-disabled={sending || undefined}
            className={cn(
              withState(primaryButtonStyles),
              'px-6 aria-disabled:cursor-progress',
              pick('w-full md:w-auto md:min-w-[192px]', 'min-w-[192px]', 'w-full')
            )}>
            
            {sending ?
            <>
                <Loader2Icon size={20} strokeWidth={2} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                Sending…
              </> :

            'Send message'
            }
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {sending ? 'Sending your message.' : ''}
        </p>
      </div>
    </form>);

}