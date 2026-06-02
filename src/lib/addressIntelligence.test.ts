import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeAddress,normalizeApiAddress,parseAddressText } from './addressIntelligence';

test('normalizes address fields from open geocoding APIs into canonical names', () => {
  assert.deepEqual(
    normalizeApiAddress({
      countrycode: 'gb',
      country: 'United Kingdom',
      state: 'England',
      municipality: 'Camden',
      city_district: 'Greater London',
      street: 'Baker Street',
      housenumber: '221B',
      postalcode: 'NW1 6XE',
      name: 'Sherlock Holmes Museum',
    }),
    {
      country_code: 'gb',
      country: 'United Kingdom',
      state: 'England',
      city: 'Camden',
      district: 'Greater London',
      road: 'Baker Street',
      house_number: '221B',
      postcode: 'NW1 6XE',
      poi: 'Sherlock Holmes Museum',
    }
  );
});

test('parses common free-form address text into structured components', () => {
  assert.deepEqual(
    parseAddressText('221B Baker St, London NW1 6XE, United Kingdom'),
    {
      house_number: '221B',
      road: 'Baker Street',
      city: 'London',
      postcode: 'NW1 6XE',
      country: 'United Kingdom',
    }
  );
});

test('combines API details with parsed display text and records provenance', () => {
  const analysis = analyzeAddress({
    apiAddress: {
      country_code: 'us',
      city: 'New York',
      road: '5th Ave',
      house_number: '350',
    },
    displayName: '350 5th Ave, New York, NY 10118, United States',
    sources: ['nominatim', 'zippopotam'],
  });

  assert.equal(analysis.canonical.postcode, '10118');
  assert.equal(analysis.canonical.road, '5th Avenue');
  assert.deepEqual(analysis.sources, ['nominatim', 'zippopotam', 'parser']);
  assert.ok(analysis.confidence >= 0.8);
});
