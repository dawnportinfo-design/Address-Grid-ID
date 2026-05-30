import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'AddressRegistration.tsx'), 'utf8');

test('country selector uses image flags with emoji fallback instead of emoji-only spans', () => {
  assert.match(source, /CountryFlag/);
  assert.doesNotMatch(source, /<span className="text-xl[^"]*">\s*\{c\.flag\}\s*<\/span>/);
  assert.doesNotMatch(source, /<span className="text-sm">\{t\.flag\}<\/span>/);
});

test('selected country region summary also uses the flag API image component', () => {
  assert.match(source, /<CountryFlag\s+code=\{currentCountry\?\.code \|\| formData\.country\}/);
  assert.doesNotMatch(source, /const currentFlag = React\.useMemo/);
  assert.doesNotMatch(source, /\{currentFlag\}/);
});

test('country selector is organized by continent tabs with uniform responsive cards', () => {
  assert.match(source, /REGISTRATION_COUNTRY_TABS/);
  assert.match(source, /selectedCountryTab/);
  assert.match(source, /groupRegistrationCountriesByTab\(COUNTRIES\)/);
  assert.match(source, /countryGroups\[selectedCountryTab\]\.map/);
  assert.match(source, /gridTemplateColumns:\s*'repeat\(auto-fit, minmax\(220px, 1fr\)\)'/);
  assert.doesNotMatch(source, /grid-cols-1 sm:grid-cols-2 gap-2">\s*\{COUNTRIES\.map/);
  assert.doesNotMatch(source, /grid-cols-2 sm:grid-cols-3 gap-2/);
});

test('country selector does not render language sphere or regional-language groups', () => {
  const languageGroupTitles = [
    'Anglosphere',
    'Hispanosphere',
    'Lusosphere',
    'Francophonie',
    'Arabic World',
    'Greater China',
    'German Regions',
    'Italian Regions',
    'British Regions',
    'French Regions',
  ];

  for (const title of languageGroupTitles) {
    assert.doesNotMatch(source, new RegExp(`title: '${title}'`));
  }

  assert.doesNotMatch(source, /Regional & Overseas Territories/);
  assert.doesNotMatch(source, /group\.items\.map\(t =>/);
});
