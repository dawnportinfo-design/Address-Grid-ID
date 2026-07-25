import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { MONTENEGRO_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildMontenegroPostalSourceReadiness, validateMontenegroPostalSourceIngestionPlan, validateMontenegroPostalSourceReadiness } from './montenegroPostalSourceReadiness';

test('Montenegro readiness records five-digit format evidence while blocking current lookup claims', () => {
  const readiness = buildMontenegroPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:23:41.111Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, MONTENEGRO_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'ME');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{5}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('national-postcode-format-authority-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-format-currentness')?.status, 'blocked');
  assert.equal(validateMontenegroPostalSourceReadiness(readiness).valid, true);
});

test('Montenegro ingestion plan rejects address-bearing and cadastral fields without mapping evidence', () => {
  assert.deepEqual(validateMontenegroPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'municipality_code'] }), []);
  const unsafe = validateMontenegroPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'street_name', 'post_office_phone', 'cadastral_parcel', 'geometry'] });
  assert.ok(unsafe.includes('unsafe-column:street_name'));
  assert.ok(unsafe.includes('unsafe-column:post_office_phone'));
  assert.ok(unsafe.includes('unsafe-column:cadastral_parcel'));
  assert.ok(unsafe.includes('unsafe-column:geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-not-current'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Montenegro readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'me', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildMontenegroPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
