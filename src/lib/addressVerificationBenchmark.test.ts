import assert from 'node:assert/strict';
import { readdirSync,statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES } from './addressVerificationEngine';
import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
  ADDRESS_VERIFICATION_COMPETITOR_PROFILES,
  assessAddressValidationCommercialParity,
  buildAgidAddressVerificationBenchmarkProfile,
  compareAddressVerificationProfiles,
  findAgidAddressVerificationGaps,
  scoreAddressVerificationProfile,
} from './addressVerificationBenchmark';

const aggregateMeasurementContract = {
  protocolVersion: ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  metricDefinitionVersion: ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
  corpusKind: 'aggregate-only' as const,
  scope: 'country-specific-holdout' as const,
  rawDataHandling: 'no-raw-addresses-or-responses-recorded' as const,
  testVectorDigest: 'a'.repeat(64),
  inputScriptClassCount: 3,
  availabilityObservationWindowSeconds: 86_400,
};

const addressFormatRoot = join(process.cwd(), 'src', 'data', 'address_formats');

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

test('builds the current AGID address verification benchmark profile from repository coverage', () => {
  const agid = buildAgidAddressVerificationBenchmarkProfile({
    addressFormatCountryCount: walkJsonFiles(addressFormatRoot).length,
    explicitPolicyCountryCount: Object.keys(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES).length,
  });

  assert.equal(agid.metrics.explicitPolicyCountries, Object.keys(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES).length);
  assert.equal(agid.metrics.authoritativePostalCountries, 0);
  assert.equal(agid.metrics.deliveryPointCountries, 0);
  assert.ok((agid.metrics.addressFormatCountries || 0) >= 280);
  assert.ok(scoreAddressVerificationProfile(agid) > 5);
  assert.ok(agid.scores.openSourceAuditability > 9);
  assert.ok(agid.scores.privacyLocalFirst > 9);
});

test('keeps AGID comparison honest against commercial delivery-point validators', () => {
  const agid = buildAgidAddressVerificationBenchmarkProfile({
    addressFormatCountryCount: walkJsonFiles(addressFormatRoot).length,
    explicitPolicyCountryCount: Object.keys(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES).length,
  });

  const ranked = compareAddressVerificationProfiles([agid,...ADDRESS_VERIFICATION_COMPETITOR_PROFILES]);
  const agidRank = ranked.findIndex(profile => profile.id === agid.id);
  const gaps = findAgidAddressVerificationGaps(agid, ADDRESS_VERIFICATION_COMPETITOR_PROFILES);

  assert.ok(agidRank > 0, 'AGID should not claim paid-API parity before authoritative delivery-point datasets are added');
  assert.ok(gaps.some(gap => gap.dimension === 'deliveryPointDepth' && gap.priority === 'high'));
  assert.ok(gaps.some(gap => gap.dimension === 'authoritativePostalDepth' && gap.priority === 'high'));
});

test('captures AGID advantages that commercial postal validators do not target', () => {
  const agid = buildAgidAddressVerificationBenchmarkProfile({
    addressFormatCountryCount: walkJsonFiles(addressFormatRoot).length,
    explicitPolicyCountryCount: Object.keys(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES).length,
  });

  const commercial = ADDRESS_VERIFICATION_COMPETITOR_PROFILES.filter(profile => profile.kind !== 'open-source');
  assert.ok(commercial.every(profile => agid.scores.naturalFeatureContext > profile.scores.naturalFeatureContext));
  assert.ok(commercial.every(profile => agid.scores.openSourceAuditability > profile.scores.openSourceAuditability));
  assert.ok(commercial.every(profile => agid.scores.costControl > profile.scores.costControl));
});

test('blocks commercial-comparison claims until official evidence and privacy gates are complete', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'US',
    officialEvidence: {
      format: true,
      postal: true,
      deliveryPoint: false,
      rights: false,
      version: true,
      freshness: false,
      correctionPath: false,
    },
    privacyBoundary: 'unknown-or-persistent',
  });

  assert.equal(readiness.status, 'blocked');
  assert.ok(readiness.blockers.includes('official-delivery-point'));
  assert.ok(readiness.blockers.includes('rights'));
  assert.ok(readiness.blockers.includes('privacy-boundary'));
  assert.ok(readiness.nextActions.includes('connect-an-authoritative-delivery-point-source'));
});

test('requires aggregate quality and operational measurements after evidence gates pass', () => {
  const readiness = assessAddressValidationCommercialParity({
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
    privacyBoundary: 'ephemeral-customer-controlled',
    evaluatedAt: '2026-07-23T00:00:00.000Z',
    aggregateEvaluation: {
      measuredAt: '2026-07-22T00:00:00.000Z',
      sampleCount: 1_000,
      exactMatchRate: 0.99,
      falseAcceptRate: 0.002,
      p95LatencyMs: 900,
      availabilityPct: 99.5,
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-sample-size'));
  assert.ok(readiness.blockers.includes('aggregate-measurement-contract'));
  assert.ok(readiness.blockers.includes('aggregate-false-accept-rate'));
});

test('allows an internal commercial-comparison release gate only with complete non-personal evidence and metrics', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'UK',
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
      measurementContract: aggregateMeasurementContract,
    },
  });

  assert.equal(readiness.countryCode, 'GB');
  assert.equal(readiness.status, 'commercial-comparison-eligible');
  assert.deepEqual(readiness.blockers, []);
  assert.match(readiness.nonClaim, /not a claim of equivalence/i);
});

test('requires an explicit timezone-qualified evaluation time for a commercial comparison', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'UK',
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
      measurementContract: aggregateMeasurementContract,
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-evaluation-freshness'));
});

test('does not treat synthetic comparison tolerance as semantic typo-correction evidence', () => {
  const readiness = assessAddressValidationCommercialParity({
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
      measurementContract: { ...aggregateMeasurementContract, corpusKind: 'synthetic' as const },
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-typo-correction-precision'));
  assert.ok(readiness.blockers.includes('aggregate-typo-correction-false-change-rate'));
  assert.ok(readiness.nextActions.includes('meet-the-country-specific-typo-correction-precision-threshold-in-an-aggregate-only-holdout-evaluation'));
});

test('requires aggregate script diversity before treating normalization as multilingual evidence', () => {
  const readiness = assessAddressValidationCommercialParity({
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
      measurementContract: { ...aggregateMeasurementContract, inputScriptClassCount: 1 },
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-multilingual-script-diversity'));
  assert.ok(readiness.nextActions.includes('record-at-least-2-input-script-classes-in-the-aggregate-only-normalization-holdout'));
});

test('requires a full availability observation window before accepting reliability metrics', () => {
  const readiness = assessAddressValidationCommercialParity({
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
      measurementContract: { ...aggregateMeasurementContract, availabilityObservationWindowSeconds: 3_600 },
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-availability-observation-window'));
  assert.ok(readiness.nextActions.includes('record-an-availability-observation-window-of-at-least-86400-seconds'));
});

test('does not accept stale aggregate measurements as commercial-comparison evidence', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'US',
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
      measuredAt: '2026-06-01T00:00:00.000Z',
      sampleCount: 12_000,
      exactMatchRate: 0.996,
      falseAcceptRate: 0.0008,
      p95LatencyMs: 450,
      availabilityPct: 99.95,
      normalizationExactMatchRate: 0.996,
      typoCorrectionPrecision: 0.995,
      typoCorrectionFalseChangeRate: 0.0008,
      measurementContract: aggregateMeasurementContract,
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-evaluation-freshness'));
  assert.ok(readiness.nextActions.includes('refresh-aggregate-evaluation-within-30-days'));
});

test('requires a versioned aggregate-only measurement contract and non-personal vector digest', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'US',
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
        ...aggregateMeasurementContract,
        rawDataHandling: 'not-recorded' as 'no-raw-addresses-or-responses-recorded',
        testVectorDigest: 'not-a-digest',
      },
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-measurement-contract'));
  assert.ok(readiness.blockers.includes('aggregate-test-vector-digest'));
});

test('does not accept overall address metrics without multilingual normalization and typo-correction aggregates', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'GT',
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
      measurementContract: aggregateMeasurementContract,
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-normalization-exact-match-rate'));
  assert.ok(readiness.blockers.includes('aggregate-typo-correction-precision'));
  assert.ok(readiness.blockers.includes('aggregate-typo-correction-false-change-rate'));
});

test('rejects impossible aggregate metric ranges even when threshold comparisons would otherwise pass', () => {
  const readiness = assessAddressValidationCommercialParity({
    countryCode: 'US',
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
      sampleCount: 12_000.5,
      exactMatchRate: 1.01,
      falseAcceptRate: -0.01,
      p95LatencyMs: -1,
      availabilityPct: 100.1,
      normalizationExactMatchRate: 1.01,
      typoCorrectionPrecision: 1.01,
      typoCorrectionFalseChangeRate: -0.01,
      measurementContract: aggregateMeasurementContract,
    },
  });

  assert.equal(readiness.status, 'measurement-required');
  assert.ok(readiness.blockers.includes('aggregate-sample-size'));
  assert.ok(readiness.blockers.includes('aggregate-exact-match-rate'));
  assert.ok(readiness.blockers.includes('aggregate-false-accept-rate'));
  assert.ok(readiness.blockers.includes('aggregate-p95-latency'));
  assert.ok(readiness.blockers.includes('aggregate-availability'));
  assert.ok(readiness.blockers.includes('aggregate-normalization-exact-match-rate'));
  assert.ok(readiness.blockers.includes('aggregate-typo-correction-precision'));
  assert.ok(readiness.blockers.includes('aggregate-typo-correction-false-change-rate'));
});
