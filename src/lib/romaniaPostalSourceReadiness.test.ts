import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { ROMANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildRomaniaPostalSourceReadiness, validateRomaniaPostalSourceIngestionPlan, validateRomaniaPostalSourceReadiness } from './romaniaPostalSourceReadiness';

test('Romania postal-source readiness records six-digit format evidence while blocking current lookup claims', () => {
  const readiness = buildRomaniaPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:01:40.510Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, ROMANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'RO');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{6}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('national-postcode-format-authority-recorded')?.status, 'passed');
  assert.equal(gates.get('current-postcode-mapping-freshness')?.status, 'blocked');
  assert.equal(validateRomaniaPostalSourceReadiness(readiness).valid, true);
});

test('Romania source-ingestion plan rejects stale, street-level, office, and geometry mapping fields', () => {
  assert.deepEqual(validateRomaniaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'county_code'] }), []);
  const unsafe = validateRomaniaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'street_name', 'house_number', 'postal_unit', 'geometry'] });
  assert.ok(unsafe.includes('unsafe-column:street_name'));
  assert.ok(unsafe.includes('unsafe-column:house_number'));
  assert.ok(unsafe.includes('unsafe-column:postal_unit'));
  assert.ok(unsafe.includes('unsafe-column:geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-not-current'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Romania readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ro', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildRomaniaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
