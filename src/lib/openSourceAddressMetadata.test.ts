import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateAddressWithOpenSourceRules } from './addressValidation';
import {
convertLibaddressinputMetadata,
getTerritoryDisplayName,
resolveAddressFormatMetadataPath,
} from './openSourceAddressMetadata';

test('converts libaddressinput metadata into local address validation format', () => {
  const format = convertLibaddressinputMetadata({
    countryCode: 'US',
    metadata: {
      fmt: '%N%n%O%n%A%n%C, %S %Z',
      require: 'ACSZ',
      zip: '\\d{5}([ \\-]\\d{4})?',
      zipex: '95014,95014-1234',
      sub_keys: 'CA~NY',
      sub_names: 'California~New York',
      name: 'UNITED STATES',
    },
    englishMetadata: {
      fmt: '%N%n%O%n%A%n%C, %S %Z%nUNITED STATES',
    },
  });

  assert.equal(format.countryCode, 'US');
  assert.equal(format.name, 'United States');
  assert.equal(format.postalCode?.regex, '^\\d{5}([ \\-]\\d{4})?$');
  assert.deepEqual(
    format.native?.fields.filter(field => field.required).map(field => field.key),
    ['street', 'city', 'state', 'postcode']
  );

  const result = validateAddressWithOpenSourceRules(
    {
      country_code: 'us',
      country: 'United States',
      state: 'CA',
      city: 'Cupertino',
      road: 'Infinite Loop',
      house_number: '1',
      postcode: '95014',
    },
    format,
    ['nominatim']
  );

  assert.equal(result.status, 'verified');
  assert.equal(result.postalCodeValid, true);
  assert.equal(result.displays.english, '1 Infinite Loop\nCupertino, CA 95014\nUNITED STATES');
});

test('uses CLDR territory names before falling back to country code', () => {
  assert.equal(getTerritoryDisplayName('jp', 'en'), 'Japan');
  assert.equal(getTerritoryDisplayName('jp', 'ja'), '日本');
  assert.equal(getTerritoryDisplayName('zz', 'en'), 'ZZ');
});

test('resolves libaddressinput sync output to existing continent/subregion country JSON', () => {
  const knownPaths = [
    'asia/east_asia/JP.json',
    'americas/north_america/US.json',
    'europe/western_europe/FR.json',
  ];

  assert.equal(resolveAddressFormatMetadataPath('jp', knownPaths), 'asia/east_asia/JP.json');
  assert.equal(resolveAddressFormatMetadataPath('US', knownPaths), 'americas/north_america/US.json');
  assert.equal(resolveAddressFormatMetadataPath('ZZ', knownPaths), 'ZZ.json');
});
