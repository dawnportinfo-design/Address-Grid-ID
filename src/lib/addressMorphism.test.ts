import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildAddressPid,
  clusterAddressCandidates,
  resolveAddressMorphism,
  structuralDistance,
} from './addressMorphism';

const tokyoStationNative = {
  id: 'native',
  label: '東京都千代田区丸の内1丁目9-1',
  canonical: {
    country_code: 'jp',
    country: 'Japan',
    state: 'Tokyo',
    city: 'Chiyoda',
    subdistrict: 'Marunouchi',
    road: 'Marunouchi',
    house_number: '1-9-1',
    postcode: '1000005',
  },
  lat: 35.681236,
  lon: 139.767125,
  sources: ['jp-open-data', 'nominatim'],
  confidence: 0.92,
};

const tokyoStationEnglish = {
  id: 'english',
  label: '1-9-1 Marunouchi, Chiyoda City, Tokyo 100-0005, Japan',
  canonical: {
    country_code: 'jp',
    country: 'Japan',
    state: 'Tokyo',
    city: 'Chiyoda',
    subdistrict: 'Marunouchi',
    road: 'Marunouchi',
    house_number: '1-9-1',
    postcode: '1000005',
  },
  lat: 35.68124,
  lon: 139.76713,
  sources: ['parser', 'libpostal'],
  confidence: 0.86,
};

test('structural distance treats multilingual variants of the same address as close', () => {
  const distance = structuralDistance(tokyoStationNative, tokyoStationEnglish);
  assert.ok(distance < 0.15);
});

test('clusters candidates that refer to the same address entity', () => {
  const clusters = clusterAddressCandidates([
    tokyoStationNative,
    tokyoStationEnglish,
    {
      id: 'osaka',
      label: 'Osaka Station',
      canonical: { country_code: 'jp', state: 'Osaka', city: 'Osaka' },
      lat: 34.7025,
      lon: 135.4959,
      sources: ['nominatim'],
      confidence: 0.7,
    },
  ]);

  assert.equal(clusters.length, 2);
  assert.equal(clusters[0].candidates.length, 2);
});

test('resolves a clear candidate to a stable PID and verified status', () => {
  const result = resolveAddressMorphism({
    input: 'Tokyo Station Marunouchi 1-9-1',
    context: { lat: 35.6812, lon: 139.7671, countryCode: 'jp', postcode: '1000005' },
    candidates: [tokyoStationNative, tokyoStationEnglish],
  });

  assert.equal(result.status, 'verified');
  assert.equal(result.selected?.canonical.country_code, 'jp');
  assert.ok(result.pid?.startsWith('AMT-'));
  assert.equal(result.pid, buildAddressPid(result.selected!.canonical));
  assert.ok(Number.isFinite(result.energySummary.best));
  assert.ok(result.energySummary.best <= result.energySummary.average);
});

test('marks near-tied unrelated candidates as ambiguous instead of forcing a decision', () => {
  const result = resolveAddressMorphism({
    input: 'Springfield Main Street',
    context: { countryCode: 'us' },
    candidates: [
      {
        id: 'springfield-il',
        label: 'Main Street, Springfield, Illinois, United States',
        canonical: { country_code: 'us', state: 'Illinois', city: 'Springfield', road: 'Main Street' },
        sources: ['nominatim'],
        confidence: 0.7,
      },
      {
        id: 'springfield-ma',
        label: 'Main Street, Springfield, Massachusetts, United States',
        canonical: { country_code: 'us', state: 'Massachusetts', city: 'Springfield', road: 'Main Street' },
        sources: ['nominatim'],
        confidence: 0.7,
      },
    ],
  });

  assert.equal(result.status, 'ambiguous');
  assert.equal(result.pid, null);
});

test('returns unresolved when no candidate has enough evidence', () => {
  const result = resolveAddressMorphism({
    input: 'unknown address fragment',
    candidates: [{
      id: 'weak',
      label: 'unknown',
      canonical: {},
      sources: [],
      confidence: 0.1,
    }],
  });

  assert.equal(result.status, 'unresolved');
  assert.equal(result.pid, null);
});
