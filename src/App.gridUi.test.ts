import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'App.tsx'), 'utf8');

test('does not show grid area size metrics in the user map UI', () => {
  assert.doesNotMatch(source, /Grid Area m2/);
  assert.doesNotMatch(source, /gridMetricSummary && isGridVisible/);
});

test('keeps a manual search selection stable while the map is panned', () => {
  const dragStartBlock = source.match(/map\.current\.on\('dragstart', \(\) => \{[\s\S]*?\n    \}\);/);

  assert.ok(dragStartBlock, 'dragstart handler should exist');
  assert.doesNotMatch(dragStartBlock[0], /setIsManualSelection\(false\)/);
});

test('map move handlers read the latest manual selection state through refs', () => {
  assert.match(source, /isManualSelectionRef\.current/);
  assert.match(source, /clickedAgidRef\.current/);
  assert.match(source, /updateGridRef\.current\?\.\(/);
});

test('refreshes grid geometry after panning so black lines keep covering the viewport', () => {
  const moveEndBlock = source.match(/map\.current\.on\('moveend', \(\) => \{[\s\S]*?\n    \}\);/);

  assert.ok(moveEndBlock, 'moveend handler should exist');
  assert.match(moveEndBlock[0], /updateGridRef\.current\?\.\(result, selectedResult, 4, true\)/);
});

test('updates red highlights from the same frame as the refreshed black grid', () => {
  assert.match(source, /const syncHighlightLayers = \(frame: GridRenderFrame, showHighlight: boolean = shouldShowHighlight\)/);
  assert.match(source, /renderedGridFrameRef\.current = requestedGridFrame;\s*syncHighlightLayers\(requestedGridFrame\);/);
});

test('draws red cell fills from rendered black grid cells below the black line layer', () => {
  assert.match(source, /findContainingGridCellPolygon/);
  assert.match(source, /renderedGridCellsRef\.current = gridCells;/);
  assert.match(source, /ensureSourceAndLayer\(selectedSourceId, 'fill', selectedData, getAgidSelectionFillPaint\(\), \{\}, undefined, sourceId \+ '-layer'\)/);
});

test('uses full viewport bounds and clears old partial grids before showing a refreshed grid', () => {
  assert.match(source, /getViewportGridBounds/);
  assert.match(source, /map\.current\.unproject/);
  assert.match(source, /gridCellsCoverBounds\(renderedGridCellsRef\.current, visibleBounds\)/);
  assert.match(source, /clearGridLayers\(\)/);
});

test('checks coverage against visible bounds while prefetching a larger grid for fast panning', () => {
  assert.match(source, /const visibleBounds = getViewportGridBounds\(viewportCorners, 0\)/);
  assert.match(source, /const renderBounds = getViewportGridBounds\(viewportCorners, mapPitch > 30 \? 1 : 0\.75\)/);
  assert.match(source, /gridCellsCoverBounds\(renderedGridCellsRef\.current, visibleBounds\)/);
  assert.match(source, /shouldRefreshGridForViewport\(refreshGrid, renderedGridCellsRef\.current, visibleBounds, pendingGridBoundsRef\.current\)/);
  assert.match(source, /bounds: renderBounds/);
});

test('tracks pending grid request bounds to avoid replacing in-flight pan updates', () => {
  assert.match(source, /const pendingGridBoundsRef = useRef<\[\[number, number\], \[number, number\]\] \| null>\(null\)/);
  assert.match(source, /pendingGridBoundsRef\.current = renderBounds/);
  assert.match(source, /pendingGridBoundsRef\.current = null/);
});

test('hides every grid layer when the viewport width exceeds 200m', () => {
  assert.match(source, /shouldShowGridForViewport/);
  assert.match(source, /const shouldShow = shouldShowDisplayGrid\(\{ zoom: gridZoom, isGridVisible, gridOpacityLevel \}\) && shouldShowGridForViewport\(viewportCorners\)/);
});

test('keeps checking grid coverage inside throttled pan updates', () => {
  const throttledMoveBranch = source.match(/if \(now - lastMoveUpdate < 100\) \{[\s\S]*?return;\s*\}/);

  assert.ok(throttledMoveBranch, 'throttled move branch should exist');
  assert.match(throttledMoveBranch[0], /const selectedResult = isManualSelectionRef\.current \? clickedAgidRef\.current \|\| undefined : undefined;/);
  assert.match(throttledMoveBranch[0], /updateGridRef\.current\?\.\(result, selectedResult, 4, false\)/);
});
