import assert from 'node:assert/strict';
import { afterEach,test } from 'node:test';

import {
resolveDroneNavigationPoint,
shouldUseDroneNavigation,
} from './DroneNavigationService';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('resolveDroneNavigationPoint maps API lon and altitude fields to the app model', async () => {
  let calledUrl = '';
  globalThis.fetch = async (url) => {
    calledUrl = String(url);
    return new Response(JSON.stringify({
      ok: true,
      inputPoint: { lat: 35, lon: 139 },
      point: {
        lat: 35.0001,
        lon: 139.0002,
        mode: 'agl',
        stepCm: 10,
        altitudeAglCm: 3000,
        altitudeMslCm: 7430,
        altitudeAglM: 30,
        altitudeMslM: 74.3,
      },
      groundElevationM: 44.3,
      groundElevationSource: 'open-meteo-europe',
      safety: 'caution',
      confidence: 0.82,
      warnings: ['Mapped building, tower, or power-line evidence is close to the AGID point.'],
      sources: ['open-meteo-europe', 'osm:building'],
      candidates: [],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result = await resolveDroneNavigationPoint({ lat: 35, lng: 139, name: 'AGID target' }, {
    altitudeM: 30,
    stepCm: 10,
  });

  assert.match(calledUrl, /\/api\/drone\/resolve-point/);
  assert.match(calledUrl, /altitudeM=30/);
  assert.match(calledUrl, /stepCm=10/);
  assert.equal(result.lng, 139.0002);
  assert.equal(result.original.lng, 139);
  assert.equal(result.altitudeAglM, 30);
  assert.equal(result.safety, 'caution');
});

test('shouldUseDroneNavigation only enables drone mode', () => {
  assert.equal(shouldUseDroneNavigation('drone'), true);
  assert.equal(shouldUseDroneNavigation('driving'), false);
  assert.equal(shouldUseDroneNavigation('walking'), false);
});
