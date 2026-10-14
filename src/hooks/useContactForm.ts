import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { emptyContactValues } from '../data/contact';
import { firstErrorField, validateContact } from '../utils/contactValidation';
import type { ContactErrors, ContactFieldName, ContactStatus, ContactValues } from '../types/contact';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

export type ContactFormOptions = {
  /** Previews only: starting values, errors and status */
  initialValues?: Partial<ContactValues>;
  initialErrors?: ContactErrors;
  initialStatus?: ContactStatus;
  /** Previews only: the first send fails, so the server error can be tried */
  failFirstSubmit?: boolean;
};

const SEND_DELAY_MS = 1400;

export function useContactForm({ initialValues, initialErrors, initialStatus = 'idle', failFirstSubmit = false }: ContactFormOptions = {}) {
  const [values, setValues] = useState<ContactValues>({ ...emptyContactValues, ...initialValues });
  const [errors, setErrors] = useState<ContactErrors>(initialErrors ?? {});
  const [status, setStatus] = useState<ContactStatus>(initialStatus);
  const [attempted, setAttempted] = useState(Object.keys(initialErrors ?? {}).length > 0);

  const fieldRefs = useRef<Partial<Record<ContactFieldName, FieldElement | null>>>({});
  const submitRef = useRef<HTMLButtonElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const failNext = useRef(failFirstSubmit);
  const timer = useRef<number>();
  const focusAfter = useRef<'alert' | 'success' | null>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Move focus to the outcome once it has rendered
  useEffect(() => {
    if (focusAfter.current === 'alert' && status === 'error') alertRef.current?.focus();
    if (focusAfter.current === 'success' && status === 'success') successRef.current?.focus();
    focusAfter.current = null;
  }, [status]);

  const setValue = (name: ContactFieldName, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // After the first attempt, errors clear as soon as a field is fixed
    if (attempted) setErrors(validateContact(next));
  };

  const registerField = (name: ContactFieldName) => (el: FieldElement | null) => {
    fieldRefs.current[name] = el;
  };

  const submit = () => {
    if (status === 'submitting') return;
    const found = validateContact(values);
    setAttempted(true);
    setErrors(found);
    const first = firstErrorField(found);
    if (first) {
      // Wait a frame so the error text exists when the field is announced
      requestAnimationFrame(() => fieldRefs.current[first]?.focus());
      return;
    }
    setStatus('submitting');
    // Stand-in for the real request. Values are never cleared on failure.
    timer.current = window.setTimeout(() => {
      if (failNext.current) {
        failNext.current = false;
        focusAfter.current = 'alert';
        setStatus('error');
      } else {
        focusAfter.current = 'success';
        setStatus('success');
      }
    }, SEND_DELAY_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const retry = () => {
    // The retry button disappears while sending, so keep focus on the submit button
    submitRef.current?.focus();
    submit();
  };

  return { values, errors, status, setValue, registerField, handleSubmit, retry, submitRef, alertRef, successRef };
}

export type ContactFormState = ReturnType<typeof useContactForm>;