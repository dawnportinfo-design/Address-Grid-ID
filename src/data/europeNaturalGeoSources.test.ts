import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
EUROPE_COUNTRY_AND_TERRITORY_CODES,
EUROPE_OPEN_GEO_SOURCES,
getEuropeOpenSourceIds,
type EuropeOpenGeoSourceId,
} from './europeOpenGeoSources';

const REQUIRED_NATURAL_SOURCE_IDS: EuropeOpenGeoSourceId[] = [
  'copernicus-dem',
  'copernicus-corine-land-cover',
  'emodnet-bathymetry',
  'emodnet-seabed-habitats',
  'eea-natura-2000',
  'eea-eunis-habitats',
  'jrc-esdac-soils',
];

test('Europe natural geography registry includes mountain, marine, and habitat open sources', () => {
  for (const sourceId of REQUIRED_NATURAL_SOURCE_IDS) {
    const source = EUROPE_OPEN_GEO_SOURCES[sourceId];

    assert.ok(source, `${sourceId} should be registered`);
    assert.match(source.url, /^https?:\/\//, `${sourceId} should expose a testable URL`);
    assert.match(source.notes, /(mountain|elevation|sea|marine|coast|habitat|soil|land cover|natural)/i);
  }
});

test('European country and territory source sets include natural geography sources', () => {
  for (const countryCode of EUROPE_COUNTRY_AND_TERRITORY_CODES) {
    const sourceIds = getEuropeOpenSourceIds(countryCode);

    for (const sourceId of REQUIRED_NATURAL_SOURCE_IDS) {
      assert.ok(sourceIds.includes(sourceId), `${countryCode} should use ${sourceId}`);
    }
  }
});
