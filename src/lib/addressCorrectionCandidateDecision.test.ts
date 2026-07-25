import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decideAddressCorrectionCandidate } from './addressCorrectionCandidateDecision';

const enabledPolicy = {
  version: 'address-correction-candidate-policy-v1',
  countryCode: 'US',
  status: 'locality-admin-suggestions-only' as const,
  mode: 'suggestion-only-never-auto-apply' as const,
  permittedScopes: ['administrative-area', 'locality'] as const,
  blockers: [],
  nonClaim: 'fixture',
};

test('returns a high-confidence unique candidate as a suggestion only', () => {
  const decision = decideAddressCorrectionCandidate(enabledPolicy, [
    { candidateId: 'locality-token-a', scope: 'locality', score: 0.98 },
    { candidateId: 'locality-token-b', scope: 'locality', score: 0.8 },
  ]);

  assert.equal(decision.status, 'suggestion-available');
  assert.deepEqual(decision.suggestion, {
    candidateId: 'locality-token-a',
    scope: 'locality',
    score: 0.98,
  });
  assert.equal(decision.mode, 'suggestion-only-never-auto-apply');
});

test('withholds candidates that are ambiguous, low confidence, or disabled by policy', () => {
  const ambiguous = decideAddressCorrectionCandidate(enabledPolicy, [
    { candidateId: 'locality-token-a', scope: 'locality', score: 0.96 },
    { candidateId: 'locality-token-b', scope: 'locality', score: 0.93 },
  ]);
  assert.equal(ambiguous.status, 'ambiguous');
  assert.equal(ambiguous.suggestion, null);

  const lowConfidence = decideAddressCorrectionCandidate(enabledPolicy, [
    { candidateId: 'locality-token-a', scope: 'locality', score: 0.91 },
  ]);
  assert.equal(lowConfidence.status, 'insufficient-confidence');

  const disabled = decideAddressCorrectionCandidate({ ...enabledPolicy, status: 'disabled' }, []);
  assert.equal(disabled.status, 'disabled');
});
