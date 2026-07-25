import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { GEORGIA_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildGeorgiaPostalSourceReadiness, validateGeorgiaPostalSourceIngestionPlan, validateGeorgiaPostalSourceReadiness } from './georgiaPostalSourceReadiness';

test('Georgia postal-source readiness records authority surfaces without inferring a postcode format', () => {
  const readiness = buildGeorgiaPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:36:42.085Z' }); const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, GEORGIA_POSTAL_SOURCE_READINESS_SCHEMA_ID); assert.equal(readiness.countryCode, 'GE'); assert.equal(readiness.postalFormat.nationalPattern, null); assert.equal(readiness.realPostalLookupEnabled, false); assert.equal(gates.get('postal-authority-surfaces-recorded')?.status, 'passed'); assert.equal(gates.get('postal-mapping-reuse-rights')?.status, 'blocked'); assert.equal(validateGeorgiaPostalSourceReadiness(readiness).valid, true);
});
test('Georgia source-ingestion plan rejects address-bearing and cadastral fields without evidence', () => {
  assert.deepEqual(validateGeorgiaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: false, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'municipality_code'] }), []);
  const unsafe = validateGeorgiaPostalSourceIngestionPlan({ rawSnapshotStorage: 'external-nonpublic', rawRecordsBundled: false, allowMappingIngestion: true, mappingReuseTermsVerified: false, mappingVersion: null, mappingCurrent: false, coverageEvidenceRecorded: false, correctionPathRecorded: false, proposedColumns: ['postal_code', 'street_name', 'post_office_phone', 'cadastral_parcel', 'geometry'] });
  assert.ok(unsafe.includes('unsafe-column:street_name')); assert.ok(unsafe.includes('unsafe-column:post_office_phone')); assert.ok(unsafe.includes('unsafe-column:cadastral_parcel')); assert.ok(unsafe.includes('unsafe-column:geometry')); assert.ok(unsafe.includes('mapping-reuse-terms-not-verified')); assert.ok(unsafe.includes('mapping-version-not-recorded')); assert.ok(unsafe.includes('mapping-not-current')); assert.ok(unsafe.includes('mapping-coverage-not-recorded')); assert.ok(unsafe.includes('mapping-correction-path-not-recorded'));
});
test('checked-in Georgia readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ge', 'postal-source-readiness.json'); const committed = JSON.parse(await readFile(filePath, 'utf8')); assert.deepEqual(committed, buildGeorgiaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
});
