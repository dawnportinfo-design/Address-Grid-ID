import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { TURKMENISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildTurkmenistanPostalSourceReadiness, validateTurkmenistanPostalSourceIngestionPlan, validateTurkmenistanPostalSourceReadiness } from './turkmenistanPostalSourceReadiness';

test('Turkmenistan postal-source readiness rejects an inferred format while blocking lookup claims', () => {
  const readiness = buildTurkmenistanPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:38:10.171Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, TURKMENISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'TM');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-law-and-privacy-boundary-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(validateTurkmenistanPostalSourceReadiness(readiness).valid, true);
});

test('Turkmenistan source-ingestion plan rejects unsafe location fields and incomplete mapping evidence', () => {
  assert.deepEqual(validateTurkmenistanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'admin_code'] }), []);
  const unsafe = validateTurkmenistanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'cadastral_geometry'] });
  assert.ok(unsafe.includes('unsafe-column:cadastral_geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Turkmenistan readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'tm', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildTurkmenistanPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
