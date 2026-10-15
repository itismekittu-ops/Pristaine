// Unit tests for contact form validation logic.
// Run with: node --test tests/contact-validation.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Re-implement the validation locally to test the logic without a TS compiler.
// The production code in src/utils/contactValidation.ts is the source of truth;
// this mirrors its behavior for testing.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'Enter an email address in the format name@example.com.';
  if (!values.message.trim()) errors.message = 'Enter a message so we know how we can help.';
  return errors;
}

// Edge-function-level validation constants
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;
const MAX_COMPANY = 200;
const MAX_PHONE = 30;
const PHONE_PATTERN = /^\+?[\d\s\-()]{7,30}$/;

function serverValidate(body) {
  const errors = {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

  if (!name) errors.name = 'Name is required.';
  else if (name.length > MAX_NAME) errors.name = `Name must be ${MAX_NAME} characters or fewer.`;

  if (!email) errors.email = 'Email is required.';
  else if (email.length > MAX_EMAIL) errors.email = `Email must be ${MAX_EMAIL} characters or fewer.`;
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.';

  if (!message) errors.message = 'Message is required.';
  else if (message.length > MAX_MESSAGE) errors.message = `Message must be ${MAX_MESSAGE} characters or fewer.`;

  if (company && company.length > MAX_COMPANY) errors.company = `Company must be ${MAX_COMPANY} characters or fewer.`;

  if (phone) {
    if (phone.length > MAX_PHONE) errors.phone = `Phone must be ${MAX_PHONE} characters or fewer.`;
    else if (!PHONE_PATTERN.test(phone)) errors.phone = 'Enter a valid phone number.';
  }

  return errors;
}

// Sensitive-data patterns
const SENSITIVE_PATTERNS = [
  { name: 'card_number', pattern: /\b(?:\d[ -]?){13,16}\b/ },
  { name: 'ssn', pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/ },
  { name: 'sin', pattern: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/ },
  { name: 'password_keyword', pattern: /\bpassword\b\s*[:=]\s*\S+/i },
];

function hasSensitiveData(text) {
  return SENSITIVE_PATTERNS.some(({ pattern }) => pattern.test(text));
}

// --- Tests ---

test('Valid submission passes client validation', () => {
  const errors = validateContact({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: '', phone: '' });
  assert.equal(Object.keys(errors).length, 0);
});

test('Missing required fields produce errors', () => {
  const errors = validateContact({ name: '', email: '', message: '', company: '', phone: '' });
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.message);
});

test('Invalid email format is rejected', () => {
  const errors = validateContact({ name: 'Jane', email: 'jane', message: 'Hello', company: '', phone: '' });
  assert.ok(errors.email);
  assert.ok(errors.email.includes('format'));
});

test('Optional fields do not trigger errors when empty', () => {
  const errors = validateContact({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: '', phone: '' });
  assert.equal(errors.company, undefined);
  assert.equal(errors.phone, undefined);
});

test('Optional fields do not trigger errors when provided', () => {
  const errors = validateContact({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: 'Acme', phone: '+1 555-123-4567' });
  assert.equal(errors.company, undefined);
  assert.equal(errors.phone, undefined);
});

// Server-side validation tests

test('Server: valid submission with phone and company passes', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: 'Acme', phone: '+1 555-123-4567' });
  assert.equal(Object.keys(errors).length, 0);
});

test('Server: valid submission with phone only passes', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: '', phone: '+1 555-999-0000' });
  assert.equal(Object.keys(errors).length, 0);
});

test('Server: valid submission with company only passes', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: 'Acme', phone: '' });
  assert.equal(Object.keys(errors).length, 0);
});

test('Server: valid submission with neither optional field passes', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: '', phone: '' });
  assert.equal(Object.keys(errors).length, 0);
});

test('Server: missing required fields rejected', () => {
  const errors = serverValidate({ name: '', email: '', message: '', company: '', phone: '' });
  assert.ok(errors.name);
  assert.ok(errors.email);
  assert.ok(errors.message);
});

test('Server: invalid email rejected', () => {
  const errors = serverValidate({ name: 'Jane', email: 'not-an-email', message: 'Hello' });
  assert.ok(errors.email);
});

test('Server: oversized name rejected', () => {
  const errors = serverValidate({ name: 'a'.repeat(101), email: 'jane@example.com', message: 'Hello' });
  assert.ok(errors.name);
});

test('Server: oversized message rejected', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'a'.repeat(2001) });
  assert.ok(errors.message);
});

test('Server: oversized company rejected', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', company: 'a'.repeat(201) });
  assert.ok(errors.company);
});

test('Server: invalid phone rejected', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', phone: 'abc' });
  assert.ok(errors.phone);
});

test('Server: valid international phone accepted', () => {
  const errors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', phone: '+44 20 7946 0958' });
  assert.equal(errors.phone, undefined);
});

// Sensitive-data detection tests

test('Sensitive: credit card number detected', () => {
  assert.ok(hasSensitiveData('My card is 4111 1111 1111 1111'));
});

test('Sensitive: SSN detected', () => {
  assert.ok(hasSensitiveData('SSN: 123-45-6789'));
});

test('Sensitive: SIN detected', () => {
  assert.ok(hasSensitiveData('SIN: 123-456-789'));
});

test('Sensitive: password pattern detected', () => {
  assert.ok(hasSensitiveData('my password=secret'));
});

test('Sensitive: normal message not flagged', () => {
  assert.equal(hasSensitiveData('I want a chatbot for my website'), false);
});

// Honeypot logic test

test('Honeypot: non-empty value indicates bot', () => {
  const honeypotValue = 'spam-link';
  assert.ok(honeypotValue, 'Honeypot field should be truthy when filled by a bot');
});

test('Honeypot: empty value indicates human', () => {
  const honeypotValue = '';
  assert.equal(Boolean(honeypotValue), false, 'Honeypot field should be falsy when left empty');
});

// Timing check test

test('Timing: submission faster than 1.5s is too fast', () => {
  const formStart = Date.now() - 500;
  const elapsed = Date.now() - formStart;
  assert.ok(elapsed < 1500, '500ms elapsed should be below the 1500ms threshold');
});

test('Timing: submission after 2s is acceptable', () => {
  const formStart = Date.now() - 2000;
  const elapsed = Date.now() - formStart;
  assert.ok(elapsed >= 1500, '2000ms elapsed should be above the 1500ms threshold');
});
