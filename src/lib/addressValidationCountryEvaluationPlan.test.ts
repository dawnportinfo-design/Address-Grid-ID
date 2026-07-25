import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION,
  ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION,
} from './addressVerificationBenchmark';
import { buildAddressValidationCountryEvaluationPlan } from './addressValidationCountryEvaluationPlan';
import { buildAddressValidationQualityReport } from './addressValidationQualityReport';
import { ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION } from './addressValidationOfficialSourceEvidenceLedger';
import { buildAddressValidationOfficialSourcePortfolio } from './addressValidationOfficialSourcePortfolio';

function ledger(countryCode: string, validUntil: string) {
  return {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode,
    records: [{
      sourceId: `${countryCode.toLowerCase()}-official-source`,
      sourceVersion: '2026.07',
      sourceUrl: 'https://example.invalid/source',
      retrievedAt: '2026-07-20T00:00:00.000Z',
      validUntil,
      rightsUrl: 'https://example.invalid/terms',
      correctionUrl: 'https://example.invalid/corrections',
    }],
  };
}

function readyReport(countryCode: string) {
  return buildAddressValidationQualityReport({
    countryCode,
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
    sourceId: `${countryCode.toLowerCase()}-official-source`,
    sourceVersion: '2026.07',
    sourceUrl: 'https://example.invalid/source',
    retrievedAt: '2026-07-20T00:00:00.000Z',
    validUntil: '2026-09-01T00:00:00.000Z',
    rightsUrl: 'https://example.invalid/terms',
    correctionUrl: 'https://example.invalid/corrections',
  });
}

test('routes each country to the earliest unmet quality gate without handling address data', () => {
  const portfolio = buildAddressValidationOfficialSourcePortfolio([
    ledger('GB', '2026-09-01T00:00:00.000Z'),
    ledger('GT', '2026-07-30T00:00:00.000Z'),
    ledger('US', '2026-07-22T00:00:00.000Z'),
  ], '2026-07-23T00:00:00.000Z');
  const plan = buildAddressValidationCountryEvaluationPlan(portfolio, [readyReport('GB'), readyReport('FR')]);

  assert.deepEqual(plan.countries.map(({ measurementFreshness: _measurementFreshness, reassessBy: _reassessBy, ...country }) => country), [
    {
      countryCode: 'FR',
      phase: 'source-evidence-remediation',
      priority: 'blocking',
      blockers: ['official-source-evidence-ledger-missing'],
      nextAction: 'record-current-official-source-rights-version-freshness-and-correction-evidence',
    },
    {
      countryCode: 'GB',
      phase: 'independent-signature',
      priority: 'normal',
      blockers: [],
      nextAction: 'obtain-and-verify-an-independent-signature-over-the-aggregate-quality-report',
    },
    {
      countryCode: 'GT',
      phase: 'source-evidence-remediation',
      priority: 'high',
      blockers: ['official-source-evidence-renewal-due'],
      nextAction: 'refresh-country-source-evidence-before-expiry',
    },
    {
      countryCode: 'US',
      phase: 'source-evidence-remediation',
      priority: 'blocking',
      blockers: ['official-source-evidence-expired-or-invalid', 'source-evidence-expired-or-invalid'],
      nextAction: 'resolve-country-source-evidence-blockers-before-quality-comparison',
    },
  ]);
  assert.deepEqual(plan.countries.find(country => country.countryCode === 'GB')?.measurementFreshness, {
    version: 'address-validation-aggregate-measurement-freshness-v1',
    status: 'current',
    measuredAt: '2026-07-22T00:00:00.000Z',
    refreshDueAt: '2026-08-21T00:00:00.000Z',
    nonClaim: 'This is a freshness calculation for aggregate-only evaluation metadata. It does not retain evaluation inputs, provider responses, or individual address results.',
  });
  assert.equal(
    plan.countries.find(country => country.countryCode === 'GB')?.reassessBy,
    '2026-08-21T00:00:00.000Z',
  );
  assert.equal(plan.countries.find(country => country.countryCode === 'GT')?.measurementFreshness.status, 'missing');
  assert.equal(plan.countries.find(country => country.countryCode === 'GT')?.reassessBy, '2026-07-23T00:00:00.000Z');
  assert.match(plan.nonClaim, /does not process address inputs/i);
});
