import assert from 'node:assert/strict';
import { existsSync,readdirSync,readFileSync } from 'node:fs';
import { basename,dirname,join,relative } from 'node:path';
import { test } from 'node:test';
import { parse } from 'yaml';

const addressFormatDir = join(process.cwd(), 'src', 'data', 'address_formats');

function collectFiles(extension: '.json' | '.yaml', dir = addressFormatDir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(extension, fullPath));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(relative(addressFormatDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return files.sort();
}

test('every nested country address JSON has a same-directory YAML copy', () => {
  const jsonFiles = collectFiles('.json');
  const yamlFiles = collectFiles('.yaml');

  assert.ok(jsonFiles.length > 250);
  assert.deepEqual(
    yamlFiles.map(fileName => fileName.replace(/\.yaml$/, '.json')),
    jsonFiles,
  );
});

test('country YAML files preserve country code, name, and continent/subregion placement', () => {
  for (const sample of [
    'asia/east_asia/JP.yaml',
    'americas/north_america/US.yaml',
    'europe/western_europe/FR.yaml',
    'africa/western_africa/NG.yaml',
    'oceania/oceania/AU.yaml',
  ]) {
    const filePath = join(addressFormatDir, sample);
    assert.ok(existsSync(filePath), `${sample} should exist`);
    const parsed = parse(readFileSync(filePath, 'utf8')) as { countryCode: string; name: string };
    assert.equal(parsed.countryCode, basename(sample, '.yaml'));
    assert.ok(parsed.name.length > 0);
    assert.equal(dirname(sample).split('/').length, 2);
  }
});
