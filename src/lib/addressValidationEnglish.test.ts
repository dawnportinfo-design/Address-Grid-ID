import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateAddressWithOpenSourceRules } from './addressValidation';

test('renders English validation displays with romanized address values', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      country_code: 'jp',
      country: '日本',
      state: '東京都',
      city: '千代田区',
      subdistrict: '永田町',
      road: '1-1',
      house_number: '1',
      postcode: '100-0014',
    },
    {
      countryCode: 'JP',
      name: 'Japan',
      native: {
        addressFormat: '〒{{postcode}}\n{{state}}{{city}}{{subdistrict}}\n{{street}}{{houseNumber}}',
        fields: [],
      },
      english: {
        addressFormat: '{{houseNumber}} {{street}}\n{{subdistrict}}, {{city}}\n{{state}} {{postcode}}\nJAPAN',
        fields: [],
      },
      postalCode: { regex: '^\\d{3}-\\d{4}$', source: 'libaddressinput' },
    }
  );

  assert.equal(result.displays.english, '1 1-1\nNagatacho, Chiyoda-ku\nTokyo 100-0014\nJAPAN');
});
