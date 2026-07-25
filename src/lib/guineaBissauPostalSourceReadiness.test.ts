import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { GUINEA_BISSAU_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildGuineaBissauPostalSourceReadiness, validateGuineaBissauPostalSourceReadiness } from './guineaBissauPostalSourceReadiness';

test('Guinea-Bissau postal-source readiness records a format without enabling lookup claims', () => {
  const readiness = buildGuineaBissauPostalSourceReadiness({ evaluatedAt: '2026-07-23T07:55:09.555Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, GUINEA_BISSAU_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'GW');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{4}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'passed');
  for (const gateId of ['postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }
  assert.equal(validateGuineaBissauPostalSourceReadiness(readiness).valid, true);
});

test('Guinea-Bissau postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildGuineaBissauPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;
  assert.ok(validateGuineaBissauPostalSourceReadiness(readiness).errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Guinea-Bissau readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'gw', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildGuineaBissauPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateGuineaBissauPostalSourceReadiness(committed).valid, true);
});
