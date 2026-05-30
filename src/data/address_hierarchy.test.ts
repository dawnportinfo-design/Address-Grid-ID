import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const addressFormatDir = join(root, 'src', 'data', 'address_formats');
const hierarchyDir = join(root, 'src', 'data', 'address_hierarchy');
const dataDir = join(root, 'src', 'data');

type HierarchyCountry = {
  code: string;
  type: string;
  addressFormatPath: string;
  addressFormat: { countryCode: string; name: string };
};

function loadHierarchyCountries() {
  const countries: HierarchyCountry[] = [];
  for (const fileName of ['africa.json', 'americas.json', 'antarctica.json', 'asia.json', 'europe.json', 'oceania.json', 'special.json']) {
    const filePath = join(hierarchyDir, fileName);
    assert.ok(existsSync(filePath), `${fileName} hierarchy file should exist`);
    const continent = JSON.parse(readFileSync(filePath, 'utf8')) as {
      subregions: Record<string, { countries: HierarchyCountry[] }>;
    };
    for (const subregion of Object.values(continent.subregions)) {
      countries.push(...subregion.countries);
    }
  }
  return countries;
}

function collectAddressFormatFiles(dir = addressFormatDir) {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectAddressFormatFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(relative(addressFormatDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return files.sort();
}

function collectSourceRegionCodes() {
  const sourceFiles = [
    'countries.json',
    'disputed_territories.json',
    'africa_regions.json',
    'americas_regions.json',
    'asia_regions.json',
    'caribbean_regions.json',
    'europe_regions.json',
    'oceania_regions.json',
    'south_america_regions.json',
  ];
  const codes = new Set<string>();

  for (const fileName of sourceFiles) {
    const data = JSON.parse(readFileSync(join(dataDir, fileName), 'utf8'));
    if (Array.isArray(data)) {
      for (const entry of data) codes.add(entry.code);
    } else {
      for (const entries of Object.values(data) as Array<Array<{ code: string }>>) {
        for (const entry of entries) codes.add(entry.code);
      }
    }
  }

  return [...codes].sort();
}

test('every AGID country, territory, autonomous, and disputed code has a country JSON file', () => {
  const sourceCodes = collectSourceRegionCodes();
  const jsonCodes = collectAddressFormatFiles()
    .map(fileName => basename(fileName, '.json'))
    .sort();

  const missing = sourceCodes.filter(code => !jsonCodes.includes(code));
  assert.deepEqual(missing, []);
});

test('address hierarchy nests every country JSON exactly once under continent and subregion files', () => {
  const flatFiles = collectAddressFormatFiles();
  const flatCodes = flatFiles
    .map(fileName => basename(fileName, '.json'))
    .sort();

  const hierarchyCountries = loadHierarchyCountries();
  const hierarchyCodes = hierarchyCountries.map(country => country.code).sort();

  assert.deepEqual(hierarchyCodes, flatCodes);
  for (const country of hierarchyCountries) {
    assert.ok(
      country.addressFormat.countryCode === country.code || country.code.startsWith(`${country.addressFormat.countryCode}_`),
      `${country.code} should embed its own address JSON or a parent-code special territory JSON`,
    );
    assert.equal(basename(country.addressFormatPath, '.json'), country.code);
    assert.ok(flatFiles.includes(country.addressFormatPath.replace('src/data/address_formats/', '')));
  }
});

test('address format JSON files are stored under continent and subregion directories', () => {
  const rootJsonFiles = readdirSync(addressFormatDir)
    .filter(fileName => fileName.endsWith('.json'));
  assert.deepEqual(rootJsonFiles, []);

  const nestedFiles = collectAddressFormatFiles();
  assert.ok(nestedFiles.every(fileName => fileName.split('/').length === 3));
  assert.ok(nestedFiles.includes('asia/east_asia/JP.json'));
  assert.ok(nestedFiles.includes('europe/western_europe/FR.json'));
  assert.ok(nestedFiles.includes('americas/north_america/US.json'));
});

test('address hierarchy places overseas, autonomous, and disputed territories in explicit subregions', () => {
  const byCode = new Map(loadHierarchyCountries().map(country => [country.code, country]));

  assert.equal(byCode.get('GL')?.type, 'autonomous');
  assert.equal(byCode.get('AX')?.type, 'autonomous');
  assert.equal(byCode.get('BQ')?.type, 'territory');
  assert.equal(byCode.get('PM')?.type, 'territory');
  assert.equal(byCode.get('KASH')?.type, 'disputed');
  assert.equal(byCode.get('SCSD')?.type, 'disputed');
  assert.equal(byCode.get('TRNC')?.type, 'disputed');
  assert.equal(byCode.get('JP_TK')?.type, 'disputed');
});

test('continent index points to generated continent files with subregion totals', () => {
  const index = JSON.parse(readFileSync(join(hierarchyDir, 'index.json'), 'utf8')) as {
    continents: { id: string; file: string; total: number }[];
  };

  assert.deepEqual(index.continents.map(continent => continent.id), [
    'africa',
    'americas',
    'antarctica',
    'asia',
    'europe',
    'oceania',
    'special',
  ]);
  assert.ok(index.continents.every(continent => continent.total >= 0));
  assert.ok(index.continents.some(continent => continent.id === 'asia' && continent.total > 0));
  assert.ok(index.continents.some(continent => continent.id === 'europe' && continent.total > 0));
});
