import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { ALBANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildAlbaniaPostalSourceReadiness, validateAlbaniaPostalSourceIngestionPlan, validateAlbaniaPostalSourceReadiness } from './albaniaPostalSourceReadiness';

test('Albania postal-source readiness records official authority and restrictive geospatial terms without inferring a postcode format', () => {
  const readiness = buildAlbaniaPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:13:40.614Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, ALBANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'AL');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('administrative-sources-and-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked');
  assert.equal(validateAlbaniaPostalSourceReadiness(readiness).valid, true);
});

test('Albania source-ingestion plan rejects address-bearing and boundary geometry fields without mapping evidence', () => {
  assert.deepEqual(validateAlbaniaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'municipality_code'] }), []);
  const unsafe = validateAlbaniaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'address_system_id', 'cadastral_parcel', 'boundary_geometry'] });
  assert.ok(unsafe.includes('unsafe-column:address_system_id'));
  assert.ok(unsafe.includes('unsafe-column:cadastral_parcel'));
  assert.ok(unsafe.includes('unsafe-column:boundary_geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-not-current'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Albania readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'al', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildAlbaniaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
