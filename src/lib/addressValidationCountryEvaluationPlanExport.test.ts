import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_VERSION } from './addressValidationCountryEvaluationPlan';
import {
  buildAddressValidationCountryEvaluationPlanExport,
  calculateAddressValidationCountryEvaluationPlanDigest,
  preflightAddressValidationCountryEvaluationPlanExport,
} from './addressValidationCountryEvaluationPlanExport';

const plan = {
  version: ADDRESS_VALIDATION_COUNTRY_EVALUATION_PLAN_VERSION,
  countries: [{
    countryCode: 'GT',
    phase: 'source-evidence-remediation' as const,
    priority: 'blocking' as const,
    blockers: ['official-source-evidence-expired-or-invalid'],
    nextAction: 'resolve-country-source-evidence-blockers-before-quality-comparison',
    measurementFreshness: {
      version: 'address-validation-aggregate-measurement-freshness-v1',
      status: 'missing' as const,
      measuredAt: null,
      refreshDueAt: null,
      nonClaim: 'No aggregate measurement is available.',
    },
    reassessBy: '2026-07-23T00:00:00.000Z',
  }],
  nonClaim: 'Metadata-only test fixture.',
};

test('builds a deterministic metadata-only export for internal review', () => {
  const exported = buildAddressValidationCountryEvaluationPlanExport(plan);

  assert.equal(exported.publicationScope, 'internal-review-only');
  assert.equal(exported.planDigest, calculateAddressValidationCountryEvaluationPlanDigest(plan));
  assert.deepEqual(preflightAddressValidationCountryEvaluationPlanExport(exported), {
    status: 'internal-review-only',
    errors: [],
    nextActions: ['review-source-evidence-and-measurement-gates-without-adding-raw-data-to-the-export'],
    nonClaim: 'Passing this preflight permits internal review only. It does not authorize public release or establish address-validation quality.',
  });
});

test('rejects altered digests and plan-shaped values with sensitive properties', () => {
  const exported = buildAddressValidationCountryEvaluationPlanExport(plan);
  assert.equal(
    preflightAddressValidationCountryEvaluationPlanExport({ ...exported, planDigest: '0'.repeat(64) }).status,
    'invalid-export',
  );
  const malformed = {
    ...exported,
    plan: { ...plan, addressLine: 'not-permitted' },
  };
  const assessment = preflightAddressValidationCountryEvaluationPlanExport(malformed);
  assert.equal(assessment.status, 'invalid-export');
  assert.ok(assessment.errors.includes('plan-contains-forbidden-sensitive-property'));
});
