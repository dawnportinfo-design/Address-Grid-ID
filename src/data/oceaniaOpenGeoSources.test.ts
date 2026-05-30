import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  OCEANIA_COUNTRY_AND_TERRITORY_CODES,
  OCEANIA_OPEN_GEO_SOURCES,
  type OceaniaOpenGeoSourceId,
  getOceaniaOpenSourceIds,
} from './oceaniaOpenGeoSources';

const REQUIRED_OCEANIA_NATURAL_SOURCE_IDS: OceaniaOpenGeoSourceId[] = [
  'jaxa-aw3d30',
  'gebco-bathymetry',
  'gmrt-topography',
  'hydrosheds',
  'esa-worldcover',
  'protected-planet-wdpa',
  'gbif-occurrence',
  'global-mangrove-watch',
  'allen-coral-atlas',
  'pacific-data-hub',
  'digital-earth-pacific',
  'pacioos',
];

test('Oceania open geography registry includes mountain, marine, water, biodiversity, and Pacific nature sources', () => {
  for (const sourceId of REQUIRED_OCEANIA_NATURAL_SOURCE_IDS) {
    const source = OCEANIA_OPEN_GEO_SOURCES[sourceId];

    assert.ok(source, `${sourceId} should be registered`);
    assert.match(source.url, /^https?:\/\//, `${sourceId} should expose a testable URL`);
    assert.match(source.notes, /(mountain|elevation|sea|marine|coast|water|reef|mangrove|habitat|biodiversity|land cover|natural|Pacific)/i);
  }
});

test('Oceania countries and territories include reusable natural geography sources', () => {
  for (const countryCode of OCEANIA_COUNTRY_AND_TERRITORY_CODES) {
    const sourceIds = getOceaniaOpenSourceIds(countryCode);

    for (const sourceId of REQUIRED_OCEANIA_NATURAL_SOURCE_IDS) {
      assert.ok(sourceIds.includes(sourceId), `${countryCode} should use natural geography source ${sourceId}`);
    }
  }
});

test('Australia and New Zealand map to national open natural geography sources', () => {
  const expectedSourceIdsByCountry: Record<string, OceaniaOpenGeoSourceId[]> = {
    AU: [
      'digital-earth-australia-coastlines',
      'digital-earth-australia-wofs',
      'digital-earth-australia-fractional-cover',
      'geoscience-australia-elvis',
    ],
    NZ: ['linz-data-service', 'linz-elevation'],
  };

  for (const [countryCode, expectedSourceIds] of Object.entries(expectedSourceIdsByCountry)) {
    const sourceIds = getOceaniaOpenSourceIds(countryCode);

    for (const sourceId of expectedSourceIds) {
      assert.ok(sourceIds.includes(sourceId), `${countryCode} should use ${sourceId}`);
      assert.ok(OCEANIA_OPEN_GEO_SOURCES[sourceId], `${sourceId} should be registered`);
    }
  }
});
