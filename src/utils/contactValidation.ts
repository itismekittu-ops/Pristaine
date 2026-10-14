import type { ContactErrors, ContactFieldName, ContactValues } from '../types/contact';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Visual order of the fields, used to find the first error */
export const contactFieldOrder: ContactFieldName[] = ['name', 'email', 'message', 'company', 'phone'];

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email address.';else
  if (!EMAIL_PATTERN.test(values.email.trim()))
  errors.email = 'Enter an email address in the format name@example.com.';
  if (!values.message.trim()) errors.message = 'Enter a message so we know how we can help.';
  return errors;
}

export function firstErrorField(errors: ContactErrors): ContactFieldName | undefined {
  return contactFieldOrder.find((name) => errors[name]);
}