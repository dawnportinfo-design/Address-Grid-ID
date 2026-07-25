import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateSyntheticTypoTolerance } from './addressSyntheticTypoToleranceEvaluation';

test('measures safe typographic equivalence without producing a spelling correction', () => {
  const evaluation = evaluateSyntheticTypoTolerance([
    {
      scenarioId: 'punctuation-001',
      canonical: 'ALPHA-BETA',
      variant: 'alpha beta',
      shouldMatch: true,
    },
    {
      scenarioId: 'letter-substitution-001',
      canonical: 'ALPHA',
      variant: 'ALPHE',
      shouldMatch: false,
    },
  ]);

  assert.equal(evaluation.retention, 'ephemeral-inputs-aggregate-output-only');
  assert.equal(evaluation.sampleCount, 2);
  assert.equal(evaluation.equivalencePrecision, 1);
  assert.equal(evaluation.equivalenceRecall, 1);
  assert.equal(evaluation.falseEquivalenceRate, 0);
  assert.equal(evaluation.correctionBoundary, 'comparison-only-no-suggested-or-automatic-semantic-correction');
  assert.match(evaluation.testVectorDigest, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(evaluation), /ALPHA|ALPHE/);
});

test('records missed semantic typo cases instead of guessing a correction', () => {
  const evaluation = evaluateSyntheticTypoTolerance([{
    scenarioId: 'semantic-typo-001',
    canonical: 'ALPHA',
    variant: 'ALPHE',
    shouldMatch: true,
  }]);

  assert.equal(evaluation.equivalenceRecall, 0);
  assert.equal(evaluation.falseEquivalenceRate, 0);
});
