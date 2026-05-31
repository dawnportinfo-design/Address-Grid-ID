import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'verify-gis-data.ts'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'));

test('GIS validator exports AGID boundary data for QGIS and GDAL validation', () => {
  assert.match(source, /agid-boundary-validation\.geojson/);
  assert.match(source, /AGID-gis-validation\.qgs/);
  assert.match(source, /ogr2ogr/);
  assert.match(source, /coordinate-out-of-range/);
  assert.match(source, /point-outside-bbox/);
});

test('package exposes GIS validation scripts', () => {
  assert.equal(packageJson.scripts['verify:gis'], 'tsx scripts/verify-gis-data.ts');
  assert.equal(packageJson.scripts['verify:gis:changed'], 'tsx scripts/verify-gis-data.ts --changed');
  assert.equal(packageJson.scripts['verify:gis:strict'], 'tsx scripts/verify-gis-data.ts --strict');
});

test('GIS validator has a changed-file fast path for cheap preflight checks', () => {
  assert.match(source, /const changedOnly = args\.has\('--changed'\)/);
  assert.match(source, /shouldSkipChangedValidation/);
  assert.match(source, /Changed-file fast path: skipped full GIS validation/);
});
