import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getDisplayCellSizeMeters,
  getDisplayGridStep,
  getCloseDistanceGridFade,
  getEffectiveGridOpacityLevel,
  getGridRenderRange,
  metricSquareCellFromCenter,
  regularMetricCellFromPoint,
  shouldShowDisplayGrid,
  toUndirectedSegmentKey,
} from './gridDisplay';

describe('grid display shared utilities', () => {
  it('keeps display step and meter size in one shared calculation', () => {
    assert.equal(getDisplayGridStep(16), 4);
    assert.equal(getDisplayCellSizeMeters(16), 17.6);
  });

  it('keeps grid render density thresholds explicit', () => {
    assert.equal(getGridRenderRange(14), 40);
    assert.equal(getGridRenderRange(16), 70);
    assert.equal(getGridRenderRange(19), 100);
  });

  it('auto-shows black grid lines at close zoom like what3words', () => {
    assert.equal(shouldShowDisplayGrid({ zoom: 18.25, isGridVisible: false, gridOpacityLevel: 0 }), true);
    assert.equal(getEffectiveGridOpacityLevel({ zoom: 18.25, isGridVisible: false, gridOpacityLevel: 0 }), 3);
  });

  it('keeps far zoom grid hidden when the user turned it off', () => {
    assert.equal(shouldShowDisplayGrid({ zoom: 17.24, isGridVisible: false, gridOpacityLevel: 0 }), false);
    assert.equal(getEffectiveGridOpacityLevel({ zoom: 17.24, isGridVisible: false, gridOpacityLevel: 0 }), 0);
  });

  it('hides the close distance grid when zoomed out even if the grid toggle is enabled', () => {
    assert.equal(shouldShowDisplayGrid({ zoom: 16.5, isGridVisible: true, gridOpacityLevel: 5 }), false);
    assert.equal(getEffectiveGridOpacityLevel({ zoom: 16.5, isGridVisible: true, gridOpacityLevel: 5 }), 0);
  });

  it('fades the grid in over a narrow what3words-style close zoom band', () => {
    assert.equal(getCloseDistanceGridFade(17.25), 0);
    assert.equal(getCloseDistanceGridFade(17.75), 0.5);
    assert.equal(getCloseDistanceGridFade(18.25), 1);
  });

  it('uses one key for the same segment in either direction', () => {
    const a = [139.7671, 35.6812];
    const b = [139.7672, 35.6813];

    assert.equal(toUndirectedSegmentKey(a, b), toUndirectedSegmentKey(b, a));
  });

  it('creates right-angle metric display cells', () => {
    const cell = metricSquareCellFromCenter(35.6812, 139.7671, getDisplayCellSizeMeters(16));

    assert.equal(cell.length, 5);
    assert.equal(cell[0][1], cell[1][1]);
    assert.equal(cell[1][0], cell[2][0]);
    assert.equal(cell[2][1], cell[3][1]);
    assert.equal(cell[3][0], cell[0][0]);
  });

  it('anchors the display grid to Null Island, the equator, and the prime meridian', () => {
    const cell = regularMetricCellFromPoint(0.000001, 0.000001, 18);

    assert.equal(cell[0][0], 0);
    assert.equal(cell[0][1], 0);
  });
});
