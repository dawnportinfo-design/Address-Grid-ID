import assert from 'node:assert/strict';
import { readdirSync,readFileSync } from 'node:fs';
import { join,relative } from 'node:path';
import { test } from 'node:test';

import { hydrateAddressFormat } from './addressFormatCommon';

type AddressFormatWithSources = {
  countryCode?: string;
  openSourceIds?: string[];
  addressRules?: {
    openSourceIds?: string[];
  };
};

const addressFormatDir = join(process.cwd(), 'src', 'data', 'address_formats');

function collectJsonFiles(dir = addressFormatDir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

test('hydrateAddressFormat exposes shared open-source ids in addressRules without duplicating country JSON', () => {
  const hydrated = hydrateAddressFormat({
    countryCode: 'ZZ',
    openSourceIds: ['osm-nominatim', 'openaddresses', 'osm-nominatim'],
    addressRules: {},
  } as AddressFormatWithSources);

  assert.deepEqual(hydrated.openSourceIds, ['osm-nominatim', 'openaddresses']);
  assert.deepEqual(hydrated.addressRules?.openSourceIds, ['osm-nominatim', 'openaddresses']);
});

test('country JSON keeps open-source source ids in one canonical location', () => {
  for (const filePath of collectJsonFiles()) {
    const format = JSON.parse(readFileSync(filePath, 'utf8')) as AddressFormatWithSources;
    const relativePath = relative(addressFormatDir, filePath).replace(/\\/g, '/');

    assert.ok(format.openSourceIds?.length, `${relativePath} should keep top-level openSourceIds`);
    assert.equal(
      format.addressRules?.openSourceIds,
      undefined,
      `${relativePath} should inherit addressRules.openSourceIds instead of duplicating them`,
    );
  }
});
