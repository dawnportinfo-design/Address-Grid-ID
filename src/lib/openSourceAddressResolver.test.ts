import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveEnglishAddressPartOpenSource } from './openSourceAddressResolver';

test('prefers Nominatim English namedetails over local fallback dictionaries', async () => {
  const result = await resolveEnglishAddressPartOpenSource('eGoli', 'ZA', {
    fallback: () => 'Johannesburg from fallback',
    fetcher: async () => new Response(JSON.stringify([
      {
        namedetails: {
          name: 'eGoli',
          'name:en': 'Johannesburg',
        },
      },
    ])),
  });

  assert.equal(result.value, 'Johannesburg');
  assert.equal(result.source, 'osm-nominatim');
});

test('uses GeoNames alternate English names when Nominatim has no English name', async () => {
  let calls = 0;
  const result = await resolveEnglishAddressPartOpenSource('Banaras', 'IN', {
    fallback: () => 'Varanasi from fallback',
    fetcher: async () => {
      calls += 1;
      if (calls === 1) return new Response(JSON.stringify([{ namedetails: { name: 'Banaras' } }]));
      return new Response(JSON.stringify({
        geonames: [
          {
            name: 'Banaras',
            alternateNames: [
              { lang: 'hi', name: 'बनारस' },
              { lang: 'en', name: 'Varanasi' },
            ],
          },
        ],
      }));
    },
  });

  assert.equal(result.value, 'Varanasi');
  assert.equal(result.source, 'geonames-gazetteer');
});

test('falls back locally when open-source lookups are unavailable', async () => {
  const result = await resolveEnglishAddressPartOpenSource('iKapa', 'ZA', {
    fallback: () => 'Cape Town',
    fetcher: async () => new Response('service unavailable', { status: 503 }),
  });

  assert.equal(result.value, 'Cape Town');
  assert.equal(result.source, 'local-fallback');
});
