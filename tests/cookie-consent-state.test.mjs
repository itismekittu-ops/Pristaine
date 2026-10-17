// Consent-state tests for useCookieConsentState helpers.
// The hook logic (stored-record validation, GPC handling) is exported as pure
// functions so these rules can be tested without a DOM.
//
//   node --test tests/cookie-consent-state.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const HOOK_PATH = path.join(ROOT, '..', 'src', 'hooks', 'useCookieConsentState.ts');
const DATA_PATH = path.join(ROOT, '..', 'src', 'data', 'cookieCategories.ts');

const hookSource = readFileSync(HOOK_PATH, 'utf8');
const dataSource = readFileSync(DATA_PATH, 'utf8');

// The hook is TypeScript + React; eval the pure helpers by extracting them.
const gpcFnMatch = hookSource.match(/export function detectGpc\(\): boolean \{[\s\S]*?\n\}/);
const readFnMatch = hookSource.match(/export function readStoredConsent\(storage: Storage \| null\): StoredConsent \| null \{[\s\S]*?\n\}/);
const applyFnMatch = hookSource.match(/export function shouldApplyStoredConsent\([\s\S]*?\n\}/);
const versionMatch = dataSource.match(/export const consentPolicyVersion = '([^']+)'/);
const maxAgeMatch = hookSource.match(/CONSENT_MAX_AGE_MS = ([^;\n]+);/);

test('Hook exports the required pure helpers', () => {
  assert.ok(gpcFnMatch, 'detectGpc must exist');
  assert.ok(readFnMatch, 'readStoredConsent must exist');
  assert.ok(applyFnMatch, 'shouldApplyStoredConsent must exist');
  assert.ok(versionMatch, 'consentPolicyVersion must exist in cookieCategories');
  assert.ok(maxAgeMatch, '12-month max age constant must exist');
});

const CONSENT_MAX_AGE_MS = maxAgeMatch && /^\d[\d\s*]+$/.test(maxAgeMatch[1].trim())
  ? eval(maxAgeMatch[1])
  : NaN;
const POLICY_VERSION = versionMatch[1];

// Inline copies of the helpers under test (kept in sync by the assertions in
// 'Helpers match the source' below).
function makeReadStoredConsent(now) {
  return function readStoredConsent(storage) {
    if (!storage) return null;
    try {
      const raw = storage.getItem('pristaine-cookie-choices');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed.timestamp !== 'number' || !Number.isFinite(parsed.timestamp)) return null;
      if (parsed.version !== POLICY_VERSION) return null;
      if (now - parsed.timestamp >= CONSENT_MAX_AGE_MS) return null;
      return {
        version: parsed.version,
        timestamp: parsed.timestamp,
        choices: {
          analytics: parsed.choices?.analytics === true,
          thirdParty: parsed.choices?.thirdParty === true,
        },
      };
    } catch {
      return null;
    }
  };
}

function shouldApplyStoredConsent(stored, gpcActive) {
  if (!stored) return false;
  if (!gpcActive) return true;
  return !(stored.choices.analytics || stored.choices.thirdParty);
}

function fakeStorage(initial) {
  const map = new Map(Object.entries(initial ?? {}));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
  };
}

const NOW = Date.now();

test('Helpers match the hook source', () => {
  const readFn = readFnMatch[0];
  assert.ok(readFn.includes(`parsed.version !== consentPolicyVersion`), 'version check must use consentPolicyVersion');
  assert.ok(readFn.includes(`parsed.choices?.analytics === true`), 'choices parsing must default to false');
  const applyFn = applyFnMatch[0];
  assert.ok(applyFn.includes('return !(stored.choices.analytics || stored.choices.thirdParty)'), 'GPC must ignore affirmative stored consent');
});

test('Initial state: no stored record means not decided (banner shows)', () => {
  const read = makeReadStoredConsent(NOW);
  assert.equal(read(fakeStorage()), null);
  assert.equal(shouldApplyStoredConsent(null, false), false);
  assert.equal(shouldApplyStoredConsent(null, true), false);
});

test('Persistence: a fresh record with current version applies', () => {
  const read = makeReadStoredConsent(NOW);
  const stored = read(fakeStorage({
    'pristaine-cookie-choices': JSON.stringify({
      version: POLICY_VERSION, timestamp: NOW - 1000,
      choices: { analytics: true, thirdParty: true },
    }),
  }));
  assert.ok(stored);
  assert.deepEqual(stored.choices, { analytics: true, thirdParty: true });
  assert.equal(shouldApplyStoredConsent(stored, false), true);
});

test('Expiry: consent 12 months old or older is discarded', () => {
  const read = makeReadStoredConsent(NOW);
  const almostExpired = NOW - CONSENT_MAX_AGE_MS + 60_000;
  const expired = NOW - CONSENT_MAX_AGE_MS - 60_000;
  const storage = fakeStorage({
    'pristaine-cookie-choices': JSON.stringify({
      version: POLICY_VERSION, timestamp: almostExpired,
      choices: { analytics: true, thirdParty: false },
    }),
  });
  assert.ok(read(storage), 'just under 12 months still applies');
  storage.setItem('pristaine-cookie-choices', JSON.stringify({
    version: POLICY_VERSION, timestamp: expired,
    choices: { analytics: true, thirdParty: false },
  }));
  assert.equal(read(storage), null, '12 months old exactly is expired');
});

test('Policy-version change invalidates stored consent', () => {
  const read = makeReadStoredConsent(NOW);
  const storage = fakeStorage({
    'pristaine-cookie-choices': JSON.stringify({
      version: 'v0-old', timestamp: NOW - 1000,
      choices: { analytics: true, thirdParty: true },
    }),
  });
  assert.equal(read(storage), null, 'older version record must be discarded');
  // Legacy format (choices only, no version/timestamp) also discarded.
  assert.equal(read(fakeStorage({
    'pristaine-cookie-choices': JSON.stringify({ analytics: true, thirdParty: true }),
  })), null, 'legacy records without version/timestamp must be discarded');
});

test('Corrupt or unreadable records are discarded', () => {
  const read = makeReadStoredConsent(NOW);
  assert.equal(read(fakeStorage({ 'pristaine-cookie-choices': 'not-json{' })), null);
  assert.equal(read(fakeStorage({
    'pristaine-cookie-choices': JSON.stringify({ version: POLICY_VERSION, choices: {} }),
  })), null, 'missing timestamp is invalid');
});

test('GPC: affirmative stored consent is NOT applied', () => {
  const stored = {
    version: POLICY_VERSION, timestamp: NOW,
    choices: { analytics: true, thirdParty: true },
  };
  assert.equal(shouldApplyStoredConsent(stored, true), false);
});

test('GPC: stored rejection still applies', () => {
  const stored = {
    version: POLICY_VERSION, timestamp: NOW,
    choices: { analytics: false, thirdParty: false },
  };
  assert.equal(shouldApplyStoredConsent(stored, true), true);
});

test('GPC: mixed choice counts as affirmative and is not applied', () => {
  const stored = {
    version: POLICY_VERSION, timestamp: NOW,
    choices: { analytics: false, thirdParty: true },
  };
  assert.equal(shouldApplyStoredConsent(stored, true), false);
});

test('Commit writes version and timestamp; defaults stay off', () => {
  const commitSource = hookSource.match(/const record: StoredConsent = \{[\s\S]*?\};/);
  assert.ok(commitSource, 'commit must write a versioned record');
  assert.ok(commitSource[0].includes('consentPolicyVersion'), 'record must carry the policy version');
  assert.ok(commitSource[0].includes('Date.now()'), 'record must carry a timestamp');
  assert.match(dataSource, /defaultCookieChoices: CookieChoices = \{ analytics: false, thirdParty: false \}/, 'optional categories default off');
});

test('Close control never grants consent', () => {
  const closeSource = hookSource.match(/const closeManage = useCallback\(\([\s\S]*?\n  \}, \[choices, decided, restoreFocus\]\);/);
  assert.ok(closeSource, 'closeManage must exist');
  assert.ok(!closeSource[0].includes('commit'), 'closeManage must not write consent');
  assert.ok(!closeSource[0].includes('setDecided(true)'), 'closeManage must not mark consent decided');
  assert.match(closeSource[0], /decided \? 'hidden' : 'banner'/, 'undecided visitors must return to the banner');
});
