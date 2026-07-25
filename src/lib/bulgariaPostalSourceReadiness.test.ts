import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { BULGARIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildBulgariaPostalSourceReadiness, validateBulgariaPostalSourceIngestionPlan, validateBulgariaPostalSourceReadiness } from './bulgariaPostalSourceReadiness';

test('Bulgaria postal-source readiness records authority references without inferring a postcode format', () => {
  const readiness = buildBulgariaPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:06:40.554Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, BULGARIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'BG');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.unverifiedFormatInferenceRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-code-system-and-index-catalog-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateBulgariaPostalSourceReadiness(readiness).valid, true);
});

test('Bulgaria source-ingestion plan rejects address-bearing and cadastral fields without evidence', () => {
  assert.deepEqual(validateBulgariaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'municipality_code'] }), []);
  const unsafe = validateBulgariaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'post_office_address', 'cadastral_parcel', 'geometry'] });
  assert.ok(unsafe.includes('unsafe-column:post_office_address'));
  assert.ok(unsafe.includes('unsafe-column:cadastral_parcel'));
  assert.ok(unsafe.includes('unsafe-column:geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-not-current'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Bulgaria readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'bg', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildBulgariaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
