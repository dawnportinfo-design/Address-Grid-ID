import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { MOLDOVA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildMoldovaPostalSourceReadiness, validateMoldovaPostalSourceIngestionPlan, validateMoldovaPostalSourceReadiness } from './moldovaPostalSourceReadiness';

test('Moldova postal-source readiness rejects an inferred format while blocking lookup claims', () => {
  const readiness = buildMoldovaPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:46:10.328Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, MOLDOVA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'MD');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('public-sector-reuse-framework-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateMoldovaPostalSourceReadiness(readiness).valid, true);
});

test('Moldova source-ingestion plan rejects unsafe office fields and incomplete mapping evidence', () => {
  assert.deepEqual(validateMoldovaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'admin_code'] }), []);
  const unsafe = validateMoldovaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'branch_address'] });
  assert.ok(unsafe.includes('unsafe-column:branch_address'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Moldova readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'md', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildMoldovaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
