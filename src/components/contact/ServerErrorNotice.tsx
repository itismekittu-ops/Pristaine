'use client';

import React from 'react';
import { AlertTriangleIcon, RotateCwIcon } from 'lucide-react';
import { contactEmail } from '../../data/contact';
import { inlineLinkStyles, secondaryButtonStyles } from '../../utils/contactStyles';

type ServerErrorNoticeProps = {
  alertRef: React.RefObject<HTMLDivElement>;
  onRetry: () => void;
};

export function ServerErrorNotice({ alertRef, onRetry }: ServerErrorNoticeProps) {
  return (
    <div
      ref={alertRef}
      role="alert"
      tabIndex={-1}
      className="flex gap-3 rounded-card border border-error-dark bg-ink-900 p-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-aqua-400">
      
      <AlertTriangleIcon size={20} strokeWidth={1.75} aria-hidden="true" className="mt-1 shrink-0 text-error-dark" />
      <div className="flex flex-col items-start gap-3">
        <div>
          <p className="font-semibold text-on-dark">Your message was not sent.</p>
          <p className="text-small text-muted-on-dark">
            Something went wrong on our side. Everything you typed is still here. Try again, or email us at{' '}
            <a href={`mailto:${contactEmail}`} className={inlineLinkStyles}>
              {contactEmail}
            </a>
            .
          </p>
        </div>
        <button type="button" onClick={onRetry} className={secondaryButtonStyles}>
          <RotateCwIcon size={16} strokeWidth={2} aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>);

}