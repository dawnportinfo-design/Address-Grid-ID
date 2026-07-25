import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { ESWATINI_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildEswatiniPostalSourceReadiness, validateEswatiniPostalSourceReadiness } from './eswatiniPostalSourceReadiness';

test('Eswatini postal-source readiness records official metadata while blocking postal claims', () => {
  const readiness = buildEswatiniPostalSourceReadiness({ evaluatedAt: '2026-07-23T07:52:09.489Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, ESWATINI_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'SZ');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('official-postcode-table-recorded')?.status, 'passed');
  for (const gateId of ['postal-format-authority-evidence', 'postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }
  assert.equal(validateEswatiniPostalSourceReadiness(readiness).valid, true);
});

test('Eswatini postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildEswatiniPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;
  assert.ok(validateEswatiniPostalSourceReadiness(readiness).errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Eswatini readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'sz', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildEswatiniPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validateEswatiniPostalSourceReadiness(committed).valid, true);
});
