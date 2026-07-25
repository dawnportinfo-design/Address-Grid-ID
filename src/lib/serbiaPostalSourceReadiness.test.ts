import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { SERBIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildSerbiaPostalSourceReadiness, validateSerbiaPostalSourceIngestionPlan, validateSerbiaPostalSourceReadiness } from './serbiaPostalSourceReadiness';

test('Serbia postal-source readiness records authority surfaces without inferring a postcode format', () => {
  const readiness = buildSerbiaPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:31:11.513Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, SERBIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'RS');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.unverifiedFormatInferenceRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('addressing-and-pak-service-bounded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateSerbiaPostalSourceReadiness(readiness).valid, true);
});

test('Serbia source-ingestion plan rejects PAK, address-bearing, cadastral, and geometry fields', () => {
  assert.deepEqual(validateSerbiaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'municipality_code'] }), []);
  const unsafe = validateSerbiaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'postal_address_code', 'street_name', 'post_office_phone', 'cadastral_parcel', 'geometry'] });
  assert.ok(unsafe.includes('unsafe-column:postal_address_code'));
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

test('checked-in Serbia readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'rs', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildSerbiaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
