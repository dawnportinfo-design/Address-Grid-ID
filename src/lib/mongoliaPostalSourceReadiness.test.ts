import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { MONGOLIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildMongoliaPostalSourceReadiness, validateMongoliaPostalSourceIngestionPlan, validateMongoliaPostalSourceReadiness } from './mongoliaPostalSourceReadiness';

test('Mongolia postal-source readiness records five-digit format evidence while blocking lookup claims', () => {
  const readiness = buildMongoliaPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:23:39.938Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, MONGOLIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'MN');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{5}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('designated-operator-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateMongoliaPostalSourceReadiness(readiness).valid, true);
});

test('Mongolia source-ingestion plan rejects unsafe location fields and incomplete mapping evidence', () => {
  const safe = validateMongoliaPostalSourceIngestionPlan({
    rawSnapshotStorage: 'external-nonpublic',
    rawRecordsBundled: false,
    allowMappingIngestion: false,
    mappingReuseTermsVerified: false,
    mappingVersion: null,
    coverageEvidenceRecorded: false,
    correctionPathRecorded: false,
    proposedColumns: ['postal_code', 'admin_code'],
  });
  assert.deepEqual(safe, []);
  const unsafe = validateMongoliaPostalSourceIngestionPlan({
    rawSnapshotStorage: 'external-nonpublic',
    rawRecordsBundled: false,
    allowMappingIngestion: true,
    mappingReuseTermsVerified: false,
    mappingVersion: null,
    coverageEvidenceRecorded: false,
    correctionPathRecorded: false,
    proposedColumns: ['postal_code', 'latitude'],
  });
  assert.ok(unsafe.includes('unsafe-column:latitude'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Mongolia readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'mn', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildMongoliaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateMongoliaPostalSourceReadiness(committed).valid, true);
});
