import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { PARAGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildParaguayPostalSourceReadiness, validateParaguayPostalSourceReadiness, validateParaguayPostalSourceSchemaInspection } from './paraguayPostalSourceReadiness';

test('Paraguay postal-source readiness records format and licensed schema evidence without enabling lookup claims', () => {
  const readiness = buildParaguayPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:05:39.655Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, PARAGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'PY');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{6}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('open-data-reuse-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('source-schema-inspection-isolated')?.status, 'passed');
  assert.equal(gates.get('postal-code-mapping-and-coverage-evidence')?.status, 'blocked');
  assert.equal(validateParaguayPostalSourceReadiness(readiness).valid, true);
});

test('Paraguay source schema inspection permits administrative postal-zone columns but rejects precise-location fields', () => {
  const safe = validateParaguayPostalSourceSchemaInspection({
    columns: ['dpto', 'distrito', 'barloc', 'div_post', 'cod_post'],
    rawSnapshotStorage: 'external-nonpublic',
    rawSnapshotSha256: 'AC8D2303AEC3309D02BAC672D8DC789EA868B7D58159C11F0951362F6DEA588D',
    rawSnapshotBytes: 12261,
  });
  assert.deepEqual(safe, []);
  const unsafe = validateParaguayPostalSourceSchemaInspection({
    columns: ['dpto', 'distrito', 'barloc', 'div_post', 'cod_post', 'latitude'],
    rawSnapshotStorage: 'external-nonpublic',
    rawSnapshotSha256: 'AC8D2303AEC3309D02BAC672D8DC789EA868B7D58159C11F0951362F6DEA588D',
    rawSnapshotBytes: 12261,
  });
  assert.ok(unsafe.includes('unsafe-column:latitude'));
});

test('checked-in Paraguay readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'py', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildParaguayPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateParaguayPostalSourceReadiness(committed).valid, true);
});
