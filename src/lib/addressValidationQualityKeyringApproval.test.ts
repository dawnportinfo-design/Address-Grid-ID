import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION,
  calculateAddressValidationQualityKeyringGovernanceLedgerDigest,
} from './addressValidationQualityKeyringGovernance';
import { assessAddressValidationQualityKeyringImportApproval } from './addressValidationQualityKeyringApproval';

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
    publicKeySha256: 'f'.repeat(64),
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

test('requires two distinct role approvals bound to the exact keyring ledger', () => {
  const assessment = assessAddressValidationQualityKeyringImportApproval(
    ledger,
    approvals,
    '2026-07-24T00:00:00.000Z',
  );

  assert.equal(assessment.status, 'approved-for-controlled-import');
  assert.deepEqual(assessment.blockers, []);
  assert.match(assessment.nonClaim, /does not import a key/i);
});

test('blocks duplicated roles and approvals for a different ledger', () => {
  const assessment = assessAddressValidationQualityKeyringImportApproval(
    ledger,
    [
      approvals[0],
      { ...approvals[0], reviewReference: 'security-review-2026q3-02', ledgerDigest: '0'.repeat(64) },
    ],
    '2026-07-24T00:00:00.000Z',
  );

  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.includes('two-distinct-approval-roles-required'));
  assert.ok(assessment.blockers.includes('duplicate-approval-role'));
  assert.ok(assessment.blockers.includes('approval-does-not-bind-to-current-reviewable-ledger'));
});
