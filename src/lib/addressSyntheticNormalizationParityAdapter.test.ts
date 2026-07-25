import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateSyntheticAddressNormalization } from './addressSyntheticNormalizationEvaluation';
import { adaptSyntheticNormalizationEvaluationForCommercialParity } from './addressSyntheticNormalizationParityAdapter';

test('maps only measured synthetic normalization evidence and leaves typo gates unmet', () => {
  const evaluation = evaluateSyntheticAddressNormalization([{
    scenarioId: 'typography-001',
    input: 'ALPHA\u2013BETA',
    expectedComparisonKey: 'alpha beta',
  }]);
  const evidence = adaptSyntheticNormalizationEvaluationForCommercialParity(evaluation);

  assert.equal(evidence.normalizationExactMatchRate, 1);
  assert.equal(evidence.testVectorDigest, evaluation.testVectorDigest);
  assert.equal(evidence.retention, 'ephemeral-inputs-aggregate-output-only');
  assert.deepEqual(evidence.remainingCommercialParityGates, [
    'aggregate-typo-correction-precision',
    'aggregate-typo-correction-false-change-rate',
  ]);
  assert.match(evidence.nonClaim, /does not measure semantic typo correction/i);
  assert.doesNotMatch(JSON.stringify(evidence), /ALPHA/);
});
