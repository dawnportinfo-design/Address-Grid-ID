import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAddressQualitySummary } from './addressQualitySummary';
import type { AddressValidationResult } from './addressValidation';

const baseValidation: AddressValidationResult = {
  status: 'verified',
  score: 0.86,
  postalCodeValid: true,
  missingRequiredFields: [],
  warnings: [],
  checkedWith: ['libaddressinput', 'open-address-format-rules', 'OpenAddresses', 'Nominatim', 'extra-source'],
  quality: {
    mode: 'postal-verified',
    label: 'Verified',
    reason: 'Reliable postal metadata is available.',
    canAutofill: true,
    shouldOverwriteUserInput: false,
  },
  displays: {},
};

test('address quality summary turns validation into compact confidence display text', () => {
  const summary = getAddressQualitySummary(baseValidation);

  assert.equal(summary.label, 'Verified');
  assert.equal(summary.confidenceLabel, 'Confidence 86%');
  assert.equal(summary.postalLabel, 'Postcode OK');
  assert.equal(summary.explanation, 'Reliable postal metadata is available.');
  assert.deepEqual(summary.sources, ['libaddressinput', 'open-address-format-rules', 'OpenAddresses', 'Nominatim']);
});

test('address quality summary explains weak postal checks without claiming verification', () => {
  const summary = getAddressQualitySummary({
    ...baseValidation,
    status: 'partial',
    score: 0.42,
    postalCodeValid: false,
    warnings: ['Invalid postcode format for the selected country'],
    quality: {
      mode: 'partial-postal',
      label: 'Partial',
      reason: 'Postal code format did not match the selected country rules.',
      canAutofill: false,
      shouldOverwriteUserInput: false,
    },
  });

  assert.equal(summary.label, 'Partial');
  assert.equal(summary.confidenceLabel, 'Confidence 42%');
  assert.equal(summary.postalLabel, 'Postcode needs review');
  assert.equal(summary.warning, 'Invalid postcode format for the selected country');
  assert.match(summary.modeDescription, /needs confirmation/);
});
