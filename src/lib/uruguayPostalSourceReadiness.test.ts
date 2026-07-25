import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { URUGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildUruguayPostalSourceReadiness, validateUruguayPostalSourceIngestionPlan, validateUruguayPostalSourceReadiness } from './uruguayPostalSourceReadiness';

test('Uruguay postal-source readiness records five-digit format and reuse terms while blocking lookup claims', () => {
  const readiness = buildUruguayPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:11:09.696Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, URUGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'UY');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{5}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('open-data-reuse-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('catalog-currentness-conflict')?.status, 'blocked');
  assert.equal(validateUruguayPostalSourceReadiness(readiness).valid, true);
});

test('Uruguay ingestion plan rejects a stale catalog resource and any public raw bundle', () => {
  const safe = validateUruguayPostalSourceIngestionPlan({
    catalogResourceReleaseDate: '2023-08-16',
    operationalServiceUpdatedAt: '2026-05-04',
    rawSnapshotStorage: 'external-nonpublic',
    rawRecordsBundled: false,
    allowIngestion: false,
  });
  assert.deepEqual(safe, []);
  const unsafe = validateUruguayPostalSourceIngestionPlan({
    catalogResourceReleaseDate: '2023-08-16',
    operationalServiceUpdatedAt: '2026-05-04',
    rawSnapshotStorage: 'external-nonpublic',
    rawRecordsBundled: false,
    allowIngestion: true,
  });
  assert.ok(unsafe.includes('stale-resource-ingestion-not-allowed'));
});

test('checked-in Uruguay readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'uy', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildUruguayPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateUruguayPostalSourceReadiness(committed).valid, true);
});
