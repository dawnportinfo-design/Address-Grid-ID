import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assessOfficialPostalEvidenceGate } from './officialPostalEvidenceGate';

const approvedPortugalEvidence = {
  sourceId: 'eurostat-gisco-postal-code-points-2024',
  url: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
  sourceScopeId: 'pt-mainland-azores-madeira-format-scope',
  sourceVersion: '2024',
  sourceRetrievedAt: '2026-07-24T00:00:00.000Z',
  sourceTermsUrl: 'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
  sourceCorrectionUrl: 'https://ec.europa.eu/eurostat/help/support',
};

test('accepts an ephemeral postal candidate only when it binds to the approved source scope', () => {
  const result = assessOfficialPostalEvidenceGate({
    countryCode: 'PT',
    candidate: approvedPortugalEvidence,
    evaluatedAt: '2026-07-24T00:00:00.000Z',
  });

  assert.equal(result.status, 'accepted');
  assert.equal(result.sourceId, 'eurostat-gisco-postal-code-points-2024');
  assert.doesNotMatch(JSON.stringify(result), /postalCode|addressLine|latitude|longitude/i);
});

test('rejects source claims that omit scope, rights, freshness, or correction metadata', () => {
  const result = assessOfficialPostalEvidenceGate({
    countryCode: 'PT',
    candidate: {
      ...approvedPortugalEvidence,
      sourceScopeId: 'unreviewed-scope',
      sourceTermsUrl: '',
    },
    evaluatedAt: '2026-07-24T00:00:00.000Z',
  });

  assert.equal(result.status, 'rejected');
  assert.ok(result.blockers.includes('scope-id-mismatch'));
  assert.ok(result.blockers.includes('source-terms-url-mismatch'));
});

test('rejects precise coordinates in postal evidence', () => {
  const result = assessOfficialPostalEvidenceGate({
    countryCode: 'ES',
    candidate: {
      ...approvedPortugalEvidence,
      sourceScopeId: 'es-mainland-balearic-canary-format-scope',
      lat: 1,
    },
    evaluatedAt: '2026-07-24T00:00:00.000Z',
  });

  assert.equal(result.status, 'rejected');
  assert.ok(result.blockers.includes('precise-coordinates-not-accepted'));
});

test('rejects unrecognized candidate fields instead of carrying free-form source text', () => {
  const result = assessOfficialPostalEvidenceGate({
    countryCode: 'PT',
    candidate: {
      ...approvedPortugalEvidence,
      source: 'unrecognized-free-text',
    } as unknown as typeof approvedPortugalEvidence,
    evaluatedAt: '2026-07-24T00:00:00.000Z',
  });

  assert.equal(result.status, 'rejected');
  assert.ok(result.blockers.includes('postal-evidence-unrecognized-field'));
});

test('uses the reuse ledger to reject a source after its review deadline', () => {
  const result = assessOfficialPostalEvidenceGate({
    countryCode: 'PT',
    candidate: approvedPortugalEvidence,
    evaluatedAt: '2026-10-22T00:00:00.000Z',
  });

  assert.equal(result.status, 'rejected');
  assert.ok(result.blockers.includes('source-reuse-ledger-not-approved'));
});

test('requires a source refresh during the reuse-ledger renewal window', () => {
  const result = assessOfficialPostalEvidenceGate({
    countryCode: 'PT',
    candidate: approvedPortugalEvidence,
    evaluatedAt: '2026-10-10T00:00:00.000Z',
  });

  assert.equal(result.status, 'rejected');
  assert.ok(result.blockers.includes('source-reuse-ledger-not-approved'));
});
