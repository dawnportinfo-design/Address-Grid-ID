import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID,
  buildCountryRepositoryScaffold,
  validateCountryRepositoryScaffold,
} from './countryRepositoryScaffold';
import { buildCountryRepositoryProgram } from './countryRepositoryProgram';

test('Guatemala country repository scaffold keeps AGID linkage and postal claims bounded', () => {
  const scaffold = buildCountryRepositoryScaffold({ countryCode: 'GT', generatedAt: '2026-07-23T06:12:06.057Z' });
  const files = new Map(scaffold.files.map(file => [file.relativePath, file.content]));
  const manifest = JSON.parse(files.get('manifest.json') || '{}');
  const compatibility = JSON.parse(files.get('agid-core-compatibility.json') || '{}');
  const qualityGates = JSON.parse(files.get('quality-gates.json') || '{}');

  assert.equal(scaffold.schemaId, COUNTRY_REPOSITORY_SCAFFOLD_SCHEMA_ID);
  assert.equal(scaffold.repository, 'agid-country-gt');
  assert.equal(manifest.parentRepository, 'AGID');
  assert.equal(manifest.privacy.containsPersonalData, false);
  assert.equal(manifest.privacy.realPostalLookupEnabled, false);
  assert.equal(compatibility.countryPackVersion, 'agid-postal-country-pack-v0.1');
  assert.ok(qualityGates.gates.some((gate: { id: string }) => gate.id === 'no-raw-personal-address-in-github'));
  assert.ok(files.has('.github/workflows/validate.yml'));
  assert.match(files.get('scripts/verify.mjs') || '', /fileURLToPath\(import\.meta\.url\)/);
  assert.doesNotMatch(files.get('scripts/verify.mjs') || '', /process\.cwd\(\)/);
  assert.equal(validateCountryRepositoryScaffold(scaffold).valid, true);
});

test('every planned country has a valid bounded repository scaffold', () => {
  const countries = buildCountryRepositoryProgram({ generatedAt: '2026-07-23T06:12:06.057Z' })
    .cohorts
    .flatMap(cohort => cohort.countries);

  for (const country of countries) {
    const scaffold = buildCountryRepositoryScaffold({
      countryCode: country.countryCode,
      generatedAt: '2026-07-23T06:12:06.057Z',
    });
    assert.equal(scaffold.repository, country.repository);
    assert.equal(validateCountryRepositoryScaffold(scaffold).valid, true);
  }
});

test('country repository scaffold rejects an unsafe release boundary', () => {
  const scaffold = buildCountryRepositoryScaffold({ countryCode: 'GT' });
  const manifest = scaffold.files.find(file => file.relativePath === 'manifest.json');
  assert.ok(manifest);
  const parsed = JSON.parse(manifest.content);
  parsed.privacy.realPostalLookupEnabled = true;
  manifest.content = `${JSON.stringify(parsed, null, 2)}\n`;

  const validation = validateCountryRepositoryScaffold(scaffold);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('operational-claim-boundary-invalid'));
});
