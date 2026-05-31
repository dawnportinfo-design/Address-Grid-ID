import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildDroneObstacleOverpassQuery,
  resolveDroneAltitudeConstraint,
  resolveDroneNavigationPoint,
  snapCentimetersToStep,
  summarizeDroneObstacleRisk,
  type DroneElevationData,
} from './droneNavigation';
import type { OsmElementLike } from './navigationDestination';

test('snaps drone altitude to the configured 10cm grid', () => {
  assert.equal(snapCentimetersToStep(1234, 10), 1230);
  assert.equal(snapCentimetersToStep(1236, 10), 1240);
  assert.equal(snapCentimetersToStep(1236, 1), 1240);
});

test('resolves AGL altitude to MSL using open elevation data', () => {
  const elevation: DroneElevationData = { elevation: 44.27, source: 'open-meteo-europe' };
  const result = resolveDroneAltitudeConstraint({
    lat: 35,
    lon: 139,
    requestedAltitudeM: 30.04,
    stepCm: 10,
    mode: 'agl',
  }, elevation);

  assert.equal(result.altitudeAglCm, 3000);
  assert.equal(result.altitudeAglM, 30);
  assert.equal(result.altitudeMslM, 74.3);
  assert.equal(result.groundElevationSource, 'open-meteo-europe');
  assert.equal(result.confidence, 0.86);
});

test('clamps drone altitude to the configured maximum', () => {
  const result = resolveDroneAltitudeConstraint({
    lat: 35,
    lon: 139,
    requestedAltitudeM: 130,
    maxAltitudeM: 120,
    mode: 'agl',
  }, { elevation: 10, source: 'test-elevation' });

  assert.equal(result.altitudeAglM, 120);
  assert.match(result.warnings.join(' '), /above the configured maximum/);
});

test('builds an Overpass query for OSM drone obstacle evidence', () => {
  const query = buildDroneObstacleOverpassQuery({ lat: 35.681236, lon: 139.767125 }, 250);

  assert.match(query, /"building"/);
  assert.match(query, /"power"~"line\|minor_line"/);
  assert.match(query, /"aeroway"~"aerodrome\|helipad\|runway\|taxiway\|apron"/);
  assert.match(query, /around:1000/);
});

test('marks nearby aeroway evidence as restricted for drone use', () => {
  const elements: OsmElementLike[] = [
    {
      type: 'node',
      id: 1,
      lat: 35.0002,
      lon: 139.0001,
      tags: { aeroway: 'helipad', name: 'Hospital Helipad' },
    },
  ];

  const result = summarizeDroneObstacleRisk({ lat: 35, lon: 139 }, elements);

  assert.equal(result.safety, 'restricted');
  assert.equal(result.candidates[0].kind, 'heliport');
  assert.match(result.warnings.join(' '), /Aeroway/);
});

test('combines altitude and obstacle evidence into a drone navigation point', () => {
  const elements: OsmElementLike[] = [
    {
      type: 'node',
      id: 2,
      lat: 35.0001,
      lon: 139.0001,
      tags: { building: 'yes', height: '45 m' },
    },
  ];

  const result = resolveDroneNavigationPoint(
    { lat: 35, lon: 139, requestedAltitudeM: 50, mode: 'agl' },
    { elevation: 12.5, source: 'opentopodata-srtm30m' },
    elements,
  );

  assert.equal(result.point.altitudeAglM, 50);
  assert.equal(result.point.altitudeMslM, 62.5);
  assert.equal(result.safety, 'caution');
  assert.equal(result.candidates[0].heightM, 45);
  assert.ok(result.sources.includes('osm-overpass'));
});
