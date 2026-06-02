import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
SOUTHEAST_ASIA_ADDRESS_RULES,
getSoutheastAsiaAddressRule,
} from './southeastAsiaAddressRules';

test('covers the Southeast Asia English-tab address countries from the reference table', () => {
  assert.deepEqual(
    Object.keys(SOUTHEAST_ASIA_ADDRESS_RULES),
    ['MM', 'TH', 'VN', 'KH', 'LA', 'MY', 'SG', 'ID', 'PH', 'BN', 'TL']
  );
});

test('stores native and English address order for mainland Southeast Asia countries', () => {
  assert.deepEqual(getSoutheastAsiaAddressRule('TH')?.englishOrder, [
    'postcode',
    'province',
    'district',
    'subdistrict',
    'street',
    'houseNumber',
    'name',
  ]);

  assert.deepEqual(getSoutheastAsiaAddressRule('VN')?.regionalHierarchy, [
    'provinceOrCity',
    'district',
    'ward',
  ]);

  assert.deepEqual(getSoutheastAsiaAddressRule('LA')?.postalCode, {
    label: '5 digits used',
    pattern: '^\\d{5}$',
    required: false,
    usage: 'used',
  });
});

test('stores multilingual English-tab rules for maritime Southeast Asia countries', () => {
  assert.deepEqual(getSoutheastAsiaAddressRule('SG')?.languages, [
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Malay' },
    { code: 'zh', name: 'Chinese' },
  ]);

  assert.deepEqual(getSoutheastAsiaAddressRule('SG')?.englishOrder, [
    'postcode',
    'street',
    'building',
    'unit',
    'name',
  ]);

  assert.deepEqual(getSoutheastAsiaAddressRule('BN')?.regionalHierarchy, ['district', 'mukim']);
  assert.equal(getSoutheastAsiaAddressRule('BN')?.postalCode?.pattern, '^[A-Z]{2}\\d{4}$');
});

test('keeps Timor-Leste as Tetum and Portuguese with no required postal-code layer', () => {
  assert.deepEqual(getSoutheastAsiaAddressRule('TL')?.languages, [
    { code: 'tet', name: 'Tetum' },
    { code: 'pt', name: 'Portuguese' },
  ]);

  assert.deepEqual(getSoutheastAsiaAddressRule('TL')?.englishOrder, [
    'municipality',
    'village',
    'street',
    'name',
  ]);

  assert.equal(getSoutheastAsiaAddressRule('TL')?.postalCode, null);
});
