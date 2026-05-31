import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assessDroneLandingZone } from './droneAssessment';

test('scores a favorable landing zone as low risk', () => {
  const result = assessDroneLandingZone({
    elevationMeters: 42,
    windSpeedMs: 3.8,
    waterRisk: 'Low',
    geologicalRisks: { landslide: 'Low', flood: 'Low', seismic: 'Low' },
    landCover: 'Open Land',
    nearbyPeaks: [],
    sources: ['test-source'],
  });

  assert.equal(result.label, 'Low risk');
  assert.ok(result.score >= 80);
  assert.ok(result.confidence >= 0.8);
  assert.ok(result.strengths.some(strength => strength.includes('Wind')));
});

test('penalizes strong wind, water risk, and urban terrain', () => {
  const result = assessDroneLandingZone({
    elevationMeters: 12,
    windSpeedMs: 14,
    waterRisk: 'High (Floodplain/Wetland)',
    geologicalRisks: { landslide: 'Moderate', flood: 'High', seismic: 'Moderate to High' },
    landCover: 'Urban',
    nearbyPeaks: [{ name: 'Signal Hill', elevation: 330 }],
  });

  assert.equal(result.label, 'Avoid');
  assert.ok(result.score < 40);
  assert.ok(result.warnings.some(warning => warning.includes('Strong wind')));
  assert.equal(result.highestNearbyPeak?.name, 'Signal Hill');
});

test('keeps missing live data visible as lower confidence', () => {
  const result = assessDroneLandingZone({});

  assert.ok(result.confidence < 0.5);
  assert.ok(result.warnings.includes('Wind data is unavailable'));
  assert.ok(result.warnings.includes('Ground elevation is unavailable'));
});

