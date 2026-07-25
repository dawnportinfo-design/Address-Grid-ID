import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { TAJIKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildTajikistanPostalSourceReadiness, validateTajikistanPostalSourceIngestionPlan, validateTajikistanPostalSourceReadiness } from './tajikistanPostalSourceReadiness';

test('Tajikistan postal-source readiness records six-digit format evidence while blocking lookup claims', () => {
  const readiness = buildTajikistanPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:34:10.077Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, TAJIKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'TJ');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{6}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('administrative-structure-license-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateTajikistanPostalSourceReadiness(readiness).valid, true);
});

test('Tajikistan source-ingestion plan rejects unsafe location fields and incomplete mapping evidence', () => {
  assert.deepEqual(validateTajikistanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'admin_code'] }), []);
  const unsafe = validateTajikistanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'building'] });
  assert.ok(unsafe.includes('unsafe-column:building'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Tajikistan readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'tj', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildTajikistanPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
