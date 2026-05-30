import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getAgidGridCellFillPaint,
  getAgidGridFocusFillPaint,
  getAgidGridLinePaint,
  getAgidSelectionFillPaint,
} from './gridPaint';

test('renders unselected AGID grid cells with no fill', () => {
  assert.deepEqual(
    getAgidGridCellFillPaint({
      isSatelliteOrDark: false,
      opacityMultiplier: 1,
    }),
    {
      'fill-color': '#475569',
      'fill-opacity': 0,
    }
  );

  assert.deepEqual(
    getAgidGridFocusFillPaint({
      isSatelliteOrDark: true,
      opacityMultiplier: 1,
    }),
    {
      'fill-color': '#94a3b8',
      'fill-opacity': 0,
    }
  );
});

test('keeps selected AGID cells as a red translucent fill', () => {
  assert.deepEqual(getAgidSelectionFillPaint(), {
    'fill-color': '#ef4444',
    'fill-opacity': 0.45,
  });
});

test('uses black regular grid lines for close w3w-style display on light maps', () => {
  assert.equal(
    getAgidGridLinePaint({
      isSatelliteOrDark: false,
      isCloseDistanceGrid: true,
    })['line-color'],
    '#111827',
  );
});
