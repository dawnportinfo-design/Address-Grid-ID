import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
ASIA_COUNTRY_CODES,
ASIA_OPEN_GEO_SOURCES,
getAsiaOpenSourceIds,
} from './asiaOpenGeoSources';

const REQUIRED_ASIA_NATURAL_SOURCE_IDS = [
  'nasa-srtm',
  'jaxa-aw3d30',
  'gebco-bathymetry',
  'gmrt-topography',
  'hydrosheds',
  'esa-worldcover',
  'protected-planet-wdpa',
  'gbif-occurrence',
] as const;

test('Asia open geography registry includes mountain, marine, water, biodiversity, and nature sources', () => {
  const sourceIds = new Set(Object.keys(ASIA_OPEN_GEO_SOURCES));

  for (const sourceId of REQUIRED_ASIA_NATURAL_SOURCE_IDS) {
    assert.ok(sourceIds.has(sourceId), `${sourceId} should be registered`);
  }
});

test('Asian countries map to reusable natural geography sources', () => {
  for (const countryCode of ASIA_COUNTRY_CODES) {
    const sourceIds = getAsiaOpenSourceIds(countryCode);

    for (const sourceId of REQUIRED_ASIA_NATURAL_SOURCE_IDS) {
      assert.ok(sourceIds.includes(sourceId), `${countryCode} should use natural geography source ${sourceId}`);
    }
  }
});
