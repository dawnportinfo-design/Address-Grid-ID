import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import {
  calculateAddressValidationQualityReportDigest,
  buildAddressValidationQualityReport,
} from './addressValidationQualityReport';
import {
  resolveAddressValidationQualityReportTrustedKey,
  verifyAddressValidationQualityReportWithKeyring,
} from './addressValidationQualityKeyring';

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
      protocolVersion: ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
      metricDefinitionVersion: ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
      corpusKind: 'synthetic',
      scope: 'country-specific-holdout',
      rawDataHandling: 'no-raw-addresses-or-responses-recorded',
      testVectorDigest: 'd'.repeat(64),
    },
  },
}, officialSourceEvidence);

const attestation = {
  algorithm: 'ed25519' as const,
  keyId: 'independent-quality-auditor-2026q3',
  signedAt: '2026-07-23T01:00:00.000Z',
  validUntil: '2026-08-01T00:00:00.000Z',
  reportDigest: calculateAddressValidationQualityReportDigest(report),
  signature: 'external-signature-placeholder',
};

const key = {
  id: attestation.keyId,
  algorithm: 'ed25519' as const,
  purpose: 'address-validation-quality-report' as const,
  // Deliberately invalid public material: this test exercises rejection paths only.
  publicKeyPem: 'not-a-public-key',
  validFrom: '2026-07-01T00:00:00.000Z',
  validUntil: '2026-09-01T00:00:00.000Z',
};

test('resolves only a key that is trusted for the report purpose and valid at attestation time', () => {
  assert.equal(resolveAddressValidationQualityReportTrustedKey([key], attestation)?.id, key.id);
  assert.equal(resolveAddressValidationQualityReportTrustedKey([
    { ...key, validUntil: '2026-07-20T00:00:00.000Z' },
  ], attestation), null);
});

test('rejects missing, expired, and cryptographically invalid external attestations', () => {
  const checkedAt = '2026-07-24T00:00:00.000Z';
  assert.deepEqual(
    verifyAddressValidationQualityReportWithKeyring(report, attestation, checkedAt, []),
    { status: 'trusted-key-not-found', reissueRequired: false },
  );
  assert.deepEqual(
    verifyAddressValidationQualityReportWithKeyring(report, attestation, checkedAt, [
      { ...key, validUntil: '2026-07-20T00:00:00.000Z' },
    ]),
    { status: 'trusted-key-not-valid-for-attestation', reissueRequired: true },
  );
  assert.deepEqual(
    verifyAddressValidationQualityReportWithKeyring(report, attestation, checkedAt, [key]),
    { status: 'signature-invalid', reissueRequired: true },
  );
});
