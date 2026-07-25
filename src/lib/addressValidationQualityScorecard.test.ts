import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import { buildAddressValidationQualityReport } from './addressValidationQualityReport';
import { buildAddressValidationQualityScorecard } from './addressValidationQualityScorecard';

const officialSourceEvidence = {
  sourceId: 'synthetic-official-source-metadata',
  sourceVersion: '2026.07',
  sourceUrl: 'https://example.invalid/source',
  retrievedAt: '2026-07-22T00:00:00.000Z',
  validUntil: '2026-08-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
};

const readyInput = {
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
  privacyBoundary: 'no-raw-address-storage' as const,
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
      corpusKind: 'aggregate-only' as const,
      scope: 'country-specific-holdout' as const,
      rawDataHandling: 'no-raw-addresses-or-responses-recorded' as const,
      testVectorDigest: 'b'.repeat(64),
      inputScriptClassCount: 3,
      availabilityObservationWindowSeconds: 86_400,
    },
  },
};

test('bundles aggregate evidence into a threshold-visible internal comparison scorecard', () => {
  const report = buildAddressValidationQualityReport(readyInput, officialSourceEvidence);
  const scorecard = buildAddressValidationQualityScorecard(report);

  assert.equal(scorecard.status, 'internally-comparable-awaiting-signature');
  assert.equal(scorecard.measurement?.metricDefinitionVersion, ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION);
  assert.equal(scorecard.metricGates?.normalizationExactMatchRate.passed, true);
  assert.equal(scorecard.metricGates?.inputScriptClassCount.passed, true);
  assert.equal(scorecard.metricGates?.availabilityObservationWindowSeconds.passed, true);
  assert.equal(scorecard.metricGates?.typoCorrectionFalseChangeRate.passed, true);
  assert.deepEqual(scorecard.blockers, []);
  assert.match(scorecard.nonClaim, /does not claim parity or superiority/i);
});

test('withholds a scorecard when source evidence or aggregate thresholds are incomplete', () => {
  const report = buildAddressValidationQualityReport({
    ...readyInput,
    aggregateEvaluation: { ...readyInput.aggregateEvaluation, typoCorrectionPrecision: 0.9 },
  }, { ...officialSourceEvidence, validUntil: '2026-07-23T00:00:00.000Z' });
  const scorecard = buildAddressValidationQualityScorecard(report);

  assert.equal(scorecard.status, 'blocked');
  assert.ok(scorecard.blockers.includes('official-source-evidence-not-current'));
  assert.ok(scorecard.blockers.includes('metric-threshold-typoCorrectionPrecision'));
});
