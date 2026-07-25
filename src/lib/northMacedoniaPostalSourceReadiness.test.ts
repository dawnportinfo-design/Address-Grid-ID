import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { NORTH_MACEDONIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildNorthMacedoniaPostalSourceReadiness, validateNorthMacedoniaPostalSourceIngestionPlan, validateNorthMacedoniaPostalSourceReadiness } from './northMacedoniaPostalSourceReadiness';

test('North Macedonia postal-source readiness rejects an inferred format while blocking lookup claims', () => {
  const readiness = buildNorthMacedoniaPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:51:40.365Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, NORTH_MACEDONIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'MK');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('attributed-statistical-territorial-summary-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateNorthMacedoniaPostalSourceReadiness(readiness).valid, true);
});

test('North Macedonia source-ingestion plan rejects office and cadastral fields with incomplete mapping evidence', () => {
  assert.deepEqual(validateNorthMacedoniaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'municipality_code'] }), []);
  const unsafe = validateNorthMacedoniaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'office_address', 'work_time', 'cadastral_parcel'] });
  assert.ok(unsafe.includes('unsafe-column:office_address'));
  assert.ok(unsafe.includes('unsafe-column:work_time'));
  assert.ok(unsafe.includes('unsafe-column:cadastral_parcel'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in North Macedonia readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'mk', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildNorthMacedoniaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
