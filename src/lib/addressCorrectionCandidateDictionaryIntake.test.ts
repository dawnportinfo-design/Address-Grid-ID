import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_CORRECTION_CANDIDATE_DICTIONARY_INTAKE_VERSION,
  assessAddressCorrectionCandidateDictionaryManifest,
} from './addressCorrectionCandidateDictionaryIntake';
import { assessAddressCorrectionCandidatePolicy } from './addressCorrectionCandidatePolicy';

const manifest = {
  version: ADDRESS_CORRECTION_CANDIDATE_DICTIONARY_INTAKE_VERSION,
  countryCode: 'US',
  sourceId: 'usps-web-tools',
  sourceVersion: '2026.07',
  retrievedAt: '2026-07-20T00:00:00.000Z',
  validUntil: '2026-08-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
  sourceArtifactDigest: 'a'.repeat(64),
  dictionaryDigest: 'b'.repeat(64),
  aggregateEntryCount: 100,
  scopes: ['locality', 'administrative-area'] as const,
  artifactKind: 'aggregate-described-candidate-dictionary' as const,
  payloadHandling: 'external-ephemeral-only' as const,
};

test('allows only metadata-described candidate dictionaries for ephemeral processing', () => {
  const intake = assessAddressCorrectionCandidateDictionaryManifest(manifest, '2026-07-23T00:00:00.000Z');

  assert.equal(intake.status, 'eligible-for-ephemeral-processing');
  assert.deepEqual(intake.blockers, []);
  assert.ok(intake.candidateSource);
  assert.match(intake.nonClaim, /does not fetch, store, log, or publish dictionary entries/i);

  const policy = assessAddressCorrectionCandidatePolicy(intake.candidateSource!, '2026-07-23T00:00:00.000Z');
  assert.equal(policy.status, 'locality-admin-suggestions-only');
});

test('blocks materialization, stale evidence, and invalid integrity metadata', () => {
  const intake = assessAddressCorrectionCandidateDictionaryManifest({
    ...manifest,
    validUntil: '2026-07-22T00:00:00.000Z',
    sourceArtifactDigest: 'not-a-digest',
    payloadHandling: 'stored-locally' as never,
  }, '2026-07-23T00:00:00.000Z');

  assert.equal(intake.status, 'blocked');
  assert.equal(intake.candidateSource, null);
  assert.ok(intake.blockers.includes('source-evidence-expired-or-invalid'));
  assert.ok(intake.blockers.includes('source-artifact-digest-invalid'));
  assert.ok(intake.blockers.includes('payload-handling-not-allowed'));
});
