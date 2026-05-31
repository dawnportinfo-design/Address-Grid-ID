import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CanonicalAddressParts } from './addressIntelligence';
import { validateAddressWithOpenSourceRules } from './addressValidation';

const baseAddress: CanonicalAddressParts = {
  country_code: 'JP',
  country: 'Japan',
  state: 'Tokyo',
  city: 'Chiyoda-ku',
  district: '',
  subdistrict: '',
  suburb: '',
  road: 'Marunouchi',
  house_number: '1',
  building: '',
  postcode: '1000001',
  poi: '',
};

test('strong postal APIs can verify a postal address and allow cautious autofill', () => {
  const result = validateAddressWithOpenSourceRules(
    baseAddress,
    {
      name: 'Japan',
      native: {
        addressFormat: '{{postcode}}\n{{state}}{{city}}{{street}}{{houseNumber}}',
        fields: [
          { key: 'postcode', required: true },
          { key: 'city', required: true },
          { key: 'street', required: true },
        ],
      },
      postalCode: { regex: '^\\d{3}-?\\d{4}$', source: 'japan-postcode-api' },
      addressRules: {
        postalCode: { label: 'Postal code', required: true, usage: 'required' },
        openSourceIds: ['japan-postcode-api', 'japanese-open-data'],
      },
    },
    ['japan-postcode-api', 'japanese-open-data'],
  );

  assert.equal(result.quality.mode, 'postal-verified');
  assert.equal(result.quality.label, 'Verified');
  assert.equal(result.quality.canAutofill, true);
  assert.equal(result.quality.shouldOverwriteUserInput, false);
});

test('weak postal sources stay partial even when the postcode pattern matches', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      ...baseAddress,
      country_code: 'ML',
      country: 'Mali',
      state: 'Bamako',
      city: 'Bamako',
      postcode: '1000',
    },
    {
      name: 'Mali',
      native: {
        addressFormat: '{{street}}\n{{city}} {{postcode}}',
        fields: [
          { key: 'postcode', required: true },
          { key: 'city', required: true },
        ],
      },
      postalCode: { regex: '^\\d{4}$', source: 'geonames-postal' },
      addressRules: {
        postalCode: { label: 'Postal code', required: true, usage: 'required' },
        openSourceIds: ['geonames-postal'],
      },
    },
    ['geonames-postal'],
  );

  assert.equal(result.quality.mode, 'partial-postal');
  assert.equal(result.quality.label, 'Partial');
  assert.equal(result.quality.canAutofill, false);
  assert.equal(result.status, 'partial');
  assert.match(result.quality.reason, /postal source is limited/i);
});

test('regions without postal codes can be geo verified when open geography evidence is strong', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      ...baseAddress,
      country_code: 'HK',
      country: 'Hong Kong',
      state: '',
      city: '',
      district: 'Central and Western',
      road: 'Queen’s Road Central',
      house_number: '',
      postcode: '',
      plus_code: '7PJP+Q5',
    },
    {
      name: 'Hong Kong',
      native: {
        addressFormat: '{{district}}\n{{street}}',
        fields: [
          { key: 'district', required: true },
          { key: 'street', required: true },
        ],
      },
      postalCode: undefined,
      addressRules: {
        postalCode: null,
        openSourceIds: ['osm-nominatim', 'hk-csdi', 'overture-maps'],
      },
    },
    ['osm-nominatim', 'hk-csdi', 'overture-maps'],
  );

  assert.equal(result.quality.mode, 'geo-verified');
  assert.equal(result.quality.label, 'Geo Verified');
  assert.equal(result.postalCodeValid, null);
  assert.equal(result.status, 'verified');
});

test('areas without postal codes and weak geography evidence require manual confirmation', () => {
  const result = validateAddressWithOpenSourceRules(
    {
      ...baseAddress,
      country_code: 'BT_T',
      country: 'Bir Tawil',
      state: '',
      city: '',
      road: '',
      house_number: '',
      postcode: '',
    },
    {
      name: 'Bir Tawil',
      native: {
        addressFormat: '{{country}}',
        fields: [
          { key: 'country', required: true },
        ],
      },
      postalCode: undefined,
      addressRules: {
        postalCode: null,
        openSourceIds: ['osm-nominatim'],
      },
    },
    [],
  );

  assert.equal(result.quality.mode, 'manual-required');
  assert.equal(result.quality.label, 'Manual Required');
  assert.equal(result.quality.canAutofill, false);
  assert.equal(result.status, 'partial');
});
