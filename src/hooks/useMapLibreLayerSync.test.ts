import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'useMapLibreLayerSync.ts'), 'utf8');

test('MapLibre layer sync is isolated from App and diff-updates paint/layout props', () => {
  assert.match(source, /export function useMapLibreLayerSync/);
  assert.match(source, /lastPropsRef/);
  assert.match(source, /sameLayerProps/);
  assert.match(source, /setPaintProperty/);
  assert.match(source, /setLayoutProperty/);
});

test('MapLibre layer sync resets its prop cache when the style changes', () => {
  assert.match(source, /cacheKey\?: string/);
  assert.match(source, /lastPropsRef\.current = \{\}/);
});
