import React from 'react';
import { CheckCircle2Icon } from 'lucide-react';

export function ContactSuccess({ headingRef }: {headingRef: React.RefObject<HTMLHeadingElement>;}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-card border border-hairline-dark bg-ink-900 p-8">
      <CheckCircle2Icon size={32} strokeWidth={1.75} aria-hidden="true" className="text-success-dark" />
      <h3 ref={headingRef} tabIndex={-1} className="text-h3-m text-on-dark focus:outline-none md:text-h3">
        Thank you, your message is sent.
      </h3>
      <p className="text-body text-muted-on-dark">We will reply to the email address you gave us.</p>
    </div>);

}