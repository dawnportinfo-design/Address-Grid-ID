import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchOpenAddressesReference } from './openAddressesReference';
import { validateAddressWithOpenSourceRules } from './addressValidation';

test('matches OpenAddresses reference records without adding a package dependency', () => {
  const match = matchOpenAddressesReference(
    {
      country_code: 'us',
      state: 'CA',
      city: 'Cupertino',
      road: 'Infinite Loop',
      house_number: '1',
      postcode: '95014',
    },
    [
      {
        source: 'openaddresses-us-ca',
        countryCode: 'US',
        state: 'CA',
        city: 'Cupertino',
        street: 'Infinite Loop',
        houseNumber: '1',
        postcode: '95014',
        lat: 37.33182,
        lon: -122.03118,
      },
    ]
  );

  assert.equal(match?.source, 'openaddresses-us-ca');
  assert.equal(match?.confidence, 0.95);
});

test('raises validation evidence when an OpenAddresses reference matches', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      country_code: 'us',
      state: 'CA',
      city: 'Cupertino',
      road: 'Infinite Loop',
      house_number: '1',
      postcode: '95014',
    },
    {
      countryCode: 'US',
      name: 'United States',
      native: {
        addressFormat: '{{houseNumber}} {{street}}\n{{city}}, {{state}} {{postcode}}',
        fields: [
          { key: 'street', required: true },
          { key: 'city', required: true },
          { key: 'state', required: true },
          { key: 'postcode', required: true },
        ],
      },
      postalCode: { regex: '^\\d{5}([ \\-]\\d{4})?$', source: 'libaddressinput' },
    },
    ['nominatim'],
    { referenceMatches: [{ source: 'openaddresses-us-ca', confidence: 0.95 }] }
  );

  assert.equal(result.status, 'verified');
  assert.ok(result.checkedWith.includes('openaddresses-us-ca'));
  assert.ok(result.score >= 0.95);
});
