import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION,
  assessAddressValidationQualityKeyringGovernance,
} from './addressValidationQualityKeyringGovernance';

const validLedger = {
  version: ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION,
  publishedAt: '2026-07-23T00:00:00.000Z',
  nextReviewAt: '2026-09-01T00:00:00.000Z',
  correctionUrl: 'https://example.invalid/security/keyring-corrections',
  changeLogUrl: 'https://example.invalid/security/keyring-changelog',
  keys: [{
    id: 'independent-quality-auditor-2026q3',
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeySha256: 'e'.repeat(64),
    validFrom: '2026-07-23T00:00:00.000Z',
    validUntil: '2026-10-01T00:00:00.000Z',
    status: 'active' as const,
  }],
};

test('accepts a bounded, reviewable public-key rotation ledger without importing key material', () => {
  const assessment = assessAddressValidationQualityKeyringGovernance(validLedger, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'ready-for-approved-keyring-import');
  assert.deepEqual(assessment.blockers, []);
  assert.match(assessment.nonClaim, /does not authenticate a public key/i);
});

test('blocks stale, duplicate, or incomplete key governance metadata', () => {
  const assessment = assessAddressValidationQualityKeyringGovernance({
    ...validLedger,
    nextReviewAt: '2026-07-23T00:00:00.000Z',
    correctionUrl: 'not-a-url',
    keys: [
      ...validLedger.keys,
      { ...validLedger.keys[0], publicKeySha256: 'not-a-fingerprint' },
    ],
  }, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.includes('keyring-review-window-invalid-or-expired'));
  assert.ok(assessment.blockers.includes('correction-url-missing-or-invalid'));
  assert.ok(assessment.blockers.includes('duplicate-key-id'));
  assert.ok(assessment.blockers.includes('invalid-key-rotation-entry'));
});
