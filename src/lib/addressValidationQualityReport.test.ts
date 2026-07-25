import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import {
  assessAddressValidationQualityReportAttestation,
  buildAddressValidationQualityReport,
  calculateAddressValidationQualityReportDigest,
} from './addressValidationQualityReport';
import { ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION } from './addressValidationOfficialSourceEvidenceLedger';

const measurementContract = {
  protocolVersion: ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  metricDefinitionVersion: ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
  corpusKind: 'aggregate-only' as const,
  scope: 'country-specific-holdout' as const,
  rawDataHandling: 'no-raw-addresses-or-responses-recorded' as const,
  testVectorDigest: 'b'.repeat(64),
  inputScriptClassCount: 3,
  availabilityObservationWindowSeconds: 86_400,
};

const officialSourceEvidence = {
  sourceId: 'synthetic-official-source-metadata',
  sourceVersion: '2026.07',
  sourceUrl: 'https://example.invalid/source',
  retrievedAt: '2026-07-22T00:00:00.000Z',
  validUntil: '2026-08-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
};

test('keeps incomplete country quality evidence internal-only', () => {
  const report = buildAddressValidationQualityReport({
    countryCode: 'GT',
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
  }, officialSourceEvidence);

  assert.equal(report.publicationStatus, 'internal-only-evidence-incomplete');
  assert.equal(report.aggregateMetrics, null);
  assert.equal(report.measurementTrace, null);
  assert.ok(report.gateSummary.blockers.includes('official-delivery-point'));
});

test('builds an aggregate-only report that still requires an independent signature', () => {
  const report = buildAddressValidationQualityReport({
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
      measurementContract,
    },
  }, officialSourceEvidence);

  assert.equal(report.countryCode, 'GB');
  assert.equal(report.publicationStatus, 'awaiting-independent-signature');
  assert.equal(report.integrity.status, 'external-signature-required');
  assert.equal(report.integrity.supportedAlgorithm, 'ed25519');
  assert.equal(report.aggregateMetrics?.sampleCount, 12_000);
  assert.equal(report.measurementTrace?.rawDataHandling, 'no-raw-addresses-or-responses-recorded');
  assert.equal(report.officialSourceEvidence.status, 'fresh');
  assert.equal(report.officialSourceEvidence.sourceUrl, officialSourceEvidence.sourceUrl);
  assert.equal(report.officialSourceEvidence.rightsUrl, officialSourceEvidence.rightsUrl);
  assert.equal(report.officialSourceEvidence.correctionUrl, officialSourceEvidence.correctionUrl);
  assert.match(report.nonClaim, /not a deliverability result/i);
});

test('requires an unexpired attestation over the exact canonical report digest', () => {
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
      measurementContract,
    },
  }, officialSourceEvidence);
  const digest = calculateAddressValidationQualityReportDigest(report);
  const baseAttestation = {
    algorithm: 'ed25519' as const,
    keyId: 'independent-quality-auditor-2026q3',
    signedAt: '2026-07-23T01:00:00.000Z',
    validUntil: '2026-08-01T00:00:00.000Z',
    reportDigest: digest,
    signature: 'placeholder-external-signature',
  };

  assert.equal(calculateAddressValidationQualityReportDigest(report), digest);
  assert.deepEqual(
    assessAddressValidationQualityReportAttestation(report, baseAttestation, '2026-07-24T00:00:00.000Z'),
    {
      status: 'signature-verification-required',
      reissueRequired: false,
      signaturePayload: `agid-address-validation-quality-report.${digest}`,
    },
  );

  const expired = assessAddressValidationQualityReportAttestation(
    report,
    { ...baseAttestation, validUntil: '2026-07-23T23:00:00.000Z' },
    '2026-07-24T00:00:00.000Z',
  );
  assert.equal(expired.status, 'attestation-expired');
  assert.equal(expired.reissueRequired, true);

  const mismatched = assessAddressValidationQualityReportAttestation(
    report,
    { ...baseAttestation, reportDigest: 'c'.repeat(64) },
    '2026-07-24T00:00:00.000Z',
  );
  assert.equal(mismatched.status, 'report-digest-mismatch');
  assert.equal(mismatched.reissueRequired, true);
});

test('does not advance a performance-ready report when official source evidence has expired', () => {
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
      measurementContract,
    },
  }, { ...officialSourceEvidence, validUntil: '2026-07-23T00:00:00.000Z' });

  assert.equal(report.publicationStatus, 'internal-only-source-evidence-not-current');
  assert.equal(report.officialSourceEvidence.status, 'missing-or-not-current');
});

test('surfaces the country source update queue in a quality report and blocks a stale ledger', () => {
  const input = {
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
      measurementContract,
    },
  };
  const renewalDueLedger = {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode: 'GB',
    records: [{ ...officialSourceEvidence, sourceId: 'official-postal-authority', validUntil: '2026-07-30T00:00:00.000Z' }],
  };
  const renewalDue = buildAddressValidationQualityReport(input, officialSourceEvidence, renewalDueLedger);
  assert.equal(renewalDue.publicationStatus, 'internal-only-source-evidence-not-current');
  assert.deepEqual(renewalDue.officialSourceUpdate, {
    status: 'renewal-due',
    sourceIds: ['official-postal-authority'],
  });

  const blocked = buildAddressValidationQualityReport(input, officialSourceEvidence, {
    ...renewalDueLedger,
    records: [{ ...renewalDueLedger.records[0], validUntil: '2026-07-22T00:00:00.000Z' }],
  });
  assert.equal(blocked.publicationStatus, 'internal-only-source-evidence-not-current');
  assert.equal(blocked.officialSourceUpdate.status, 'blocking');
});

test('does not let a report rely on a different source than the current country ledger record', () => {
  const input = {
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
      measurementContract,
    },
  };
  const unrelatedButCurrentLedger = {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode: 'GB',
    records: [{
      ...officialSourceEvidence,
      sourceId: 'different-official-source',
      validUntil: '2026-09-01T00:00:00.000Z',
    }],
  };
  const report = buildAddressValidationQualityReport(input, officialSourceEvidence, unrelatedButCurrentLedger);

  assert.equal(report.publicationStatus, 'internal-only-source-evidence-not-current');
  assert.equal(report.officialSourceEvidence.status, 'missing-or-not-current');
  assert.equal(report.officialSourceUpdate.status, 'current');
  assert.ok(report.gateSummary.blockers.includes('official-source-evidence-ledger-provenance-mismatch'));
});
