import assert from 'node:assert/strict';
import { test } from 'node:test';

import { boundSyntheticTypoToleranceForCommercialParity } from './addressSyntheticTypoToleranceParityBoundary';
import { evaluateSyntheticTypoTolerance } from './addressSyntheticTypoToleranceEvaluation';

test('keeps synthetic comparison tolerance out of semantic typo-correction release metrics', () => {
  const evaluation = evaluateSyntheticTypoTolerance([{
    scenarioId: 'punctuation-001',
    canonical: 'ALPHA-BETA',
    variant: 'alpha beta',
    shouldMatch: true,
  }]);
  const boundary = boundSyntheticTypoToleranceForCommercialParity(evaluation);

  assert.deepEqual(boundary.commercialMetricEligibility, {
    typoCorrectionPrecision: false,
    typoCorrectionFalseChangeRate: false,
  });
  assert.deepEqual(boundary.remainingCommercialParityGates, [
    'aggregate-typo-correction-precision',
    'aggregate-typo-correction-false-change-rate',
  ]);
  assert.equal(boundary.comparisonTolerance.equivalencePrecision, 1);
  assert.doesNotMatch(JSON.stringify(boundary), /ALPHA/);
  assert.match(boundary.nonClaim, /does not measure semantic typo correction/i);
});
