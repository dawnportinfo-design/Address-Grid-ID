import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const addressFormatDir = join(here, 'address_formats');
const polarModulePath = join(here, 'polarOpenGeoSources.ts');

const POLAR_COMMON_NATURAL_SOURCE_IDS = [
  'nsidc-polar-data',
  'gebco-bathymetry',
  'gmrt-topography',
  'marine-regions',
  'protected-planet-wdpa',
  'gbif-occurrence',
  'obis-marine-biodiversity',
] as const;

const ANTARCTIC_NATURAL_SOURCE_IDS = [
  'scar-add',
  'scar-cga',
  'quantarctica',
  'rema-antarctica',
  'bedmap3-antarctica',
  'ibcso-southern-ocean',
  'measures-antarctic-grounding-line',
  'ats-antarctic-protected-areas',
] as const;

const ARCTIC_NATURAL_SOURCE_IDS = [
  'arcticdem',
  'ibcao-arctic-ocean',
  'glims-glacier-db',
  'npolar-data-centre',
] as const;

const GREENLAND_NATURAL_SOURCE_IDS = [
  'greenland-gimp',
] as const;

function findAddressFormatPath(countryCode: string, dir = addressFormatDir): string | null {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findAddressFormatPath(countryCode, fullPath);
      if (found) return found;
    } else if (entry.isFile() && entry.name === `${countryCode}.json`) {
      return fullPath;
    }
  }
  return null;
}

function loadOpenSourceIds(countryCode: string): { topLevel: string[]; rules: string[] } {
  const filePath = findAddressFormatPath(countryCode);
  assert.ok(filePath, `${countryCode}.json should exist under nested address formats`);
  const format = JSON.parse(readFileSync(filePath, 'utf8')) as {
    openSourceIds?: string[];
    addressRules?: { openSourceIds?: string[] };
  };
  return {
    topLevel: format.openSourceIds ?? [],
    rules: format.addressRules?.openSourceIds ?? [],
  };
}

test('polar open geodata registry exists and registers natural geography sources', async () => {
  assert.ok(existsSync(polarModulePath), 'polarOpenGeoSources.ts should centralize polar source metadata');

  const moduleUrl = pathToFileURL(polarModulePath).href;
  const polarSources = await import(moduleUrl) as {
    POLAR_OPEN_GEO_SOURCES: Record<string, { url: string; kind: string }>;
    POLAR_NATURAL_OPEN_SOURCE_IDS: readonly string[];
    POLAR_REGION_CODES: readonly string[];
    getPolarOpenSourceIds: (countryCode: string) => string[];
  };

  const expectedSourceIds = [
    ...POLAR_COMMON_NATURAL_SOURCE_IDS,
    ...ANTARCTIC_NATURAL_SOURCE_IDS,
    ...ARCTIC_NATURAL_SOURCE_IDS,
    ...GREENLAND_NATURAL_SOURCE_IDS,
  ];

  for (const sourceId of expectedSourceIds) {
    const source = polarSources.POLAR_OPEN_GEO_SOURCES[sourceId];
    assert.ok(source, `${sourceId} should be registered as a polar open geodata source`);
    assert.match(source.url, /^https?:\/\//, `${sourceId} should expose a testable URL`);
  }

  assert.ok(polarSources.POLAR_REGION_CODES.includes('AQ'), 'AQ should be covered by polar source metadata');
  assert.ok(polarSources.POLAR_REGION_CODES.includes('GL'), 'GL should be covered by polar source metadata');
  assert.ok(polarSources.getPolarOpenSourceIds('AQ').includes('rema-antarctica'));
  assert.ok(polarSources.getPolarOpenSourceIds('GL').includes('greenland-gimp'));
});

test('polar and subpolar address JSON files expose mountain sea and nature sources', () => {
  const requiredByCode: Record<string, readonly string[]> = {
    AQ: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ANTARCTIC_NATURAL_SOURCE_IDS],
    TF: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ANTARCTIC_NATURAL_SOURCE_IDS],
    BV: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ANTARCTIC_NATURAL_SOURCE_IDS],
    GS: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ANTARCTIC_NATURAL_SOURCE_IDS],
    GL: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ARCTIC_NATURAL_SOURCE_IDS, ...GREENLAND_NATURAL_SOURCE_IDS],
    SJ: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ARCTIC_NATURAL_SOURCE_IDS],
    SJ_SVA: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ARCTIC_NATURAL_SOURCE_IDS],
    SJ_JAN: [...POLAR_COMMON_NATURAL_SOURCE_IDS, ...ARCTIC_NATURAL_SOURCE_IDS],
  };

  for (const [countryCode, sourceIds] of Object.entries(requiredByCode)) {
    const openSourceIds = loadOpenSourceIds(countryCode);

    for (const sourceId of sourceIds) {
      assert.ok(openSourceIds.topLevel.includes(sourceId), `${countryCode} should expose ${sourceId}`);
      assert.ok(openSourceIds.rules.includes(sourceId), `${countryCode} addressRules should expose ${sourceId}`);
    }
  }
});
