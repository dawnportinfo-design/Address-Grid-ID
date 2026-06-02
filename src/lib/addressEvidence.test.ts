import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
collectOpenSourceAddressEvidenceSources,
mergeOpenSourceAddressEvidence,
} from './addressEvidence';

test('merges regional postal API evidence into sparse AGID address parts', () => {
  const base = {
    country_code: 'FR',
    country: 'France',
    state: '',
    city: '20.',
    district: '',
    subdistrict: '',
    suburb: '',
    road: '',
    house_number: '',
    building: '',
    postcode: '',
    poi: '',
  };

  const { address, sources } = mergeOpenSourceAddressEvidence(base, {
    european_postal_data: {
      postcode: '75001',
      city: 'Paris',
      street: 'Rue de Rivoli',
      houseNumber: '99',
    },
  });

  assert.equal(address.city, 'Paris');
  assert.equal(address.road, 'Rue de Rivoli');
  assert.equal(address.house_number, '99');
  assert.equal(address.postcode, '75001');
  assert.deepEqual(sources, ['regional-open-data']);
});

test('collects postal and open address evidence sources for AGID validation badges', () => {
  const sources = collectOpenSourceAddressEvidenceSources({
    official_regional_data: {
      viaCEP: {
        road: 'Avenida Paulista',
        city: 'Sao Paulo',
        postcode: '01310-000',
      },
    },
    openaddresses_matches: [
      {
        source: 'openaddresses-br',
        confidence: 0.88,
        record: {
          street: 'Avenida Paulista',
          houseNumber: '1000',
          postcode: '01310-000',
        },
      },
    ],
  });

  assert.deepEqual(sources, ['viacep', 'openaddresses-br']);
});

test('ignores null or malformed API evidence instead of crashing AGID display', () => {
  const { address, sources } = mergeOpenSourceAddressEvidence(
    {
      country_code: 'ML',
      country: 'Mali',
      city: 'Bamako',
      postcode: '',
    },
    {
      european_postal_data: null,
      official_regional_data: null,
      asia_oceania_data: 'service unavailable',
      openaddresses_matches: [null, 'bad-record'],
      address_analysis: {
        referenceMatches: [undefined, { source: 'empty-openaddresses', confidence: 0.9, record: null }],
      },
    },
  );

  assert.equal(address.country_code, 'ML');
  assert.equal(address.city, 'Bamako');
  assert.deepEqual(sources, []);
});
