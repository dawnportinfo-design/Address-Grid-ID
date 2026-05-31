import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildCarStoppableOverpassQuery,
  resolveCarStoppableDestination,
  type OsmElementLike,
} from './navigationDestination';

test('builds an Overpass query for car-stoppable destination evidence', () => {
  const query = buildCarStoppableOverpassQuery({ lat: 35.681236, lon: 139.767125 }, 180);

  assert.match(query, /amenity"~"parking\|parking_entrance\|loading_dock/);
  assert.match(query, /"entrance"/);
  assert.match(query, /"highway"~/);
  assert.match(query, /"motor_vehicle"!="no"/);
});

test('snaps a building-center AGID point to a nearby driveway instead of using the original point', () => {
  const elements: OsmElementLike[] = [
    {
      type: 'node',
      id: 1,
      lat: 35.0000,
      lon: 139.0000,
      tags: { entrance: 'main' },
    },
    { type: 'node', id: 10, lat: 34.9999, lon: 138.9997 },
    { type: 'node', id: 11, lat: 34.9999, lon: 139.0003 },
    {
      type: 'way',
      id: 20,
      nodes: [10, 11],
      tags: {
        highway: 'service',
        service: 'driveway',
      },
    },
  ];

  const result = resolveCarStoppableDestination({ lat: 35.00002, lon: 139.00002 }, elements);

  assert.equal(result.finalPoint.method, 'driveway');
  assert.equal(result.finalPoint.source, 'osm:service-road');
  assert.ok(result.finalPoint.distanceMeters > 0);
  assert.ok(result.confidence >= 0.78);
});

test('prefers a parking entrance when it is close and explicitly mapped', () => {
  const elements: OsmElementLike[] = [
    {
      type: 'node',
      id: 1,
      lat: 35.00001,
      lon: 139.00001,
      tags: {
        amenity: 'parking_entrance',
      },
    },
    { type: 'node', id: 10, lat: 35.0003, lon: 139.0003 },
    { type: 'node', id: 11, lat: 35.0004, lon: 139.0004 },
    {
      type: 'way',
      id: 20,
      nodes: [10, 11],
      tags: {
        highway: 'residential',
      },
    },
  ];

  const result = resolveCarStoppableDestination({ lat: 35.0000, lon: 139.0000 }, elements);

  assert.equal(result.finalPoint.method, 'parking-entrance');
  assert.equal(result.finalPoint.source, 'osm:parking_entrance');
  assert.ok(result.confidence > 0.9);
});

test('falls back to the original point when no vehicle-access evidence is available', () => {
  const result = resolveCarStoppableDestination({ lat: 35.0, lon: 139.0 }, [
    {
      type: 'node',
      id: 1,
      lat: 35.0001,
      lon: 139.0001,
      tags: {
        highway: 'footway',
      },
    },
  ]);

  assert.equal(result.finalPoint.method, 'original');
  assert.equal(result.finalPoint.source, 'agid-original');
  assert.ok(result.confidence < 0.3);
  assert.match(result.warnings.join(' '), /No drivable OSM road/);
});
