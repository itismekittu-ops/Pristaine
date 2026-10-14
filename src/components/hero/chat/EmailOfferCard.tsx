'use client';

import React, { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import { emailFieldClasses, privacyLinkStyles } from '../../../utils/heroStyles';
import { navLinkStyles, withState } from '../../../utils/navStyles';
import type { EmailOfferStatus } from '../../../types/chat';

type EmailOfferCardProps = {
  formId: string;
  status: EmailOfferStatus;
  value: string;
  focusToken: number;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onDecline: () => void;
};

export function EmailOfferCard({ formId, status, value, focusToken, onChange, onSubmit, onDecline }: EmailOfferCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const consentId = useId();
  const errorId = useId();

  useEffect(() => {
    if (focusToken > 0) inputRef.current?.focus();
  }, [focusToken]);

  if (status === 'declined') {
    return <p className="text-small text-muted-on-dark">No problem. You can keep chatting here.</p>;
  }

  if (status === 'sent') {
    return (
      <div className="flex items-start gap-3 rounded-card border border-hairline-dark bg-ink-950 p-4">
        <CircleCheckIcon size={24} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-success-dark" />
        <p className="break-words text-body text-on-dark">Thanks. Our team will reply to {value.trim()}.</p>
      </div>);

  }

  const invalid = status === 'invalid';

  return (
    <form
      id={formId}
      noValidate
      onSubmit={onSubmit}
      aria-label="Get a reply by email"
      className="flex flex-col gap-3 rounded-card border border-hairline-dark bg-ink-950 p-4">
      
      <div className="flex flex-col gap-1">
        <p className="text-body font-semibold text-on-dark">Get a reply by email</p>
        <p className="text-small text-muted-on-dark">
          Optional. Add your email, then select Send message, and our team can follow up on this chat.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-small font-medium text-on-dark">
          Email address
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="name@company.com"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${errorId} ${consentId}` : consentId}
          className={emailFieldClasses} />
        
        {invalid &&
        <p id={errorId} className="flex items-center gap-2 text-small text-error-dark">
            <CircleAlertIcon size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
            Enter an email address like name@company.com.
          </p>
        }
      </div>
      <p id={consentId} className="text-small text-muted-on-dark">
        By sending, you agree that Pristaine can email you about this chat.{' '}
        <Link href="/privacy" className={withState(privacyLinkStyles)}>
          Privacy Policy
        </Link>
      </p>
      <button type="button" onClick={onDecline} className={`${withState(navLinkStyles)} -ml-3 self-start`}>
        No thanks
      </button>
    </form>);

}