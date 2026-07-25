import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import { buildAddressValidationQualityReport } from './addressValidationQualityReport';
import {
  buildAddressValidationQualityReportExport,
  preflightAddressValidationQualityReportExport,
  serializeAddressValidationQualityReportExport,
} from './addressValidationQualityReportExport';

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
      testVectorDigest: 'a'.repeat(64),
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
});

test('exports a deterministic aggregate-only report envelope', () => {
  const exported = buildAddressValidationQualityReportExport(report);
  const serialized = serializeAddressValidationQualityReportExport(report);

  assert.equal(exported.publicationScope, 'public-pending-independent-signature');
  assert.match(exported.reportDigest, /^[a-f0-9]{64}$/);
  assert.deepEqual(exported.privacy, {
    containsRawAddressData: false,
    containsProviderResponses: false,
    containsCredentialsOrKeyMaterial: false,
  });
  assert.equal(serialized, serializeAddressValidationQualityReportExport(report));
  assert.doesNotMatch(serialized, /BEGIN PUBLIC KEY|recipient|privateKey/i);
  assert.deepEqual(preflightAddressValidationQualityReportExport(exported), {
    status: 'independent-signature-required',
    errors: [],
    nextActions: ['obtain-and-verify-an-independent-signature-over-the-report-digest-before-publication'],
    nonClaim: 'Passing export preflight does not publish the report or establish address-validation parity.',
  });
});

test('refuses a report-shaped object containing a forbidden sensitive property', () => {
  assert.throws(
    () => buildAddressValidationQualityReportExport({ ...report, location: 'disallowed-payload' } as typeof report),
    /Sensitive property is not permitted/,
  );
});

test('rejects postal and contact-shaped properties even when they are nested in an aggregate report', () => {
  const candidate = {
    ...report,
    aggregateMetrics: {
      ...report.aggregateMetrics,
      postalCode: 'withheld-token',
      contact: { phone: 'withheld-token' },
    },
  };

  assert.throws(
    () => buildAddressValidationQualityReportExport(candidate as unknown as typeof report),
    /Sensitive property is not permitted/,
  );
  const preflight = preflightAddressValidationQualityReportExport({
    ...buildAddressValidationQualityReportExport(report),
    report: candidate,
  });
  assert.equal(preflight.status, 'invalid-export');
  assert.ok(preflight.errors.includes('report-contains-forbidden-sensitive-property'));
});

test('rejects unknown report properties instead of accepting alternate payload names', () => {
  const candidate = {
    ...report,
    aggregateMetrics: {
      ...report.aggregateMetrics,
      opaquePayload: 'withheld-token',
    },
  };

  assert.throws(
    () => buildAddressValidationQualityReportExport(candidate as unknown as typeof report),
    /Unexpected property is not permitted/,
  );
  const preflight = preflightAddressValidationQualityReportExport({
    ...buildAddressValidationQualityReportExport(report),
    report: candidate,
  });
  assert.equal(preflight.status, 'invalid-export');
  assert.ok(preflight.errors.includes('report-contains-forbidden-sensitive-property'));
});

test('rejects altered report hashes and invalid privacy declarations before publication', () => {
  const exported = buildAddressValidationQualityReportExport(report);
  const altered = preflightAddressValidationQualityReportExport({
    ...exported,
    reportDigest: '0'.repeat(64),
    privacy: { ...exported.privacy, containsProviderResponses: true },
  });

  assert.equal(altered.status, 'invalid-export');
  assert.ok(altered.errors.includes('report-digest-mismatch'));
  assert.ok(altered.errors.includes('privacy-declaration-invalid'));
});
