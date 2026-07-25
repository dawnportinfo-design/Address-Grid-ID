import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateSyntheticAddressNormalization } from './addressSyntheticNormalizationEvaluation';

test('returns aggregate-only normalization metrics without echoing synthetic inputs', () => {
  const evaluation = evaluateSyntheticAddressNormalization([
    {
      scenarioId: 'typography-001',
      input: '  ALPHA\u2013BETA  ',
      expectedComparisonKey: 'alpha beta',
    },
    {
      scenarioId: 'diacritic-001',
      input: 'R\u00E9sum\u00E9',
      expectedComparisonKey: 'resume',
    },
    {
      scenarioId: 'transliteration-001',
      countryCode: 'GR',
      input: '\u0391\u03B8\u03AE\u03BD\u03B1',
      expectedComparisonKey: '\u03B1\u03B8\u03B7\u03BD\u03B1',
      expectedEnglishDisplay: 'Athens',
    },
  ]);

  assert.equal(evaluation.retention, 'ephemeral-inputs-aggregate-output-only');
  assert.equal(evaluation.sampleCount, 3);
  assert.equal(evaluation.countryScopedCaseCount, 1);
  assert.equal(evaluation.inputScriptClassCount, 2);
  assert.equal(evaluation.comparisonKeyExactMatchRate, 1);
  assert.equal(evaluation.englishDisplayExactMatchRate, 1);
  assert.equal(evaluation.unexpectedChangeRate, 0);
  assert.match(evaluation.testVectorDigest, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(evaluation), /ALPHA|R\u00E9sum\u00E9|\u0391\u03B8\u03AE\u03BD\u03B1/);
  assert.match(evaluation.nonClaim, /synthetic text-normalization measurement/i);
});

test('records aggregate misses without retaining the underlying scenario text', () => {
  const evaluation = evaluateSyntheticAddressNormalization([
    {
      scenarioId: 'miss-001',
      input: 'ALPHA',
      expectedComparisonKey: 'different',
    },
  ]);

  assert.equal(evaluation.comparisonKeyExactMatchRate, 0);
  assert.equal(evaluation.countryScopedCaseCount, 0);
  assert.equal(evaluation.inputScriptClassCount, 1);
  assert.equal(evaluation.unexpectedChangeRate, 0);
});
