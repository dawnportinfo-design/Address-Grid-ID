import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildBuildingNameOverpassQuery,
  buildingNameCandidateFromOpenMapFeature,
  extractBuildingNameFromOsmTags,
  extractBuildingNameFromReverseGeocode,
  queryOpenFreeMapBuildingNameCandidates,
  rankBuildingNameCandidates,
} from './buildingName';

test('extracts the strongest building name from OSM tags', () => {
  assert.deepEqual(
    extractBuildingNameFromOsmTags({
      building: 'yes',
      name: '東京ミッドタウン',
      'name:en': 'Tokyo Midtown',
      'addr:housename': 'Midtown Tower',
    }, 'en'),
    {
      name: 'Midtown Tower',
      nameEn: 'Tokyo Midtown',
      source: 'addr:housename',
    },
  );
});

test('does not treat generic building types as building names', () => {
  assert.equal(
    extractBuildingNameFromOsmTags({
      building: 'apartments',
      amenity: 'parking',
    }, 'en'),
    null,
  );
});

test('falls back to Nominatim reverse geocode building fields', () => {
  assert.deepEqual(
    extractBuildingNameFromReverseGeocode({
      address: {
        building: '渋谷スクランブルスクエア',
      },
      namedetails: {
        'name:en': 'Shibuya Scramble Square',
      },
    }, 'en'),
    {
      name: '渋谷スクランブルスクエア',
      nameEn: 'Shibuya Scramble Square',
      source: 'nominatim:address.building',
    },
  );
});

test('ranks named building footprints ahead of nearby POI names', () => {
  const ranked = rankBuildingNameCandidates([
    {
      name: 'Coffee Stand',
      source: 'name',
      category: 'shop',
      distanceMeters: 8,
    },
    {
      name: 'Landmark 81',
      source: 'building:name',
      category: 'building',
      distanceMeters: 35,
    },
  ]);

  assert.equal(ranked[0].name, 'Landmark 81');
});

test('keeps exact reverse-geocode building names ahead of rendered POI labels', () => {
  const ranked = rankBuildingNameCandidates([
    {
      name: 'Coffee Stand',
      source: 'openfreemap:poi',
      category: 'poi',
      distanceMeters: 2,
    },
    {
      name: 'Shibuya Scramble Square',
      source: 'nominatim:address.building',
      category: 'address',
      distanceMeters: 12,
    },
  ]);

  assert.equal(ranked[0].name, 'Shibuya Scramble Square');
});

test('builds an Overpass query for named buildings and address housenames', () => {
  const query = buildBuildingNameOverpassQuery(35.681236, 139.767125, 90);

  assert.match(query, /way\["building"\]\["name"\]/);
  assert.match(query, /relation\["building"\]\["name"\]/);
  assert.match(query, /\["addr:housename"\]/);
  assert.match(query, /way\["historic"\]\["name"\]/);
  assert.match(query, /node\["public_transport"\]\["name"\]/);
  assert.match(query, /around:90,35\.681236,139\.767125/);
  assert.match(query, /out center tags/);
});

test('extracts building names from OpenFreeMap OpenMapTiles rendered features', () => {
  const candidate = buildingNameCandidateFromOpenMapFeature({
    layer: { id: 'building-3d' },
    sourceLayer: 'building',
    id: 123,
    properties: {
      name: '東京ミッドタウン',
      name_en: 'Tokyo Midtown',
      render_height: 248,
    },
  }, 'en');

  assert.equal(candidate?.name, 'Tokyo Midtown');
  assert.equal(candidate?.nameEn, 'Tokyo Midtown');
  assert.equal(candidate?.source, 'openfreemap:building');
  assert.equal(candidate?.category, 'building');
});

test('queries OpenFreeMap rendered features near the clicked coordinate and ignores roads', () => {
  const fakeMap = {
    project: (lngLat: [number, number]) => {
      assert.deepEqual(lngLat, [139.731992, 35.665498]);
      return { x: 160, y: 120 };
    },
    queryRenderedFeatures: (box: [[number, number], [number, number]]) => {
      assert.deepEqual(box, [[140, 100], [180, 140]]);
      return [
        {
          layer: { id: 'road-label' },
          sourceLayer: 'transportation_name',
          properties: { name: 'Main Street' },
        },
        {
          layer: { id: 'poi-label' },
          sourceLayer: 'poi',
          properties: { name: 'Cafe Example', class: 'cafe' },
        },
        {
          layer: { id: 'building' },
          sourceLayer: 'building',
          properties: { name: 'Roppongi Hills Mori Tower', name_en: 'Roppongi Hills Mori Tower' },
        },
      ];
    },
  };

  const candidates = queryOpenFreeMapBuildingNameCandidates(fakeMap, 35.665498, 139.731992, 'en', 20);

  assert.equal(candidates.length, 2);
  assert.equal(rankBuildingNameCandidates(candidates)[0].name, 'Roppongi Hills Mori Tower');
});
