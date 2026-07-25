import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assessAddressCorrectionCandidatePolicy } from './addressCorrectionCandidatePolicy';

const approvedCandidateSource = {
  countryCode: 'US',
  sourceId: 'usps-web-tools',
  sourceVersion: '2026.07',
  validUntil: '2026-08-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
  dictionaryDigest: 'a'.repeat(64),
  aggregateEntryCount: 100,
  scopes: ['locality', 'administrative-area'] as const,
};

test('permits only locality and administrative-area suggestions after official source gates pass', () => {
  const policy = assessAddressCorrectionCandidatePolicy(approvedCandidateSource, '2026-07-23T00:00:00.000Z');

  assert.equal(policy.status, 'locality-admin-suggestions-only');
  assert.equal(policy.mode, 'suggestion-only-never-auto-apply');
  assert.deepEqual(policy.permittedScopes, ['administrative-area', 'locality']);
  assert.deepEqual(policy.blockers, []);
  assert.match(policy.nonClaim, /never imports raw address records/i);
});

test('keeps correction suggestions disabled when source or dictionary metadata is not current', () => {
  const policy = assessAddressCorrectionCandidatePolicy({
    ...approvedCandidateSource,
    validUntil: '2026-07-22T00:00:00.000Z',
    dictionaryDigest: 'not-a-digest',
  }, '2026-07-23T00:00:00.000Z');

  assert.equal(policy.status, 'disabled');
  assert.deepEqual(policy.permittedScopes, []);
  assert.ok(policy.blockers.includes('source-evidence-expired-or-invalid'));
  assert.ok(policy.blockers.includes('candidate-dictionary-digest-invalid'));
});
