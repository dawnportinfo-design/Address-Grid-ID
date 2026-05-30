import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  AMERICAS_COUNTRY_CODES,
  AMERICAS_OPEN_GEO_SOURCES,
  getAmericasOpenSourceIds,
} from './americasOpenGeoSources';

const REQUIRED_AMERICAS_NATURAL_SOURCE_IDS = [
  'noaa-etopo',
  'geobc-global-multi-resolution-topography',
  'hydrosheds',
  'protected-planet-wdpa',
  'gbif-occurrence',
  'esa-worldcover',
  'usgs-3dep',
  'nrcan-geospatial',
  'conabio-geoportal',
  'ibge-geosciences',
  'inpe-terrabrasilis',
] as const;

test('Americas open geography registry includes postal, address, boundary, and official Spanish-region sources', () => {
  const sourceIds = new Set(Object.keys(AMERICAS_OPEN_GEO_SOURCES));

  for (const sourceId of [
    'osm-nominatim',
    'openaddresses',
    'geonames-postal',
    'geonames-gazetteer',
    'geoboundaries',
    'upu-addressing',
    'us-census-geocoder',
    'correos-cr-postal',
    'snit-cr',
    'ineter-ni-ide',
    'segeplan-gt-ide',
    'belize-statistical-institute',
    'viacep-br',
    'brasilapi',
    'georef-ar',
    'geoportal-cl',
    'colombia-en-mapas',
    'geo-vivienda-pe',
    'codigo-postal-ec',
    'ide-uy',
    'ide-py',
  ]) {
    assert.ok(sourceIds.has(sourceId), `${sourceId} should be registered`);
  }
});

test('Americas open geography registry includes mountain, marine, water, biodiversity, and nature sources', () => {
  const sourceIds = new Set(Object.keys(AMERICAS_OPEN_GEO_SOURCES));

  for (const sourceId of REQUIRED_AMERICAS_NATURAL_SOURCE_IDS) {
    assert.ok(sourceIds.has(sourceId), `${sourceId} should be registered`);
  }
});

test('Americas countries and territories map to geodata and postal validation sources', () => {
  for (const countryCode of AMERICAS_COUNTRY_CODES) {
    const sourceIds = getAmericasOpenSourceIds(countryCode);

    assert.ok(sourceIds.includes('osm-nominatim'), `${countryCode} should use OSM/Nominatim`);
    assert.ok(sourceIds.includes('openaddresses'), `${countryCode} should use OpenAddresses`);
    assert.ok(sourceIds.includes('geonames-postal'), `${countryCode} should use GeoNames postal data`);
    assert.ok(sourceIds.includes('geonames-gazetteer'), `${countryCode} should use GeoNames gazetteer`);
    assert.ok(sourceIds.includes('geoboundaries'), `${countryCode} should use geoBoundaries`);
    assert.ok(sourceIds.includes('upu-addressing'), `${countryCode} should use UPU addressing references`);

    for (const sourceId of REQUIRED_AMERICAS_NATURAL_SOURCE_IDS) {
      assert.ok(sourceIds.includes(sourceId), `${countryCode} should use natural geography source ${sourceId}`);
    }
  }

  assert.ok(getAmericasOpenSourceIds('CR').includes('correos-cr-postal'));
  assert.ok(getAmericasOpenSourceIds('CR').includes('snit-cr'));
  assert.ok(getAmericasOpenSourceIds('NI').includes('ineter-ni-ide'));
  assert.ok(getAmericasOpenSourceIds('GT').includes('segeplan-gt-ide'));
  assert.ok(getAmericasOpenSourceIds('BZ').includes('belize-statistical-institute'));
  assert.ok(getAmericasOpenSourceIds('BR').includes('viacep-br'));
  assert.ok(getAmericasOpenSourceIds('BR').includes('brasilapi'));
  assert.ok(getAmericasOpenSourceIds('AR').includes('georef-ar'));
  assert.ok(getAmericasOpenSourceIds('CL').includes('geoportal-cl'));
  assert.ok(getAmericasOpenSourceIds('CO').includes('colombia-en-mapas'));
  assert.ok(getAmericasOpenSourceIds('PE').includes('geo-vivienda-pe'));
  assert.ok(getAmericasOpenSourceIds('EC').includes('codigo-postal-ec'));
  assert.ok(getAmericasOpenSourceIds('UY').includes('ide-uy'));
  assert.ok(getAmericasOpenSourceIds('PY').includes('ide-py'));
});
