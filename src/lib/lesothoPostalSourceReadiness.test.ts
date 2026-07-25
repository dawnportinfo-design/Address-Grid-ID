import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { LESOTHO_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildLesothoPostalSourceReadiness, validateLesothoPostalSourceReadiness } from './lesothoPostalSourceReadiness';

test('Lesotho postal-source readiness records official metadata while blocking postal claims', () => {
  const readiness = buildLesothoPostalSourceReadiness({ evaluatedAt: '2026-07-23T07:48:56.558Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, LESOTHO_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'LS');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-service-and-regulatory-sources-recorded')?.status, 'passed');
  for (const gateId of ['postal-format-authority-evidence', 'postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }
  assert.equal(validateLesothoPostalSourceReadiness(readiness).valid, true);
});

test('Lesotho postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildLesothoPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;
  assert.ok(validateLesothoPostalSourceReadiness(readiness).errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Lesotho readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ls', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildLesothoPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateLesothoPostalSourceReadiness(committed).valid, true);
});
