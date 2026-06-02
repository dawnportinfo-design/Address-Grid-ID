import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
AGID_MAP_ENGINE,
AGID_MAP_ENGINES,
OPENFREEMAP_STYLES,
buildMapLibreOptions,
getAgidMapEngine,
registerPmtilesProtocol,
resolveMapStyle,
} from './mapEngine';

const satelliteStyle = {
  version: 8,
  sources: { satellite: { type: 'raster', tiles: ['https://example.test/{z}/{x}/{y}.jpg'] } },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
};

test('AGID map engine uses free open-source MapLibre and open tile profiles', () => {
  assert.equal(AGID_MAP_ENGINE.id, 'maplibre-gl');
  assert.equal(AGID_MAP_ENGINE.license, 'BSD-3-Clause');
  assert.ok(AGID_MAP_ENGINE.capabilities.includes('vector-tiles'));
  assert.ok(AGID_MAP_ENGINE.capabilities.includes('pmtiles-offline-archives'));
  assert.ok(AGID_MAP_ENGINE.sources.some(source => source.id === 'openfreemap'));
  assert.ok(AGID_MAP_ENGINE.sources.some(source => source.id === 'openmaptiles-schema'));
  assert.ok(AGID_MAP_ENGINE.sources.some(source => source.id === 'protomaps-pmtiles'));
});

test('AGID map engine registry includes OpenLayers as a free 2D fallback engine', () => {
  const engineIds = AGID_MAP_ENGINES.map(engine => engine.id);
  assert.deepEqual(engineIds, ['maplibre-gl', 'openlayers']);

  const openLayers = getAgidMapEngine('openlayers');
  assert.equal(openLayers.id, 'openlayers');
  assert.equal(openLayers.license, 'BSD-2-Clause');
  assert.ok(openLayers.capabilities.includes('raster-tiles'));
  assert.ok(openLayers.capabilities.includes('vector-tiles'));
  assert.ok(openLayers.capabilities.includes('ogc-services'));
  assert.ok(openLayers.sources.some(source => source.id === 'openlayers'));

  assert.equal(getAgidMapEngine('unknown').id, 'maplibre-gl');
});

test('map style resolver keeps OpenFreeMap as the default free style set', () => {
  assert.equal(OPENFREEMAP_STYLES.liberty, 'https://tiles.openfreemap.org/styles/liberty');
  assert.equal(resolveMapStyle('bright', satelliteStyle), OPENFREEMAP_STYLES.bright);
  assert.equal(resolveMapStyle('', satelliteStyle), OPENFREEMAP_STYLES.liberty);
  assert.equal(resolveMapStyle('https://self-hosted.example/styles/agid.json', satelliteStyle), 'https://self-hosted.example/styles/agid.json');
  assert.deepEqual(resolveMapStyle('satellite', satelliteStyle), satelliteStyle);
});

test('MapLibre options include engine defaults for AGID terrain and tile workloads', () => {
  const options = buildMapLibreOptions({
    container: 'map',
    style: 'liberty',
    satelliteStyle,
    center: [139.767, 35.681],
    zoom: 8,
    pitch: 45,
    bearing: 10,
    projection: 'mercator',
  });

  assert.equal(options.style, OPENFREEMAP_STYLES.liberty);
  assert.deepEqual(options.center, [139.767, 35.681]);
  assert.equal(options.maxParallelImageRequests, 16);
  assert.deepEqual(options.transformRequest('pmtiles://agid/world.pmtiles'), { url: 'pmtiles://agid/world.pmtiles' });
});

test('PMTiles protocol registration is idempotent for MapLibre', () => {
  const calls: string[] = [];
  const fakeMapLibre = {
    addProtocol(name: string, handler: unknown) {
      calls.push(name);
      assert.equal(typeof handler, 'function');
    },
  };

  registerPmtilesProtocol(fakeMapLibre);
  registerPmtilesProtocol(fakeMapLibre);

  assert.deepEqual(calls, ['pmtiles']);
});
