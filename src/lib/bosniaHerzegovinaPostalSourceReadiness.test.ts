import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { BOSNIA_HERZEGOVINA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildBosniaHerzegovinaPostalSourceReadiness, validateBosniaHerzegovinaPostalSourceIngestionPlan, validateBosniaHerzegovinaPostalSourceReadiness } from './bosniaHerzegovinaPostalSourceReadiness';

test('Bosnia and Herzegovina readiness records multi-operator authority without inferring a postcode format', () => {
  const readiness = buildBosniaHerzegovinaPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:18:40.967Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, BOSNIA_HERZEGOVINA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'BA');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('public-postal-operator-coordination-recorded')?.status, 'passed');
  assert.equal(gates.get('countrywide-multi-operator-coverage-and-correction')?.status, 'blocked');
  assert.equal(validateBosniaHerzegovinaPostalSourceReadiness(readiness).valid, true);
});

test('Bosnia and Herzegovina ingestion plan rejects postal-search and boundary fields without mapping evidence', () => {
  assert.deepEqual(validateBosniaHerzegovinaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'administrative_area_code'] }), []);
  const unsafe = validateBosniaHerzegovinaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'street_name', 'recipient_name', 'postal_office_phone', 'boundary_geometry'] });
  assert.ok(unsafe.includes('unsafe-column:street_name'));
  assert.ok(unsafe.includes('unsafe-column:recipient_name'));
  assert.ok(unsafe.includes('unsafe-column:postal_office_phone'));
  assert.ok(unsafe.includes('unsafe-column:boundary_geometry'));
  assert.ok(unsafe.includes('mapping-reuse-terms-not-verified'));
  assert.ok(unsafe.includes('mapping-version-not-recorded'));
  assert.ok(unsafe.includes('mapping-not-current'));
  assert.ok(unsafe.includes('mapping-coverage-not-recorded'));
  assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});

test('checked-in Bosnia and Herzegovina readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ba', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildBosniaHerzegovinaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
