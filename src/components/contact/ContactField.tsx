'use client';

import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  contactFieldBase,
  contactFieldBorder,
  contactFieldErrorBorder,
  contactFieldFocusStatic } from
'../../utils/contactStyles';
import type { ContactFieldConfig } from '../../types/contact';

type ContactFieldProps = {
  config: ContactFieldConfig;
  idPrefix: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  fieldRef: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
  /** Previews only: show the focus ring without real focus */
  forcedFocus?: boolean;
};

export function ContactField({ config, idPrefix, value, error, onChange, fieldRef, forcedFocus }: ContactFieldProps) {
  const id = `${idPrefix}-${config.name}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name: config.name,
    value,
    autoComplete: config.autoComplete,
    'aria-required': config.required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(
      contactFieldBase,
      error ? contactFieldErrorBorder : contactFieldBorder,
      config.type === 'textarea' ? 'min-h-[144px] resize-y py-3' : 'h-12',
      forcedFocus && contactFieldFocusStatic
    )
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small font-medium text-on-dark">
        {config.label}
        {!config.required && <span className="font-normal text-muted-on-dark"> (optional)</span>}
      </label>
      {config.type === 'textarea' ?
      <textarea {...shared} ref={fieldRef} rows={4} onChange={(e) => onChange(e.target.value)} /> :

      <input {...shared} ref={fieldRef} type={config.type} onChange={(e) => onChange(e.target.value)} />
      }
      {error &&
      <p id={errorId} className="flex items-start gap-2 text-small text-error-dark">
          <AlertCircleIcon size={16} strokeWidth={2} aria-hidden="true" className="mt-1 shrink-0" />
          <span>{error}</span>
        </p>
      }
    </div>);

}