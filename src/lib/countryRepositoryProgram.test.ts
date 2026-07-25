import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  COUNTRY_REPOSITORY_PROGRAM_SCHEMA_ID,
  buildCountryRepositoryProgram,
  validateCountryRepositoryProgram,
} from './countryRepositoryProgram';

test('country repository program starts with Guatemala and preserves the requested rollout order', () => {
  const program = buildCountryRepositoryProgram({ generatedAt: '2026-07-23T06:12:06.057Z' });
  const countries = program.cohorts.flatMap(cohort => cohort.countries);
  assert.equal(program.schemaId, COUNTRY_REPOSITORY_PROGRAM_SCHEMA_ID);
  assert.equal(countries.length, 27);
  assert.deepEqual(countries.slice(0, 5).map(country => country.countryCode), ['GT', 'HN', 'NI', 'SV', 'PA']);
  assert.deepEqual(countries.slice(5, 8).map(country => country.countryCode), ['LS', 'SZ', 'GW']);
  assert.equal(countries[0]?.stage, 'bootstrap-ready');
  assert.ok(countries.slice(1).every(country => country.stage === 'planned'));
  assert.equal(validateCountryRepositoryProgram(program).valid, true);
});

test('country repository program rejects an accidental postal lookup release', () => {
  const program = buildCountryRepositoryProgram();
  (program.publicationBoundary as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;
  const validation = validateCountryRepositoryProgram(program);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});
