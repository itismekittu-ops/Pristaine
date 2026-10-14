'use client';

import React, { useEffect, useId, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { CookieToggle } from './CookieToggle';
import { CookieDetailsLink } from './CookieDetailsLink';
import { cookieCategories } from '../../data/cookieCategories';
import { cookieButtonStyles, cookieIconButtonStyles } from '../../utils/cookieStyles';
import { withState } from '../../utils/navStyles';
import type { CookieConsentState } from '../../hooks/useCookieConsentState';

type CookiePreferencesProps = {
  consent: CookieConsentState;
  /** Move focus to the heading when the panel opens (off for static previews) */
  autoFocus?: boolean;
};

export function CookiePreferences({ consent, autoFocus = true }: CookiePreferencesProps) {
  const headingId = useId();
  const baseId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (autoFocus) headingRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="pt-2 text-h4 text-on-dark focus:outline-none">
          
          Cookie choices
        </h2>
        <button
          type="button"
          onClick={consent.closeManage}
          aria-label={consent.decided ? 'Close cookie choices' : 'Back to cookie notice'}
          className={withState(cookieIconButtonStyles)}>
          
          <XIcon size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <ul aria-labelledby={headingId} className="mt-2 divide-y divide-hairline-dark border-y border-hairline-dark">
        {cookieCategories.map((category) => {
          const labelId = `${baseId}-${category.id}-label`;
          const descId = `${baseId}-${category.id}-desc`;
          const checked = category.id === 'necessary' ? true : consent.draft[category.id];
          return (
            <li key={category.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <p id={labelId} className="text-body font-medium text-on-dark">
                  {category.name}
                </p>
                <p id={descId} className="mt-1 text-small text-muted-on-dark">
                  {category.description}
                </p>
              </div>
              <CookieToggle
                checked={checked}
                locked={category.locked}
                labelledBy={labelId}
                describedBy={descId}
                onChange={(next) => {
                  if (category.id !== 'necessary') consent.setDraft(category.id, next);
                }} />
              
            </li>);

        })}
      </ul>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={consent.saveChoices} className={withState(cookieButtonStyles)}>
          Save choices
        </button>
        <div>
          <CookieDetailsLink />
        </div>
      </div>
    </div>);

}