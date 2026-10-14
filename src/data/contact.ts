import type { ContactFieldConfig, ContactValues } from '../types/contact';

/** Placeholder address until the real inbox is confirmed */
export const contactEmail = 'hello@pristaine.com';

export const emptyContactValues: ContactValues = {
  name: '',
  email: '',
  message: '',
  company: '',
  phone: ''
};

/** Each inner array is one row; rows with two fields sit side by side from 768px */
export const contactFieldRows: ContactFieldConfig[][] = [
[
{ name: 'name', label: 'Name', type: 'text', autoComplete: 'name', required: true },
{ name: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true }],

[{ name: 'message', label: 'Message', type: 'textarea', autoComplete: 'off', required: true }],
[
{ name: 'company', label: 'Company', type: 'text', autoComplete: 'organization', required: false },
{ name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', required: false }]];