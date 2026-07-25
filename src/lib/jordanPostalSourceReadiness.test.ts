import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { JORDAN_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildJordanPostalSourceReadiness, validateJordanPostalSourceIngestionPlan, validateJordanPostalSourceReadiness } from './jordanPostalSourceReadiness';

test('Jordan postal-source readiness records open-data terms while blocking unsafe postcode acquisition', () => {
  const readiness = buildJordanPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:42:10.184Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, JORDAN_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'JO');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('government-open-data-license-recorded')?.status, 'passed');
  assert.equal(gates.get('safe-postcode-only-source')?.status, 'blocked');
  assert.equal(validateJordanPostalSourceReadiness(readiness).valid, true);
});

test('Jordan source-ingestion plan rejects unsafe office fields and incomplete mapping evidence', () => {
  assert.deepEqual(validateJordanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'admin_code'] }), []);
  const unsafe = validateJordanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'office_address'] });
  assert.ok(unsafe.includes('unsafe-column:office_address'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Jordan readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'jo', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildJordanPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
