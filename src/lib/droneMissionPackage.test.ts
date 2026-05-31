import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildDroneMissionQrPayload,
  buildDroneMissionRecord,
  buildSavedQrFromDroneMission,
  parseDroneMissionQrPayload,
} from './droneMissionPackage';

const plan = {
  status: 'field-check' as const,
  distanceMeters: 720,
  bearingDegrees: 284,
  estimatedFlightMinutes: 1.5,
  recommendedAltitudeAglM: 30,
  recommendedAltitudeMslM: 42,
  riskSummary: 'Ready for field check.',
  risks: [],
  checklist: ['Confirm local drone law.'],
  routeSamples: [
    { index: 0, progress: 0, lat: 35, lon: 139, distanceFromStartMeters: 0 },
    { index: 1, progress: 1, lat: 35.001, lon: 139.002, distanceFromStartMeters: 720 },
  ],
  sources: ['OpenStreetMap/Overpass'],
};

const corridorReport = {
  status: 'field-check' as const,
  minScore: 84,
  worstLabel: 'Caution' as const,
  worstSample: null,
  confidence: 0.82,
  summary: 'Corridor is ready for field check.',
  warnings: [],
  samples: [],
};

test('drone mission records round-trip through a compact QR payload', () => {
  const record = buildDroneMissionRecord({
    agid: 'JP05AV8TJGH8',
    origin: { lat: 35.681236, lon: 139.767125, label: 'Tokyo Station' },
    target: { lat: 35.682839, lon: 139.759455, label: 'JP05AV8TJGH8' },
    plan,
    corridorReport,
    now: '2026-06-01T12:00:00.000Z',
  });

  const payload = buildDroneMissionQrPayload(record);
  const parsed = parseDroneMissionQrPayload(payload);

  assert.equal(record.type, 'DRONE_MISSION');
  assert.equal(record.id, 'DRONE-JP05AV8TJGH8');
  assert.equal(parsed?.id, record.id);
  assert.equal(parsed?.plan.status, 'field-check');
  assert.equal(parsed?.corridorReport?.minScore, 84);
  assert.equal(parsed?.target.label, 'JP05AV8TJGH8');
});

test('drone mission records create saved QR cards', () => {
  const record = buildDroneMissionRecord({
    origin: { lat: 35, lon: 139, label: 'Origin' },
    target: { lat: 35.001, lon: 139.002, label: 'Landing point' },
    plan,
    now: '2026-06-01T12:01:00.000Z',
  });
  const payload = buildDroneMissionQrPayload(record);
  const saved = buildSavedQrFromDroneMission(record, payload, '2026-06-01T12:02:00.000Z');

  assert.equal(saved.source, 'drone_mission');
  assert.equal(saved.lat, 35.001);
  assert.equal(saved.lon, 139.002);
  assert.match(saved.address, /Drone Mission/);
  assert.equal(saved.payload, payload);
});
