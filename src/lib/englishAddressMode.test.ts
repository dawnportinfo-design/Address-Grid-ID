import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CanonicalAddress } from './addressRendering';
import {
getEnglishAddressModeProfile,
normalizeEnglishAddressModeField,
renderEnglishAddressMode,
} from './englishAddressMode';

const australianAddress: CanonicalAddress = {
  country_code: 'AU',
  country: 'Australia',
  state: 'NSW',
  city: 'Sydney',
  district: '',
  subdistrict: '',
  suburb: '',
  road: 'George Street',
  house_number: '1',
  building: 'Queen Victoria Building',
  postcode: '2000',
  poi: '',
};

test('English-speaking countries share one normalization algorithm across domestic and international shipping tabs', () => {
  const profile = getEnglishAddressModeProfile('AU');

  assert.deepEqual(profile, {
    countryCode: 'AU',
    circle: 'inner',
    domesticTab: 'en_domestic',
    internationalTab: 'en',
    normalizerId: 'english-address-normalizer-v1',
    buildingNormalizerId: 'english-building-name-normalizer-v1',
    domesticIncludesCountry: false,
    internationalIncludesCountry: true,
  });
});

test('Outer Circle English countries use the same shared English mode profile', () => {
  const profile = getEnglishAddressModeProfile('FJ');

  assert.equal(profile.countryCode, 'FJ');
  assert.equal(profile.circle, 'outer');
  assert.equal(profile.normalizerId, 'english-address-normalizer-v1');
  assert.equal(profile.domesticIncludesCountry, false);
  assert.equal(profile.internationalIncludesCountry, true);
});

test('domestic English and international shipping English normalize address parts identically', () => {
  const domestic = normalizeEnglishAddressModeField({
    countryCode: 'NZ',
    fieldKey: 'state',
    text: 'Aotearoa',
    mode: 'domestic',
  });
  const international = normalizeEnglishAddressModeField({
    countryCode: 'NZ',
    fieldKey: 'state',
    text: 'Aotearoa',
    mode: 'international-shipping',
  });

  assert.equal(domestic, 'New Zealand');
  assert.equal(international, domestic);
});

test('domestic and international English rendering only diverge at the country line', () => {
  const domestic = renderEnglishAddressMode(australianAddress, 'domestic');
  const international = renderEnglishAddressMode(australianAddress, 'international-shipping');

  assert.equal(domestic, 'Queen Victoria Building\n1 George Street\nSydney\nNSW 2000');
  assert.equal(international, 'Queen Victoria Building\n1 George Street\nSydney\nNSW 2000\nAUSTRALIA');
});
