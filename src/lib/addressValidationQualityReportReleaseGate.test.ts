import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import { buildAddressValidationQualityReport } from './addressValidationQualityReport';
import { buildAddressValidationQualityReportExport } from './addressValidationQualityReportExport';
import { calculateAddressValidationQualityReportDigest } from './addressValidationQualityReport';
import { assessAddressValidationQualityReportRelease } from './addressValidationQualityReportReleaseGate';

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
      corpusKind: 'aggregate-only',
      scope: 'country-specific-holdout',
      rawDataHandling: 'no-raw-addresses-or-responses-recorded',
      testVectorDigest: 'b'.repeat(64),
      inputScriptClassCount: 3,
      availabilityObservationWindowSeconds: 86_400,
    },
  },
}, {
  sourceId: 'official-postal-authority',
  sourceVersion: '2026.07',
  sourceUrl: 'https://example.invalid/source',
  retrievedAt: '2026-07-22T00:00:00.000Z',
  validUntil: '2026-09-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
});

const exported = buildAddressValidationQualityReportExport(report);
const attestation = {
  algorithm: 'ed25519' as const,
  keyId: 'unconfigured-independent-auditor',
  signedAt: '2026-07-23T01:00:00.000Z',
  validUntil: '2026-09-01T00:00:00.000Z',
  reportDigest: calculateAddressValidationQualityReportDigest(report),
  signature: 'external-signature-placeholder',
};

test('blocks a release without a trusted independent signing key', () => {
  const assessment = assessAddressValidationQualityReportRelease(
    exported,
    attestation,
    '2026-07-24T00:00:00.000Z',
    [],
  );

  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.blockers, ['trusted-key-not-found']);
  assert.match(assessment.nonClaim, /only blocks publication/i);
});

test('blocks malformed exports before attempting signature validation', () => {
  const assessment = assessAddressValidationQualityReportRelease(
    { ...exported, reportDigest: '0'.repeat(64) },
    attestation,
    '2026-07-24T00:00:00.000Z',
    [],
  );

  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.includes('report-digest-mismatch'));
});

test('blocks a signed-release request while official source evidence is in its renewal window', () => {
  const renewalDueLedger = {
    version: 'address-validation-official-source-evidence-ledger-v1',
    countryCode: 'GB',
    records: [{
      sourceId: 'official-postal-authority',
      sourceVersion: '2026.07',
      sourceUrl: 'https://example.invalid/source',
      retrievedAt: '2026-07-22T00:00:00.000Z',
      validUntil: '2026-08-01T00:00:00.000Z',
      rightsUrl: 'https://example.invalid/terms',
      correctionUrl: 'https://example.invalid/corrections',
    }],
  };
  const renewalDueReport = buildAddressValidationQualityReport({
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
        corpusKind: 'aggregate-only',
        scope: 'country-specific-holdout',
        rawDataHandling: 'no-raw-addresses-or-responses-recorded',
        testVectorDigest: 'c'.repeat(64),
        inputScriptClassCount: 3,
        availabilityObservationWindowSeconds: 86_400,
      },
    },
  }, {
    sourceId: 'official-postal-authority',
    sourceVersion: '2026.07',
    sourceUrl: 'https://example.invalid/source',
    retrievedAt: '2026-07-22T00:00:00.000Z',
    validUntil: '2026-08-01T00:00:00.000Z',
    rightsUrl: 'https://example.invalid/terms',
    correctionUrl: 'https://example.invalid/corrections',
  }, renewalDueLedger);
  const assessment = assessAddressValidationQualityReportRelease(
    buildAddressValidationQualityReportExport(renewalDueReport),
    attestation,
    '2026-07-23T00:00:00.000Z',
    [],
  );

  assert.equal(renewalDueReport.publicationStatus, 'internal-only-source-evidence-not-current');
  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.nextActions.includes('resolve-evidence-or-measurement-blockers-before-requesting-an-independent-signature'));
});

test('rechecks source freshness at release time before accepting a valid signature', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const staleAtReleaseReport = buildAddressValidationQualityReport({
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
    evaluatedAt: '2026-07-10T00:00:00.000Z',
    aggregateEvaluation: {
      measuredAt: '2026-07-09T00:00:00.000Z',
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
        corpusKind: 'aggregate-only',
        scope: 'country-specific-holdout',
        rawDataHandling: 'no-raw-addresses-or-responses-recorded',
        testVectorDigest: 'd'.repeat(64),
        inputScriptClassCount: 3,
        availabilityObservationWindowSeconds: 86_400,
      },
    },
  }, {
    sourceId: 'official-postal-authority',
    sourceVersion: '2026.07',
    sourceUrl: 'https://example.invalid/source',
    retrievedAt: '2026-07-09T00:00:00.000Z',
    validUntil: '2026-08-01T00:00:00.000Z',
    rightsUrl: 'https://example.invalid/terms',
    correctionUrl: 'https://example.invalid/corrections',
  });
  const reportDigest = calculateAddressValidationQualityReportDigest(staleAtReleaseReport);
  const validAttestation = {
    algorithm: 'ed25519' as const,
    keyId: 'ephemeral-rehearsal-auditor',
    signedAt: '2026-07-10T01:00:00.000Z',
    validUntil: '2026-08-15T00:00:00.000Z',
    reportDigest,
    signature: sign(
      null,
      Buffer.from(`agid-address-validation-quality-report.${reportDigest}`, 'utf8'),
      privateKey,
    ).toString('base64url'),
  };
  const trustedKeys = [{
    id: validAttestation.keyId,
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    validFrom: '2026-07-01T00:00:00.000Z',
    validUntil: '2026-09-01T00:00:00.000Z',
  }];

  const assessment = assessAddressValidationQualityReportRelease(
    buildAddressValidationQualityReportExport(staleAtReleaseReport),
    validAttestation,
    '2026-07-24T00:00:00.000Z',
    trustedKeys,
  );

  assert.equal(staleAtReleaseReport.publicationStatus, 'awaiting-independent-signature');
  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.blockers, ['official-source-evidence-renewal-due-at-release']);
});

test('blocks a signed release when report provenance omits the correction path', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const reportWithMissingCorrectionPath = {
    ...report,
    officialSourceEvidence: {
      ...report.officialSourceEvidence,
      correctionUrl: null,
    },
  };
  const reportDigest = calculateAddressValidationQualityReportDigest(reportWithMissingCorrectionPath);
  const validAttestation = {
    algorithm: 'ed25519' as const,
    keyId: 'ephemeral-rehearsal-auditor',
    signedAt: '2026-07-23T01:00:00.000Z',
    validUntil: '2026-08-15T00:00:00.000Z',
    reportDigest,
    signature: sign(
      null,
      Buffer.from(`agid-address-validation-quality-report.${reportDigest}`, 'utf8'),
      privateKey,
    ).toString('base64url'),
  };
  const trustedKeys = [{
    id: validAttestation.keyId,
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    validFrom: '2026-07-01T00:00:00.000Z',
    validUntil: '2026-09-01T00:00:00.000Z',
  }];

  const assessment = assessAddressValidationQualityReportRelease(
    buildAddressValidationQualityReportExport(reportWithMissingCorrectionPath),
    validAttestation,
    '2026-07-24T00:00:00.000Z',
    trustedKeys,
  );

  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.blockers, ['official-source-correction-url-invalid-at-release']);
});

test('blocks a cryptographically valid attestation that predates the report evaluation', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const reportDigest = calculateAddressValidationQualityReportDigest(report);
  const attestation = {
    algorithm: 'ed25519' as const,
    keyId: 'ephemeral-rehearsal-auditor',
    signedAt: '2026-07-22T23:59:59.000Z',
    validUntil: '2026-08-01T00:00:00.000Z',
    reportDigest,
    signature: sign(
      null,
      Buffer.from(`agid-address-validation-quality-report.${reportDigest}`, 'utf8'),
      privateKey,
    ).toString('base64url'),
  };
  const trustedKeys = [{
    id: attestation.keyId,
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    validFrom: '2026-07-01T00:00:00.000Z',
    validUntil: '2026-09-01T00:00:00.000Z',
  }];

  const assessment = assessAddressValidationQualityReportRelease(
    exported,
    attestation,
    '2026-07-24T00:00:00.000Z',
    trustedKeys,
  );

  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.blockers, ['independent-attestation-predates-report-evaluation']);
});

test('blocks a report that predates its aggregate measurement and official source retrieval', () => {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const chronologicallyInvalidReport = {
    ...report,
    evaluatedAt: '2026-07-21T00:00:00.000Z',
  };
  const reportDigest = calculateAddressValidationQualityReportDigest(chronologicallyInvalidReport);
  const attestation = {
    algorithm: 'ed25519' as const,
    keyId: 'ephemeral-rehearsal-auditor',
    signedAt: '2026-07-23T01:00:00.000Z',
    validUntil: '2026-08-01T00:00:00.000Z',
    reportDigest,
    signature: sign(
      null,
      Buffer.from(`agid-address-validation-quality-report.${reportDigest}`, 'utf8'),
      privateKey,
    ).toString('base64url'),
  };
  const trustedKeys = [{
    id: attestation.keyId,
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    validFrom: '2026-07-01T00:00:00.000Z',
    validUntil: '2026-09-01T00:00:00.000Z',
  }];

  const assessment = assessAddressValidationQualityReportRelease(
    buildAddressValidationQualityReportExport(chronologicallyInvalidReport),
    attestation,
    '2026-07-24T00:00:00.000Z',
    trustedKeys,
  );

  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.blockers, [
    'quality-report-evaluation-predates-aggregate-measurement',
    'quality-report-evaluation-predates-source-retrieval',
  ]);
});

test('passes the release gate for a cryptographically verified aggregate-only rehearsal attestation', () => {
  // The private half exists only in this test process and is never serialized or logged.
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const reportDigest = calculateAddressValidationQualityReportDigest(report);
  const rehearsalAttestation = {
    algorithm: 'ed25519' as const,
    keyId: 'ephemeral-rehearsal-auditor',
    signedAt: '2026-07-23T01:00:00.000Z',
    validUntil: '2026-08-01T00:00:00.000Z',
    reportDigest,
    signature: sign(
      null,
      Buffer.from(`agid-address-validation-quality-report.${reportDigest}`, 'utf8'),
      privateKey,
    ).toString('base64url'),
  };
  const trustedKeys = [{
    id: rehearsalAttestation.keyId,
    algorithm: 'ed25519' as const,
    purpose: 'address-validation-quality-report' as const,
    publicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    validFrom: '2026-07-01T00:00:00.000Z',
    validUntil: '2026-09-01T00:00:00.000Z',
  }];

  const assessment = assessAddressValidationQualityReportRelease(
    exported,
    rehearsalAttestation,
    '2026-07-24T00:00:00.000Z',
    trustedKeys,
  );

  assert.equal(assessment.status, 'publishable-aggregate-evidence');
  assert.deepEqual(assessment.blockers, []);
  assert.match(assessment.nonClaim, /signed aggregate evidence only/i);
});
