import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildDroneMissionPlan,buildDroneRouteSamples } from './droneMissionPlan';

test('builds a field-check flight plan from origin to target', () => {
  const plan = buildDroneMissionPlan({
    origin: { lat: 35.681236, lon: 139.767125 },
    target: { lat: 35.682839, lon: 139.759455 },
    landingAssessment: {
      score: 86,
      label: 'Low risk',
      confidence: 0.9,
      elevationMeters: 12,
      windSpeedMs: 4,
      waterRisk: 'Low',
      warnings: [],
      strengths: ['Wind is within a favorable planning range'],
      sources: ['Open-Meteo'],
    },
    navigationPoint: {
      altitudeAglM: 30,
      altitudeMslM: 42,
      safety: 'clear',
      confidence: 0.86,
      candidates: [],
      warnings: [],
      sources: ['osm-overpass'],
    },
  });

  assert.equal(plan.status, 'field-check');
  assert.ok(plan.distanceMeters > 600);
  assert.ok(plan.distanceMeters < 800);
  assert.equal(plan.recommendedAltitudeAglM, 30);
  assert.ok(plan.estimatedFlightMinutes > 1);
  assert.ok(plan.checklist.some(item => item.includes('visual line of sight')));
});

test('holds a plan when mapped obstacles are near the target', () => {
  const plan = buildDroneMissionPlan({
    origin: { lat: 35, lon: 139 },
    target: { lat: 35.001, lon: 139.001 },
    landingAssessment: {
      score: 72,
      label: 'Caution',
      confidence: 0.8,
      elevationMeters: 40,
      windSpeedMs: 6,
      waterRisk: 'Low',
      warnings: ['Urban or industrial land cover may limit safe landing space'],
      strengths: [],
      sources: ['OpenStreetMap/Overpass'],
    },
    navigationPoint: {
      altitudeAglM: 30,
      altitudeMslM: 70,
      safety: 'caution',
      confidence: 0.82,
      candidates: [
        { id: 'way/1', kind: 'building', source: 'osm:building', distanceMeters: 45, heightM: 38, lat: 35.001, lon: 139.001 },
      ],
      warnings: ['Mapped building, tower, or power-line evidence is close to the AGID point.'],
      sources: ['osm:building'],
    },
  });

  assert.equal(plan.status, 'hold');
  assert.ok(plan.recommendedAltitudeAglM >= 53);
  assert.ok(plan.risks.some(risk => risk.includes('obstacle')));
});

test('marks restricted or avoid landing zones as avoid', () => {
  const plan = buildDroneMissionPlan({
    origin: { lat: 35, lon: 139 },
    target: { lat: 35.01, lon: 139.01 },
    landingAssessment: {
      score: 22,
      label: 'Avoid',
      confidence: 0.9,
      elevationMeters: 4,
      windSpeedMs: 15,
      waterRisk: 'High',
      warnings: ['Strong wind for small drone operations'],
      strengths: [],
      sources: ['Open-Meteo'],
    },
    navigationPoint: {
      altitudeAglM: 30,
      altitudeMslM: 34,
      safety: 'restricted',
      confidence: 0.9,
      candidates: [],
      warnings: ['Aeroway, heliport, runway, or airport-related OSM feature was found nearby.'],
      sources: ['osm:aeroway:aerodrome'],
    },
  });

  assert.equal(plan.status, 'avoid');
  assert.ok(plan.risks.some(risk => risk.includes('restricted')));
});

test('samples a route corridor at stable progress intervals', () => {
  const samples = buildDroneRouteSamples({
    origin: { lat: 35, lon: 139 },
    target: { lat: 35.01, lon: 139.02 },
    sampleCount: 5,
  });

  assert.equal(samples.length, 5);
  assert.deepEqual(samples.map(sample => sample.progress), [0, 0.25, 0.5, 0.75, 1]);
  assert.equal(samples[0].lat, 35);
  assert.equal(samples[4].lon, 139.02);
  assert.ok(samples[2].distanceFromStartMeters > samples[1].distanceFromStartMeters);
});
