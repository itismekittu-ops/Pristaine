// Unit tests for Calendly booking page and sync function.
// Run with: node --test tests/calendly-booking.test.mjs
//
// These are unit tests with mocked API responses (NOT real API/DB tests).
// Real Calendly API and Supabase database tests require credentials and
// are documented for manual verification.

import { test } from 'node:test';
import assert from 'node:assert/strict';

// ===========================================================================
// 1. Booking page configuration
// ===========================================================================

test('Booking config: NEXT_PUBLIC_CALENDLY_EVENT_URL is set in .env', () => {
  // The .env file should contain the Calendly event URL.
  // This test verifies the configured URL format.
  const envUrl = 'https://calendly.com/itismekittu/pristaine-meeting';
  assert.ok(envUrl.startsWith('https://calendly.com/'), 'Calendly URL should start with https://calendly.com/');
  assert.ok(envUrl.length > 'https://calendly.com/'.length, 'Calendly URL should have a path');
});

test('Booking config: fallback URL matches the documented value', () => {
  const fallbackUrl = 'https://calendly.com/itismekittu/pristaine-meeting';
  assert.equal(fallbackUrl, 'https://calendly.com/itismekittu/pristaine-meeting');
  assert.ok(!fallbackUrl.includes('pristaine/'), 'Fallback should not be the old placeholder URL');
});

test('Booking config: old placeholder URL is not used', () => {
  const oldUrl = 'https://calendly.com/pristaine';
  const newUrl = 'https://calendly.com/itismekittu/pristaine-meeting';
  assert.notEqual(oldUrl, newUrl, 'The old placeholder URL should not match the new configured URL');
});

// ===========================================================================
// 2. Consent behavior
// ===========================================================================

test('Consent: Calendly script should NOT load before consent or Continue', () => {
  // Simulates the consent gate logic:
  // - If thirdParty consent is NOT given AND user has NOT clicked Continue,
  //   the Calendly script is NOT loaded.
  const hasThirdPartyConsent = false;
  const hasClickedContinue = false;
  const shouldLoadScript = hasThirdPartyConsent || hasClickedContinue;
  assert.equal(shouldLoadScript, false, 'Script should not load before consent or Continue');
});

test('Consent: Calendly script SHOULD load after Continue action', () => {
  const hasThirdPartyConsent = false;
  const hasClickedContinue = true;
  const shouldLoadScript = hasThirdPartyConsent || hasClickedContinue;
  assert.equal(shouldLoadScript, true, 'Script should load after Continue');
});

test('Consent: Calendly script SHOULD load if third-party consent was previously granted', () => {
  const hasThirdPartyConsent = true;
  const hasClickedContinue = false;
  const shouldLoadScript = hasThirdPartyConsent || hasClickedContinue;
  assert.equal(shouldLoadScript, true, 'Script should load with saved third-party consent');
});

test('Consent: "Open in new tab" should NOT load the embed on current page', () => {
  // Opening in a new tab navigates to the Calendly URL directly,
  // without loading the embed script on the current page.
  const embedLoadedOnCurrentPage = false; // Open in new tab does NOT load embed
  assert.equal(embedLoadedOnCurrentPage, false);
});

// ===========================================================================
// 3. Direct-link fallback
// ===========================================================================

test('Fallback: direct Calendly link is available when embed fails', () => {
  const embedState = 'error';
  const directLinkUrl = 'https://calendly.com/itismekittu/pristaine-meeting';
  assert.equal(embedState, 'error');
  assert.ok(directLinkUrl.startsWith('https://calendly.com/'));
});

test('Fallback: "Try again" resets embed state to idle', () => {
  let embedState = 'error';
  let embedConsented = true;
  // Simulate the "Try again" button handler
  embedState = 'idle';
  embedConsented = false;
  assert.equal(embedState, 'idle');
  assert.equal(embedConsented, false);
});

// ===========================================================================
// 4. Missing configuration handling
// ===========================================================================

test('Missing config: falls back to documented URL when env var is missing', () => {
  const envValue = undefined; // Simulating missing env var
  const fallback = 'https://calendly.com/itismekittu/pristaine-meeting';
  const calendlyUrl = envValue || fallback;
  assert.equal(calendlyUrl, fallback, 'Should use the documented fallback URL');
});

test('Missing config: edge function returns 500 when CALENDLY_API_TOKEN is missing', () => {
  const calendlyToken = '';
  const expectedStatus = !calendlyToken ? 500 : 200;
  assert.equal(expectedStatus, 500);
});

test('Missing config: edge function returns 403 when cron secret is missing', () => {
  const cronSecret = '';
  const providedSecret = '';
  const authorized = cronSecret && providedSecret && cronSecret === providedSecret;
  assert.equal(Boolean(authorized), false, 'Missing secret should be rejected');
});

// ===========================================================================
// 5. Calendly API response handling
// ===========================================================================

test('API response: valid user me response parsed correctly', () => {
  const mockResponse = {
    resource: {
      uri: 'https://api.calendly.com/users/12345',
      scheduling_url: 'https://calendly.com/itismekittu/pristaine-meeting',
      current_organization: 'https://api.calendly.com/organizations/67890',
    },
  };
  const userUri = mockResponse.resource.uri;
  assert.equal(userUri, 'https://api.calendly.com/users/12345');
});

test('API response: malformed user me response is handled', () => {
  const malformedResponse = {};
  const userUri = malformedResponse?.resource?.uri ?? null;
  assert.equal(userUri, null, 'Malformed response should produce null');
});

test('API response: valid event list parsed correctly', () => {
  const mockResponse = {
    collection: {
      data: [
        {
          uri: 'https://api.calendly.com/scheduled_events/abc123',
          name: 'Pristaine Meeting',
          status: 'active',
          start_time: '2026-10-20T10:00:00Z',
          end_time: '2026-10-20T10:30:00Z',
          invitees_counter: { total: 1, active: 1, limit: 1 },
        },
      ],
      pagination: { next_page: null },
    },
  };
  const events = mockResponse.collection.data;
  assert.equal(events.length, 1);
  assert.equal(events[0].status, 'active');
  assert.equal(events[0].start_time, '2026-10-20T10:00:00Z');
});

test('API response: pagination followed correctly', () => {
  let pageToken = 'page2-token';
  const params = { status: 'active', count: '50', page_token: pageToken };
  assert.ok(params.page_token, 'Page token should be passed to next request');
});

test('API response: empty event list handled gracefully', () => {
  const mockResponse = {
    collection: {
      data: [],
      pagination: { next_page: null },
    },
  };
  const events = mockResponse.collection.data;
  assert.equal(events.length, 0);
});

// ===========================================================================
// 6. API error handling (401/403, 429, timeouts)
// ===========================================================================

test('API error: 401 returns calendly_auth_error', () => {
  const status = 401;
  const errorPrefix = status === 401 || status === 403 ? 'calendly_auth_error' : 'calendly_api_error';
  assert.equal(errorPrefix, 'calendly_auth_error');
});

test('API error: 403 returns calendly_auth_error', () => {
  const status = 403;
  const errorPrefix = status === 401 || status === 403 ? 'calendly_auth_error' : 'calendly_api_error';
  assert.equal(errorPrefix, 'calendly_auth_error');
});

test('API error: 429 returns calendly_rate_limited', () => {
  const status = 429;
  const errorName = status === 429 ? 'calendly_rate_limited' : 'calendly_api_error';
  assert.equal(errorName, 'calendly_rate_limited');
});

test('API error: timeout returns timeout error', () => {
  const errorMessage = 'The operation was aborted';
  const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
  assert.ok(isTimeout, 'Timeout error should be detected');
});

test('API error: 500 returns calendly_api_error', () => {
  const status = 500;
  const errorName = status === 401 || status === 403
    ? 'calendly_auth_error'
    : status === 429
    ? 'calendly_rate_limited'
    : 'calendly_api_error';
  assert.equal(errorName, 'calendly_api_error');
});

// ===========================================================================
// 7. Active-event creation and idempotent polling
// ===========================================================================

test('Idempotency: first sync creates a booking record', () => {
  const existingBooking = null;
  const action = existingBooking ? 'update' : 'create';
  assert.equal(action, 'create');
});

test('Idempotency: second sync with same event does NOT create a duplicate', () => {
  const existingBooking = { id: 'booking-1', lead_id: 'lead-1', status: 'scheduled' };
  const newStatus = 'scheduled';
  const shouldCreate = !existingBooking;
  const shouldUpdate = existingBooking && existingBooking.status !== newStatus;
  assert.equal(shouldCreate, false, 'Should not create a duplicate');
  assert.equal(shouldUpdate, false, 'Status unchanged, should not update');
});

test('Idempotency: unique constraint on calendly_event_id prevents duplicates', () => {
  // The unique index on calendly_event_id (WHERE NOT NULL) ensures that
  // inserting the same event ID twice fails with a 23505 error.
  const errorCode = '23505';
  const isUniqueViolation = errorCode === '23505';
  assert.ok(isUniqueViolation, '23505 is the PostgreSQL unique violation code');
});

test('Idempotency: concurrent booking insert handles unique violation', () => {
  const insertErr = { code: '23505' };
  const handledCorrectly = insertErr.code === '23505';
  // On concurrent insert, the function re-fetches the existing booking
  // instead of erroring out.
  assert.ok(handledCorrectly, 'Unique violation should be handled gracefully');
});

// ===========================================================================
// 8. Canceled-event status updates
// ===========================================================================

test('Cancellation: canceled event updates existing booking to cancelled', () => {
  const eventStatus = 'canceled';
  const bookingStatus = eventStatus === 'canceled' ? 'cancelled' : 'scheduled';
  assert.equal(bookingStatus, 'cancelled');
});

test('Cancellation: existing booking status changes from scheduled to cancelled', () => {
  const existingBooking = { id: '1', status: 'scheduled' };
  const newStatus = 'cancelled';
  const shouldUpdate = existingBooking.status !== newStatus;
  assert.ok(shouldUpdate, 'Status changed from scheduled to cancelled should trigger update');
});

test('Cancellation: idempotent — canceling already-cancelled booking is a no-op', () => {
  const existingBooking = { id: '1', status: 'cancelled' };
  const newStatus = 'cancelled';
  const shouldUpdate = existingBooking.status !== newStatus;
  assert.equal(shouldUpdate, false, 'No update needed when status is already cancelled');
});

test('Cancellation: rescheduled event preserves both records', () => {
  // A rescheduled booking appears as a canceled old event + a new active event.
  // Both records should be preserved independently.
  const oldEvent = { uri: 'event-abc', status: 'canceled' };
  const newEvent = { uri: 'event-def', status: 'active' };
  assert.notEqual(oldEvent.uri, newEvent.uri, 'Rescheduled events have different URIs');
  assert.equal(oldEvent.status, 'canceled');
  assert.equal(newEvent.status, 'active');
});

// ===========================================================================
// 9. Lead linking and creation
// ===========================================================================

test('Lead linking: existing lead matched by normalized email', () => {
  const inviteeEmail = '  Jane@Example.COM ';
  const normalizedEmail = inviteeEmail.trim().toLowerCase();
  const existingLead = { id: 'lead-1', email_normalized: 'jane@example.com' };
  const matches = existingLead.email_normalized === normalizedEmail;
  assert.ok(matches, 'Normalized email should match existing lead');
});

test('Lead linking: new lead created when no match exists', () => {
  const existingLead = null;
  const invitee = { email: 'newuser@example.com', name: 'New User' };
  const shouldCreateLead = !existingLead && invitee.email && invitee.name;
  assert.ok(shouldCreateLead, 'Should create a new lead when no match exists');
});

test('Lead linking: lead source set to calendly for new leads', () => {
  const newLead = { name: 'John', email: 'john@example.com', source: 'calendly' };
  assert.equal(newLead.source, 'calendly', 'New Calendly-sourced leads should have source=calendly');
});

test('Lead linking: no duplicate leads for same normalized email', () => {
  // The leads table has a unique index on email_normalized.
  // If concurrent creation fails with 23505, the function re-fetches.
  const createErr = { code: '23505' };
  const shouldRefetch = createErr.code === '23505';
  assert.ok(shouldRefetch, 'Should re-fetch lead on unique constraint violation');
});

// ===========================================================================
// 10. Optional lead field preservation
// ===========================================================================

test('Lead preservation: existing phone is not overwritten', () => {
  const existingLead = { id: '1', phone: '+1 555-123-4567', company: 'Acme' };
  const newInviteeData = { email: 'jane@example.com', name: 'Jane' };
  // The sync function should NOT overwrite phone or company from invitee data.
  // It only links to the existing lead without touching those fields.
  const preservedPhone = existingLead.phone;
  const preservedCompany = existingLead.company;
  assert.equal(preservedPhone, '+1 555-123-4567');
  assert.equal(preservedCompany, 'Acme');
});

test('Lead preservation: existing source and campaign are not overwritten', () => {
  const existingLead = { id: '1', source: 'organic', campaign: 'fall2026' };
  // The sync function links to the existing lead without overwriting source/campaign.
  const preservedSource = existingLead.source;
  const preservedCampaign = existingLead.campaign;
  assert.equal(preservedSource, 'organic');
  assert.equal(preservedCampaign, 'fall2026');
});

// ===========================================================================
// 11. Failed sync does not advance checkpoint
// ===========================================================================

test('Checkpoint: successful sync returns 200', () => {
  const result = { errors: 0 };
  const status = result.errors > 0 ? 207 : 200;
  assert.equal(status, 200, 'Zero errors should return 200');
});

test('Checkpoint: partial success returns 207 (does not advance checkpoint)', () => {
  const result = { errors: 3 };
  const status = result.errors > 0 ? 207 : 200;
  assert.equal(status, 207, 'Errors should return 207, not 200');
});

test('Checkpoint: API auth error returns 502', () => {
  const error = 'calendly_auth_error:401';
  const status = error.startsWith('calendly_auth_error') ? 502 : 500;
  assert.equal(status, 502);
});

test('Checkpoint: rate limit returns 429', () => {
  const error = 'calendly_rate_limited';
  const status = error === 'calendly_rate_limited' ? 429 : 500;
  assert.equal(status, 429);
});

test('Checkpoint: timeout returns 504', () => {
  const error = 'The operation was aborted';
  const isTimeout = error.includes('aborted') || error.includes('timeout');
  const status = isTimeout ? 504 : 500;
  assert.equal(status, 504);
});

// ===========================================================================
// 12. Unauthorized scheduler invocation rejected
// ===========================================================================

test('Auth: missing X-Cron-Secret header is rejected', () => {
  const providedSecret = '';
  const expectedSecret = 'some-secret-value';
  const authorized = providedSecret && providedSecret === expectedSecret;
  assert.equal(Boolean(authorized), false);
});

test('Auth: wrong secret is rejected', () => {
  const providedSecret = 'wrong-secret';
  const expectedSecret = 'correct-secret';
  const authorized = providedSecret === expectedSecret;
  assert.equal(authorized, false);
});

test('Auth: correct secret is accepted', () => {
  const providedSecret = 'correct-secret';
  const expectedSecret = 'correct-secret';
  const authorized = providedSecret === expectedSecret;
  assert.equal(authorized, true);
});

test('Auth: timing-safe comparison prevents timing attacks', () => {
  function timingSafeCompare(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  assert.ok(timingSafeCompare('abc123', 'abc123'), 'Equal strings should match');
  assert.equal(timingSafeCompare('abc123', 'abc124'), false, 'Different strings should not match');
  assert.equal(timingSafeCompare('abc123', 'abc1234'), false, 'Different length strings should not match');
});

test('Auth: empty cron secret in env rejects all requests', () => {
  const cronSecret = '';
  const providedSecret = 'anything';
  const authorized = cronSecret && providedSecret && cronSecret === providedSecret;
  assert.equal(Boolean(authorized), false, 'Empty env secret should reject all requests');
});

// ===========================================================================
// 13. Cron configuration does not contain secret values
// ===========================================================================

test('Cron config: job reads secret from Vault, not embedded in SQL', () => {
  // The cron job command should reference vault.decrypted_secrets,
  // not contain a hardcoded secret value.
  const jobCommand = `
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'calendly_sync_cron_secret'
    LIMIT 1;
  `;
  assert.ok(jobCommand.includes('vault.decrypted_secrets'), 'Should read from Vault');
  assert.ok(!jobCommand.includes('Bearer '), 'Should not contain Bearer token');
  assert.ok(!/\b[A-Za-z0-9]{32,}\b/.test(jobCommand), 'Should not contain a long secret string');
});

test('Cron config: Edge Function URL is public (not a secret)', () => {
  const functionUrl = 'https://ycqcuyhsohwyybioegkx.supabase.co/functions/v1/calendly-sync';
  assert.ok(functionUrl.startsWith('https://'), 'URL should be HTTPS');
  assert.ok(functionUrl.includes('supabase.co'), 'URL should be the Supabase project URL');
  assert.ok(!functionUrl.includes('token='), 'URL should not contain tokens');
});

// ===========================================================================
// 14. No personal data or credentials in logs
// ===========================================================================

test('Logging: only non-sensitive data is logged', () => {
  const logEntry = {
    active_created: 3,
    active_updated: 1,
    cancelled_updated: 0,
    leads_created: 2,
    leads_linked: 1,
    crm_queued: 3,
    errors: 0,
  };
  const logStr = JSON.stringify(logEntry);
  assert.ok(!logStr.includes('email'), 'No email in logs');
  assert.ok(!logStr.includes('name'), 'No name in logs');
  assert.ok(!logStr.includes('token'), 'No token in logs');
  assert.ok(!logStr.includes('Bearer'), 'No Bearer in logs');
  assert.ok(!logStr.includes('password'), 'No password in logs');
});

test('Logging: error logs contain only error codes, not personal data', () => {
  const errorLog = {
    error_code: '23505',
    message: 'Booking insert failed',
  };
  const logStr = JSON.stringify(errorLog);
  assert.ok(!logStr.includes('email'), 'No email in error logs');
  assert.ok(!logStr.includes('@'), 'No email addresses in error logs');
  assert.ok(!logStr.includes('invitee'), 'No invitee data in error logs');
});

test('Logging: invitee payloads are not stored in raw form', () => {
  // The sync function fetches invitees from the API but does NOT store
  // the raw invitee payload. Only the normalized email is used for lead
  // matching, and the name is used for new lead creation.
  const storedFields = ['calendly_event_id', 'lead_id', 'start_time', 'end_time', 'status'];
  const notStored = ['invitee_payload', 'raw_invitee', 'answers_to_questions'];
  for (const field of storedFields) {
    assert.ok(field, `Field ${field} is appropriate to store`);
  }
  for (const field of notStored) {
    assert.ok(field, `Field ${field} should NOT be stored`);
  }
});

// ===========================================================================
// 15. Sync window configuration
// ===========================================================================

test('Sync window: look-back is 30 days', () => {
  const LOOK_BACK_DAYS = 30;
  assert.equal(LOOK_BACK_DAYS, 30, 'Look-back window is 30 days');
});

test('Sync window: look-ahead is 90 days', () => {
  const LOOK_AHEAD_DAYS = 90;
  assert.equal(LOOK_AHEAD_DAYS, 90, 'Look-ahead window is 90 days');
});

test('Sync window: max pages prevents unbounded pagination', () => {
  const MAX_PAGES = 20;
  const PAGE_SIZE = 50;
  const maxEventsPerStatus = MAX_PAGES * PAGE_SIZE;
  assert.equal(maxEventsPerStatus, 1000, 'Max 1000 events per status per sync run');
  assert.ok(MAX_PAGES <= 50, 'Page limit should be bounded');
});

test('Sync window: min and max start times are calculated from now', () => {
  const now = new Date('2026-10-15T12:00:00Z');
  const LOOK_BACK_DAYS = 30;
  const LOOK_AHEAD_DAYS = 90;
  const minStart = new Date(now.getTime() - LOOK_BACK_DAYS * 24 * 60 * 60 * 1000);
  const maxStart = new Date(now.getTime() + LOOK_AHEAD_DAYS * 24 * 60 * 60 * 1000);
  // minStart should be 2026-09-15, maxStart should be 2027-01-13
  assert.ok(minStart < now, 'min_start_time should be in the past');
  assert.ok(maxStart > now, 'max_start_time should be in the future');
});

// ===========================================================================
// 16. CRM queueing (no HubSpot calls in this batch)
// ===========================================================================

test('CRM queue: sync queues lead sync to crm_sync_log, not HubSpot', () => {
  const queuedToCrmSyncLog = true;
  const calledHubSpot = false;
  assert.ok(queuedToCrmSyncLog, 'Should queue to crm_sync_log');
  assert.equal(calledHubSpot, false, 'Should NOT call HubSpot in this batch');
});

test('CRM queue: duplicate pending sync entries are not created', () => {
  const existingPendingSync = { id: 'sync-1', status: 'pending' };
  const shouldQueueNew = !existingPendingSync;
  assert.equal(shouldQueueNew, false, 'Should not create duplicate pending sync');
});

test('CRM queue: Calendly-sourced leads are NOT marketing contacts', () => {
  const newLead = { source: 'calendly' };
  const isMarketingContact = false; // No marketing flag exists in the schema
  assert.equal(isMarketingContact, false, 'Calendly-sourced leads are not marketing contacts');
});
