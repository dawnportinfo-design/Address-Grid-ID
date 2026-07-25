import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { VENEZUELA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildVenezuelaPostalSourceReadiness, validateVenezuelaPostalSourceIngestionPlan, validateVenezuelaPostalSourceReadiness } from './venezuelaPostalSourceReadiness';

test('Venezuela postal-source readiness records the UPU format reference while blocking lookup claims', () => {
  const readiness = buildVenezuelaPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:18:09.808Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, VENEZUELA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'VE');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{4}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('designated-operator-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateVenezuelaPostalSourceReadiness(readiness).valid, true);
});

test('Venezuela source-ingestion plan rejects mapping release before all evidence is recorded', () => {
  const safe = validateVenezuelaPostalSourceIngestionPlan({
    rawSnapshotStorage: 'external-nonpublic',
    rawRecordsBundled: false,
    allowMappingIngestion: false,
    mappingReuseTermsVerified: false,
    mappingVersion: null,
    coverageEvidenceRecorded: false,
    correctionPathRecorded: false,
  });
  assert.deepEqual(safe, []);
  const unsafe = validateVenezuelaPostalSourceIngestionPlan({
    rawSnapshotStorage: 'external-nonpublic',
    rawRecordsBundled: false,
    allowMappingIngestion: true,
    mappingReuseTermsVerified: false,
    mappingVersion: null,
    coverageEvidenceRecorded: false,
    correctionPathRecorded: false,
  });
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Venezuela readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 've', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildVenezuelaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateVenezuelaPostalSourceReadiness(committed).valid, true);
});
