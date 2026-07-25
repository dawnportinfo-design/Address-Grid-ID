import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { KYRGYZSTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildKyrgyzstanPostalSourceReadiness, validateKyrgyzstanPostalSourceIngestionPlan, validateKyrgyzstanPostalSourceReadiness } from './kyrgyzstanPostalSourceReadiness';

test('Kyrgyzstan postal-source readiness rejects an inferred format while blocking lookup claims', () => {
  const readiness = buildKyrgyzstanPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:30:10.014Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, KYRGYZSTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'KG');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.unverifiedFormatInferenceRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'blocked');
  assert.equal(validateKyrgyzstanPostalSourceReadiness(readiness).valid, true);
});

test('Kyrgyzstan source-ingestion plan rejects unsafe location fields and incomplete mapping evidence', () => {
  assert.deepEqual(validateKyrgyzstanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'admin_code'] }), []);
  const unsafe = validateKyrgyzstanPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'geometry'] });
  assert.ok(unsafe.includes('unsafe-column:geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Kyrgyzstan readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'kg', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildKyrgyzstanPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
