import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildDroneCorridorReport } from './droneCorridor';

const samples = [
  { index: 0, progress: 0, lat: 35, lon: 139, distanceFromStartMeters: 0 },
  { index: 1, progress: 0.5, lat: 35.001, lon: 139.001, distanceFromStartMeters: 140 },
  { index: 2, progress: 1, lat: 35.002, lon: 139.002, distanceFromStartMeters: 280 },
];

test('summarizes a clear corridor as field-check', () => {
  const report = buildDroneCorridorReport({
    samples,
    sampleAssessments: [
      { sampleIndex: 0, label: 'Low risk', score: 90, confidence: 0.9, warnings: [] },
      { sampleIndex: 1, label: 'Low risk', score: 86, confidence: 0.8, warnings: [] },
      { sampleIndex: 2, label: 'Caution', score: 74, confidence: 0.75, warnings: ['Moderate wind requires pilot caution'] },
    ],
  });

  assert.equal(report.status, 'field-check');
  assert.equal(report.worstLabel, 'Caution');
  assert.equal(report.minScore, 74);
  assert.equal(report.samples.length, 3);
});

test('holds a corridor when a middle sample has high caution', () => {
  const report = buildDroneCorridorReport({
    samples,
    sampleAssessments: [
      { sampleIndex: 0, label: 'Low risk', score: 90, confidence: 0.9, warnings: [] },
      { sampleIndex: 1, label: 'High caution', score: 48, confidence: 0.8, warnings: ['Mapped obstacle evidence is close'] },
      { sampleIndex: 2, label: 'Low risk', score: 84, confidence: 0.8, warnings: [] },
    ],
  });

  assert.equal(report.status, 'hold');
  assert.equal(report.worstSample?.sample.index, 1);
  assert.ok(report.warnings.some(warning => warning.includes('Mapped obstacle')));
});

test('avoids a corridor when any sample is avoid', () => {
  const report = buildDroneCorridorReport({
    samples,
    sampleAssessments: [
      { sampleIndex: 0, label: 'Low risk', score: 90, confidence: 0.9, warnings: [] },
      { sampleIndex: 1, label: 'Avoid', score: 20, confidence: 0.9, warnings: ['Restricted aeroway nearby'] },
      { sampleIndex: 2, label: 'Low risk', score: 84, confidence: 0.8, warnings: [] },
    ],
  });

  assert.equal(report.status, 'avoid');
  assert.equal(report.worstLabel, 'Avoid');
  assert.ok(report.summary.includes('Do not use'));
});
