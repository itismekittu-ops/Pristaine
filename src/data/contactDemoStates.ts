import type { ContactValues } from '../types/contact';

/** Spec previews only: a completed form */
export const filledContactValues: ContactValues = {
  name: 'Sam Rivera',
  email: 'sam@northwind.co',
  message: 'We want to add an assistant to our support site that answers order questions.',
  company: 'Northwind',
  phone: ''
};

/** Spec previews only: a form submitted with gaps and a mistyped email */
export const invalidContactValues: ContactValues = {
  name: '',
  email: 'sam@northwind',
  message: '',
  company: 'Northwind',
  phone: ''
};