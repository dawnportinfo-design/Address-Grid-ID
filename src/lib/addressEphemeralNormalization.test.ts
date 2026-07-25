import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeAddressPartEphemerally } from './addressEphemeralNormalization';

test('normalizes safe typographic variation into an ephemeral comparison key', () => {
  const result = normalizeAddressPartEphemerally('  S\u00E3o\u2013Paulo  ');

  assert.equal(result.retention, 'ephemeral-caller-controlled-no-persistence');
  assert.equal(result.normalizedDisplay, 'S\u00E3o-Paulo');
  assert.equal(result.comparisonKey, 'sao paulo');
  assert.equal(result.correctionBoundary, 'typographic-only-no-semantic-or-delivery-point-correction');
});

test('can produce a country-aware English display without claiming a postal correction', () => {
  const result = normalizeAddressPartEphemerally('\u0391\u03B8\u03AE\u03BD\u03B1', 'GR');

  assert.equal(result.englishDisplay, 'Athens');
  assert.ok(result.transformations.includes('diacritic-folding'));
  assert.equal(result.correctionBoundary, 'typographic-only-no-semantic-or-delivery-point-correction');
});
