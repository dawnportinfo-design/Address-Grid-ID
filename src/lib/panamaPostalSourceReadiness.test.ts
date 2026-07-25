import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  PANAMA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildPanamaPostalSourceReadiness,
  validatePanamaPostalSourceReadiness,
} from './panamaPostalSourceReadiness';

test('Panama postal-source readiness records official metadata while blocking postal claims', () => {
  const readiness = buildPanamaPostalSourceReadiness({ evaluatedAt: '2026-07-23T07:44:09.328Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, PANAMA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'PA');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('official-postcode-system-recorded')?.status, 'passed');
  for (const gateId of ['postal-format-authority-evidence', 'postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }
  assert.equal(validatePanamaPostalSourceReadiness(readiness).valid, true);
});

test('Panama postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildPanamaPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;
  const validation = validatePanamaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Panama readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'pa', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildPanamaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });
  assert.deepEqual(committed, expected);
  assert.equal(validatePanamaPostalSourceReadiness(committed).valid, true);
});
