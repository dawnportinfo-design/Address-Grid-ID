import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateAddressWithOpenSourceRules } from './addressValidation';

const jpFormat = {
  countryCode: 'JP',
  name: 'Japan',
  native: {
    addressFormat: '〒{{postcode}}\n{{state}}{{city}}{{subdistrict}}\n{{street}}{{houseNumber}}\n{{organization}}',
    ordering: 'big-to-small' as const,
    fields: [
      { key: 'postcode', label: '郵便番号', required: true },
      { key: 'state', label: '都道府県', required: true },
      { key: 'city', label: '市区町村', required: true },
    ],
  },
  english: {
    addressFormat: '{{organization}}\n{{houseNumber}} {{street}}\n{{subdistrict}}, {{city}}\n{{state}} {{postcode}}\nJAPAN',
    ordering: 'small-to-big' as const,
    fields: [],
  },
  postalCode: {
    format: 'NNN-NNNN',
    regex: '^\\d{3}-\\d{4}$',
    api: null,
    source: 'Japan Post / zipcloud',
  },
};

test('validates and renders native and English address displays from open address format rules', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      country_code: 'jp',
      country: 'Japan',
      state: '東京都',
      city: '千代田区',
      subdistrict: '永田町',
      road: '1-1',
      house_number: '1',
      building: '中央合同庁舎',
      postcode: '100-0014',
    },
    jpFormat,
    ['nominatim', 'japanese-open-data']
  );

  assert.equal(result.status, 'verified');
  assert.equal(result.postalCodeValid, true);
  assert.deepEqual(result.missingRequiredFields, []);
  assert.equal(result.displays.native, '〒100-0014\n東京都千代田区永田町\n1-11\n中央合同庁舎');
  assert.equal(result.displays.english, '1 1-1\nNagatacho, Chiyoda-ku\nTokyo 100-0014\nJAPAN');
  assert.ok(result.checkedWith.includes('Japan Post / zipcloud'));
});

test('reports missing required fields and invalid postal code', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      country_code: 'jp',
      country: 'Japan',
      state: '東京都',
      postcode: '1000014',
    },
    jpFormat,
    ['parser']
  );

  assert.equal(result.status, 'partial');
  assert.equal(result.postalCodeValid, false);
  assert.deepEqual(result.missingRequiredFields, ['city']);
  assert.ok(result.warnings.some(warning => warning.includes('postcode')));
});

test('English display templates omit dangling punctuation when native-compatible fields are partial', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      country_code: 'jp',
      country: 'Japan',
      state: '東京都',
      city: '千代田区',
      postcode: '1006727',
    },
    jpFormat,
    ['postal-oss']
  );

  assert.equal(result.displays.english, 'Chiyoda-ku\nTokyo 1006727\nJAPAN');
  assert.doesNotMatch(result.displays.english || '', /^,/m);
});
