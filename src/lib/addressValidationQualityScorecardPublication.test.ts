import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import { buildAddressValidationQualityReport } from './addressValidationQualityReport';
import { assessAddressValidationQualityScorecardPublication } from './addressValidationQualityScorecardPublication';

const officialSourceEvidence = {
  sourceId: 'synthetic-official-source-metadata',
  sourceVersion: '2026.07',
  sourceUrl: 'https://example.invalid/source',
  retrievedAt: '2026-07-22T00:00:00.000Z',
  validUntil: '2026-08-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
};

const report = buildAddressValidationQualityReport({
  countryCode: 'GB',
  officialEvidence: {
    format: true,
    postal: true,
    deliveryPoint: true,
    rights: true,
    version: true,
    freshness: true,
    correctionPath: true,
  },
  privacyBoundary: 'no-raw-address-storage',
  evaluatedAt: '2026-07-23T00:00:00.000Z',
  aggregateEvaluation: {
    measuredAt: '2026-07-22T00:00:00.000Z',
    sampleCount: 12_000,
    exactMatchRate: 0.996,
    falseAcceptRate: 0.0008,
    p95LatencyMs: 450,
    availabilityPct: 99.95,
    normalizationExactMatchRate: 0.996,
    typoCorrectionPrecision: 0.995,
    typoCorrectionFalseChangeRate: 0.0008,
    measurementContract: {
      protocolVersion: ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
      metricDefinitionVersion: ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
      corpusKind: 'synthetic',
      scope: 'country-specific-holdout',
      rawDataHandling: 'no-raw-addresses-or-responses-recorded',
      testVectorDigest: 'b'.repeat(64),
    },
  },
}, officialSourceEvidence);

test('allows a scorecard only after a verified aggregate release and complete scorecard gates', () => {
  const publication = assessAddressValidationQualityScorecardPublication(report, {
    status: 'publishable-aggregate-evidence',
    blockers: [],
    nextActions: ['publish-only-the-verified-aggregate-evidence-export-with-its-non-claim'],
    nonClaim: 'test-only verified release fixture',
  });

  assert.equal(publication.status, 'publishable-signed-aggregate-scorecard');
  assert.equal(publication.scorecard?.countryCode, 'GB');
  assert.deepEqual(publication.blockers, []);
  assert.match(publication.nonClaim, /does not claim parity or superiority/i);
});

test('propagates signature-release blocks without exposing a scorecard', () => {
  const publication = assessAddressValidationQualityScorecardPublication(report, {
    status: 'blocked',
    blockers: ['trusted-key-not-found'],
    nextActions: ['supply-a-current-attestation-from-a-trusted-independent-public-key'],
    nonClaim: 'test-only blocked release fixture',
  });

  assert.equal(publication.status, 'blocked');
  assert.equal(publication.scorecard, null);
  assert.deepEqual(publication.blockers, ['trusted-key-not-found']);
});
