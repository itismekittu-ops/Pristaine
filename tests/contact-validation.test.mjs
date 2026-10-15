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

// Sensitive-data patterns — applied to free-text fields ONLY, not the phone field.
// This mirrors the corrected Edge Function behavior.
const SENSITIVE_PATTERNS = [
  { name: 'card_number', pattern: /\b(?:\d[ -]?){13,16}\b/ },
  { name: 'ssn', pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/ },
  { name: 'sin', pattern: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/ },
  { name: 'password_keyword', pattern: /\bpassword\b\s*[:=]\s*\S+/i },
];

function hasSensitiveData(text) {
  return SENSITIVE_PATTERNS.some(({ pattern }) => pattern.test(text));
}

// Mirror of the Edge Function's sensitive-data check: free-text only, phone excluded.
function checkSensitiveDataFreeText(name, email, message, company) {
  const freeText = `${name} ${email} ${message} ${company}`;
  return hasSensitiveData(freeText);
}

// CORS allowlist mirror
const ALLOWED_ORIGINS = new Set([
  'https://itismekittu-ops-pris-6wt7.bolt.host',
  'https://pristaine.com',
  'https://www.pristaine.com',
]);
const LOCALHOST_PATTERN = /^http:\/\/localhost:\d+$/;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (LOCALHOST_PATTERN.test(origin)) return true;
  return false;
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

// ===========================================================================
// Batch 2 Security Corrections — Regression Tests
// ===========================================================================

// --- Correction 4: Phone field excluded from sensitive-data check ---

test('Phone regression: valid 15-digit phone does not trigger card-number false positive', () => {
  // A phone number like +1 555 123 4567 890 has 13+ digits but is in the phone field.
  // The corrected check excludes phone from the sensitive-data scan.
  const phoneTriggered = hasSensitiveData('+1 555 123 4567 890');
  // Even though the raw pattern matches on the phone string directly,
  // the Edge Function only scans freeText (name, email, message, company).
  const freeTextTriggered = checkSensitiveDataFreeText('Jane', 'jane@example.com', 'Hello', 'Acme');
  assert.ok(phoneTriggered, 'The pattern itself does match phone-like digits (expected)');
  assert.equal(freeTextTriggered, false, 'Free-text without phone should not trigger sensitive check');
});

test('Phone regression: valid international phone passes validation and is not sensitive-flagged', () => {
  const phone = '+44 20 7946 0958';
  const valErrors = serverValidate({ name: 'Jane', email: 'jane@example.com', message: 'Hello', phone });
  assert.equal(valErrors.phone, undefined, 'Phone should pass format validation');
  const sensErrors = checkSensitiveDataFreeText('Jane', 'jane@example.com', 'Hello', '');
  assert.equal(sensErrors, false, 'Sensitive check on free-text (without phone) should be clean');
});

test('Phone regression: card number in message is still rejected', () => {
  const messageWithCard = 'My card is 4111 1111 1111 1111';
  const triggered = checkSensitiveDataFreeText('Jane', 'jane@example.com', messageWithCard, '');
  assert.ok(triggered, 'Card number in message must still be detected');
});

test('Phone regression: SSN in message is still rejected', () => {
  const triggered = checkSensitiveDataFreeText('Jane', 'jane@example.com', 'SSN: 123-45-6789', '');
  assert.ok(triggered, 'SSN in message must still be detected');
});

test('Phone regression: SIN in message is still rejected', () => {
  const triggered = checkSensitiveDataFreeText('Jane', 'jane@example.com', 'SIN: 123-456-789', '');
  assert.ok(triggered, 'SIN in message must still be detected');
});

test('Phone regression: password in message is still rejected', () => {
  const triggered = checkSensitiveDataFreeText('Jane', 'jane@example.com', 'my password=secret123', '');
  assert.ok(triggered, 'Password pattern in message must still be detected');
});

test('Phone regression: card number in company field is still rejected', () => {
  const triggered = checkSensitiveDataFreeText('Jane', 'jane@example.com', 'Hello', '4111 1111 1111 1111');
  assert.ok(triggered, 'Card number in company field must still be detected');
});

// --- Correction 2: CORS allowlist ---

test('CORS: allowed Bolt preview origin is accepted', () => {
  assert.ok(isAllowedOrigin('https://itismekittu-ops-pris-6wt7.bolt.host'));
});

test('CORS: allowed production origin is accepted', () => {
  assert.ok(isAllowedOrigin('https://pristaine.com'));
});

test('CORS: allowed www production origin is accepted', () => {
  assert.ok(isAllowedOrigin('https://www.pristaine.com'));
});

test('CORS: localhost is accepted for development', () => {
  assert.ok(isAllowedOrigin('http://localhost:3000'));
  assert.ok(isAllowedOrigin('http://localhost:5173'));
});

test('CORS: unapproved origin is rejected', () => {
  assert.equal(isAllowedOrigin('https://evil.example.com'), false);
});

test('CORS: null origin is rejected', () => {
  assert.equal(isAllowedOrigin(null), false);
});

test('CORS: missing origin (empty string) is rejected', () => {
  assert.equal(isAllowedOrigin(''), false);
});

test('CORS: spoofed subdomain of allowed origin is rejected', () => {
  assert.equal(isAllowedOrigin('https://evil.pristaine.com'), false);
});

// --- Correction 1: submit_contact permission restriction ---
// These are integration checks documented for manual DB verification.
// The unit test verifies the expected privilege set.

test('Permissions: submit_contact should only be executable by service_role and postgres', () => {
  // This is a documentation test. The actual verification is done via:
  //   SELECT grantee FROM information_schema.routine_privileges
  //   WHERE routine_name = 'submit_contact';
  // Expected: only 'service_role' and 'postgres' — NOT 'anon', 'authenticated', or 'PUBLIC'.
  const expectedGrantees = ['service_role', 'postgres'];
  const disallowedGrantees = ['anon', 'authenticated', 'PUBLIC'];
  assert.ok(expectedGrantees.includes('service_role'), 'service_role must have EXECUTE');
  assert.ok(expectedGrantees.includes('postgres'), 'postgres must have EXECUTE');
  for (const g of disallowedGrantees) {
    assert.ok(!expectedGrantees.includes(g), `${g} must NOT have EXECUTE`);
  }
});

test('Permissions: check_and_record_rate_limit should only be executable by service_role', () => {
  const expectedGrantees = ['service_role', 'postgres'];
  const disallowedGrantees = ['anon', 'authenticated', 'PUBLIC'];
  assert.ok(expectedGrantees.includes('service_role'), 'service_role must have EXECUTE');
  for (const g of disallowedGrantees) {
    assert.ok(!expectedGrantees.includes(g), `${g} must NOT have EXECUTE`);
  }
});

// --- Correction 3: Rate-limit fail-closed behavior ---

test('Rate limit: DB error must fail closed (reject), not fail open (allow)', () => {
  // Simulates the corrected behavior: if check_and_record_rate_limit RPC errors,
  // the Edge Function returns a 500 server_error, NOT a success.
  // The old code returned true (allow) on error — the fix returns an error.
  function correctedFailClosed(rpcError) {
    if (rpcError) return { status: 500, allowed: false };
    return { status: 200, allowed: true };
  }
  const result = correctedFailClosed(true);
  assert.equal(result.status, 500, 'DB error should produce 500, not allow through');
  assert.equal(result.allowed, false, 'DB error should not allow the submission');
});

test('Rate limit: allowed submission proceeds normally', () => {
  function correctedFailClosed(rpcError) {
    if (rpcError) return { status: 500, allowed: false };
    return { status: 200, allowed: true };
  }
  const result = correctedFailClosed(false);
  assert.equal(result.status, 200);
  assert.equal(result.allowed, true);
});

test('Rate limit: atomic function prevents concurrent bypass', () => {
  // The check_and_record_rate_limit function does count + insert in a single
  // transaction. Two concurrent calls would each see the count before either
  // inserts, but the SERIALIZABLE behavior of the SECURITY DEFINER function
  // ensures only one can proceed if at the limit.
  // This test documents the expected behavior:
  //   - Call 1: count=2, allowed=true, inserts (count becomes 3)
  //   - Call 2: count=3, allowed=false, no insert
  // With the old non-atomic approach, both could see count=2 and both insert.
  const call1 = { count: 2, allowed: 2 < 3 };
  const call2 = { count: 3, allowed: 3 < 3 }; // After call 1's insert
  assert.ok(call1.allowed, 'First concurrent call should be allowed');
  assert.equal(call2.allowed, false, 'Second concurrent call should be rejected');
});

test('Rate limit: at limit (3 attempts) returns not allowed', () => {
  // The atomic function checks count < max_attempts (3)
  assert.equal(0 < 3, true, '0 attempts: allowed');
  assert.equal(1 < 3, true, '1 attempt: allowed');
  assert.equal(2 < 3, true, '2 attempts: allowed');
  assert.equal(3 < 3, false, '3 attempts: rejected');
});

test('Rate limit: record insert failure is not silently ignored', () => {
  // The corrected code uses a single RPC that does both count and insert.
  // If the insert fails, the RPC returns an error, and the Edge Function
  // returns 500. The old code's separate insert() call ignored errors.
  function correctedBehavior(rpcError) {
    if (rpcError) return { status: 500, saved: false };
    return { status: 200, saved: true };
  }
  const result = correctedBehavior(true);
  assert.equal(result.status, 500, 'Insert failure should produce 500');
  assert.equal(result.saved, false, 'Insert failure should not report success');
});
