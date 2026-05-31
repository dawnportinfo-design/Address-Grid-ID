import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchDroneCorridorReport } from './DroneCorridorService';

test('fetchDroneCorridorReport checks every route sample and returns a corridor report', async () => {
  const called: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string | URL | Request) => {
    called.push(String(url));
    return {
      ok: true,
      json: async () => {
        const value = String(url);
        if (value.includes('/api/elevation')) return { elevation: 10, source: 'test-elevation' };
        if (value.includes('/api/weather')) return { current: { wind_speed_10m: 4 } };
        if (value.includes('/api/water-risk')) return { risk_level: 'Low', source: 'test-water' };
        if (value.includes('/api/geological-risk')) return { risks: { landslide: 'Low', flood: 'Low' }, land_cover: 'Open Land', source: 'test-geo' };
        if (value.includes('/api/mountain/nearby')) return { peaks: [], source: 'test-mountain' };
        return {};
      },
    } as Response;
  }) as typeof fetch;

  try {
    const report = await fetchDroneCorridorReport({
      origin: { lat: 35, lon: 139 },
      target: { lat: 35.002, lon: 139.002 },
      sampleCount: 3,
    });

    assert.equal(report.status, 'field-check');
    assert.equal(report.samples.length, 3);
    assert.equal(called.filter(url => url.includes('/api/elevation')).length, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
