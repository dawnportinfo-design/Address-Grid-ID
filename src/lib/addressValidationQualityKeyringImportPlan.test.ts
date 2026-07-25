import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION } from './addressValidationQualityKeyringGovernance';
import { planAddressValidationQualityKeyringImport } from './addressValidationQualityKeyringImportPlan';
import { calculateAddressValidationQualityKeyringGovernanceLedgerDigest } from './addressValidationQualityKeyringGovernance';

const publicKeyPem = '-----BEGIN PUBLIC KEY-----\nnon-secret-dry-run-fixture\n-----END PUBLIC KEY-----';
const ledger = {
  version: ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION,
  publishedAt: '2026-07-23T00:00:00.000Z',
  nextReviewAt: '2026-09-01T00:00:00.000Z',
  correctionUrl: 'https://example.invalid/security/keyring-corrections',
  changeLogUrl: 'https://example.invalid/security/keyring-changelog',
  keys: [{
    id: 'independent-quality-auditor-2026q3',
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeySha256: createHash('sha256').update(publicKeyPem, 'utf8').digest('hex'),
    validFrom: '2026-07-23T00:00:00.000Z',
    validUntil: '2026-10-01T00:00:00.000Z',
    status: 'active' as const,
  }],
};
const ledgerDigest = calculateAddressValidationQualityKeyringGovernanceLedgerDigest(ledger);
const approvals = [
  {
    role: 'security-control' as const,
    decision: 'approved' as const,
    approvedAt: '2026-07-23T01:00:00.000Z',
    ledgerDigest,
    reviewReference: 'security-review-2026q3-01',
  },
  {
    role: 'quality-governance' as const,
    decision: 'approved' as const,
    approvedAt: '2026-07-23T01:05:00.000Z',
    ledgerDigest,
    reviewReference: 'quality-review-2026q3-01',
  },
];

test('builds a non-persistent import dry run that emits fingerprints but never key bodies', () => {
  const plan = planAddressValidationQualityKeyringImport(
    ledger,
    approvals,
    [{ id: ledger.keys[0].id, publicKeyPem }],
    '2026-07-24T00:00:00.000Z',
  );

  assert.equal(plan.mode, 'dry-run');
  assert.equal(plan.status, 'ready-for-controlled-import');
  assert.deepEqual(plan.imports, [{ id: ledger.keys[0].id, publicKeySha256: ledger.keys[0].publicKeySha256 }]);
  assert.doesNotMatch(JSON.stringify(plan), /BEGIN PUBLIC KEY/);
});

test('blocks a candidate whose public-key fingerprint differs from the approved ledger', () => {
  const plan = planAddressValidationQualityKeyringImport(
    ledger,
    approvals,
    [{ id: ledger.keys[0].id, publicKeyPem: 'different-public-key' }],
    '2026-07-24T00:00:00.000Z',
  );

  assert.equal(plan.status, 'blocked');
  assert.ok(plan.blockers.includes('public-key-fingerprint-mismatch'));
  assert.deepEqual(plan.imports, []);
});
