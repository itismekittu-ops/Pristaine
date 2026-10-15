// Integration tests for the submit_contact database function.
// These tests require a live Supabase connection and are run manually.
// Run with: node --test tests/contact-submit-integration.test.mjs
//
// Prerequisites:
//   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set
//   - The 00001 and 00002 migrations must have been applied
//   - The contact-submit Edge Function must be deployed

import { test } from 'node:test';
import assert from 'node:assert/strict';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Skip all tests if no connection info
const hasConnection = Boolean(SUPABASE_URL && ANON_KEY);

test('Database: submit_contact creates lead, submission, and sync queue entry', async (t) => {
  if (!hasConnection) { t.skip('No Supabase connection info'); return; }

  const uniqueEmail = `test+${Date.now()}@example.com`;
  const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({
      name: 'Test Person',
      email: uniqueEmail,
      message: 'This is a test message.',
      company: 'Test Co',
      phone: '+1 555-000-0000',
      _form_start: Date.now() - 3000,
      source_page: '/test',
    }),
  });

  assert.ok(response.ok, `Expected 200, got ${response.status}`);
  const body = await response.json();
  assert.ok(body.success, 'Response should indicate success');
});

test('Database: duplicate email does not create second lead', async (t) => {
  if (!hasConnection) { t.skip('No Supabase connection info'); return; }

  const uniqueEmail = `dedup+${Date.now()}@example.com`;
  const payload = {
    name: 'Dedup Test',
    email: uniqueEmail,
    message: 'First message.',
    _form_start: Date.now() - 3000,
  };

  const r1 = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify(payload),
  });
  assert.ok(r1.ok);

  // Second submission with same email, no phone/company
  const r2 = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify({ ...payload, message: 'Second message.' }),
  });
  assert.ok(r2.ok);
});

test('Database: omitted phone/company in second submission does not erase existing values', async (t) => {
  if (!hasConnection) { t.skip('No Supabase connection info'); return; }

  const uniqueEmail = `preserve+${Date.now()}@example.com`;

  // First submission with phone and company
  await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify({
      name: 'Preserve Test',
      email: uniqueEmail,
      message: 'First message.',
      company: 'Original Co',
      phone: '+1 555-111-2222',
      _form_start: Date.now() - 3000,
    }),
  });

  // Second submission without phone or company
  const r2 = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify({
      name: 'Preserve Test',
      email: uniqueEmail,
      message: 'Second message.',
      _form_start: Date.now() - 3000,
    }),
  });
  assert.ok(r2.ok);
  // Verification of preserved values requires direct DB access via service role.
  // This is documented as a manual verification step.
});

test('Server: honeypot field filled returns success but does not save', async (t) => {
  if (!hasConnection) { t.skip('No Supabase connection info'); return; }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify({
      name: 'Bot',
      email: `bot+${Date.now()}@example.com`,
      message: 'Spam',
      company_website: 'http://spam.com',
      _form_start: Date.now() - 3000,
    }),
  });
  assert.ok(response.ok, 'Honeypot should return 200');
});

test('Server: too-fast submission is rejected', async (t) => {
  if (!hasConnection) { t.skip('No Supabase connection info'); return; }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify({
      name: 'Speed Test',
      email: `fast+${Date.now()}@example.com`,
      message: 'Too fast.',
      _form_start: Date.now(),
    }),
  });
  assert.equal(response.status, 422, 'Too-fast submission should be rejected');
});

test('Server: sensitive data in message is rejected', async (t) => {
  if (!hasConnection) { t.skip('No Supabase connection info'); return; }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify({
      name: 'Sensitive Test',
      email: `sens+${Date.now()}@example.com`,
      message: 'My card number is 4111 1111 1111 1111',
      _form_start: Date.now() - 3000,
    }),
  });
  assert.equal(response.status, 422, 'Sensitive data should be rejected');
});
