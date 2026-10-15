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

const CONSENT_LINE_VERSION = 'v1';

function getContactEndpoint(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return '';
  return `${supabaseUrl}/functions/v1/contact-submit`;
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
}

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
  const formStartRef = useRef<number>(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Track when the form was first interacted with for timing checks
  useEffect(() => {
    formStartRef.current = Date.now();
  }, []);

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

  const submit = async () => {
    if (status === 'submitting' || submittingRef.current) return;
    submittingRef.current = true;

    const found = validateContact(values);
    setAttempted(true);
    setErrors(found);
    const first = firstErrorField(found);
    if (first) {
      // Wait a frame so the error text exists when the field is announced
      requestAnimationFrame(() => fieldRefs.current[first]?.focus());
      submittingRef.current = false;
      return;
    }

    setStatus('submitting');

    const endpoint = getContactEndpoint();
    const anonKey = getSupabaseAnonKey();

    // If the endpoint is not configured (e.g. spec previews), fall back to simulated behavior
    if (!endpoint || !anonKey) {
      timer.current = window.setTimeout(() => {
        if (failNext.current) {
          failNext.current = false;
          focusAfter.current = 'alert';
          setStatus('error');
        } else {
          focusAfter.current = 'success';
          setStatus('success');
        }
        submittingRef.current = false;
      }, 1400);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          company: values.company.trim(),
          phone: values.phone.trim(),
          company_website: honeypotRef.current?.value ?? '',
          _form_start: formStartRef.current,
          source_page: typeof window !== 'undefined' ? window.location.pathname : '/',
          consent_line_version: CONSENT_LINE_VERSION,
        }),
      });

      if (response.ok) {
        focusAfter.current = 'success';
        setStatus('success');
      } else {
        let serverFieldErrors: ContactErrors | undefined;
        try {
          const errorBody = await response.json();
          if (errorBody?.field_errors && typeof errorBody.field_errors === 'object') {
            serverFieldErrors = errorBody.field_errors as ContactErrors;
          }
        } catch {
          // Non-JSON error body — treat as generic server error
        }

        if (serverFieldErrors) {
          setErrors(serverFieldErrors);
          setAttempted(true);
          const serverFirst = firstErrorField(serverFieldErrors);
          if (serverFirst) {
            requestAnimationFrame(() => fieldRefs.current[serverFirst]?.focus());
          }
        }
        focusAfter.current = 'alert';
        setStatus('error');
      }
    } catch {
      focusAfter.current = 'alert';
      setStatus('error');
    } finally {
      submittingRef.current = false;
    }
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

  return { values, errors, status, setValue, registerField, handleSubmit, retry, submitRef, alertRef, successRef, honeypotRef };
}

export type ContactFormState = ReturnType<typeof useContactForm>;
