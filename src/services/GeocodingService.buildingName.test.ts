import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { fetchNearbyBuildingName } from './GeocodingService';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('fetchNearbyBuildingName uses Overpass OSM data and prefers named buildings', async () => {
  let body = '';
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('/api/overture/building-name')) {
      return new Response(JSON.stringify({ error: 'not configured' }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }

    body = String(init?.body || '');
    return new Response(JSON.stringify({
      elements: [
        {
          type: 'node',
          id: 1,
          lat: 10.00002,
          lon: 20.00002,
          tags: {
            shop: 'coffee',
            name: 'Coffee Stand',
          },
        },
        {
          type: 'way',
          id: 2,
          center: { lat: 10.0002, lon: 20.0002 },
          tags: {
            building: 'yes',
            'building:name': 'Landmark 81',
            'name:en': 'Landmark 81',
          },
        },
      ],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result = await fetchNearbyBuildingName(10, 20, 'en', 90);

  assert.match(body, /"query"/);
  assert.equal(result?.name, 'Landmark 81');
  assert.equal(result?.source, 'building:name');
  assert.equal(result?.category, 'building');
});

test('fetchNearbyBuildingName can prefer Overture Maps named buildings over nearby OSM POIs', async () => {
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('/api/overture/building-name')) {
      return new Response(JSON.stringify({
        candidates: [{
          id: 'overture:building:landmark-81',
          names: { primary: 'Landmark 81' },
          theme: 'buildings',
          type: 'building',
          distanceMeters: 30,
        }],
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      elements: [{
        type: 'node',
        id: 3,
        lat: 10.00001,
        lon: 20.00001,
        tags: {
          shop: 'coffee',
          name: 'Coffee Stand',
        },
      }],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result = await fetchNearbyBuildingName(10, 20, 'en', 90);

  assert.equal(result?.name, 'Landmark 81');
  assert.equal(result?.source, 'overture:buildings');
  assert.equal(result?.category, 'building');
});
