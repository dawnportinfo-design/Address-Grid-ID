import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8');
}

test('AddressRegistration keeps territory datasets outside the component file', () => {
  const component = read('components/AddressRegistration.tsx');
  const dataModule = read('lib/addressRegistrationTerritories.ts');

  assert.doesNotMatch(component, /const BRITISH_TERRITORIES\s*=/);
  assert.match(component, /from '..\/lib\/addressRegistrationTerritories'/);
  assert.match(dataModule, /export const BRITISH_TERRITORIES/);
  assert.match(dataModule, /export const CENTRAL_SOUTH_ASIA_TERRITORIES/);
});

test('country admin API URL construction stays out of UI components', () => {
  const app = read('App.tsx');
  const postalLab = read('components/PostalCodeLab.tsx');
  const geoArchitect = read('components/GeoArchitectPanel.tsx');

  for (const source of [app, postalLab, geoArchitect]) {
    assert.doesNotMatch(source, /fetch\(`\/api\/country-(stats|cities|boundary)/);
    assert.doesNotMatch(source, /fetch\('\/api\/data-quality\/report'/);
    assert.doesNotMatch(source, /fetch\(`\/api\/osm-search/);
  }
});
