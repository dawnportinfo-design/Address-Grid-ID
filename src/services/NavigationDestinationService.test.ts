import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import {
  resolveCarNavigationDestination,
  shouldUseCarNavigationDestination,
} from './NavigationDestinationService';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('resolveCarNavigationDestination maps the API car-stop point to app lng coordinates', async () => {
  let calledUrl = '';
  globalThis.fetch = async (url) => {
    calledUrl = String(url);
    return new Response(JSON.stringify({
      ok: true,
      inputPoint: { lat: 35, lon: 139 },
      finalPoint: {
        lat: 35.0001,
        lon: 139.0002,
        method: 'driveway',
        source: 'osm:service-road',
        distanceMeters: 18.4,
      },
      confidence: 0.86,
      warnings: [],
      sources: ['osm:service-road'],
      candidates: [],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result = await resolveCarNavigationDestination({ lat: 35, lng: 139, name: 'AGID target' });

  assert.match(calledUrl, /\/api\/navigation\/resolve-destination/);
  assert.match(calledUrl, /mode=car/);
  assert.equal(result.lat, 35.0001);
  assert.equal(result.lng, 139.0002);
  assert.equal(result.original.lng, 139);
  assert.equal(result.method, 'driveway');
  assert.equal(result.confidence, 0.86);
});

test('shouldUseCarNavigationDestination only optimizes driving routes', () => {
  assert.equal(shouldUseCarNavigationDestination('driving'), true);
  assert.equal(shouldUseCarNavigationDestination('walking'), false);
});
