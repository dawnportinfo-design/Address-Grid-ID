import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  EL_SALVADOR_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildElSalvadorPostalSourceReadiness,
  validateElSalvadorPostalSourceReadiness,
} from './elSalvadorPostalSourceReadiness';

test('El Salvador postal-source readiness records official metadata while blocking postal claims', () => {
  const readiness = buildElSalvadorPostalSourceReadiness({ evaluatedAt: '2026-07-23T09:00:00.000Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, EL_SALVADOR_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'SV');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-sources-recorded')?.status, 'passed');
  assert.equal(gates.get('administrative-geographic-source-recorded')?.status, 'passed');
  for (const gateId of ['postal-format-authority-evidence', 'postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }
  assert.equal(validateElSalvadorPostalSourceReadiness(readiness).valid, true);
});

test('El Salvador postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildElSalvadorPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;
  const validation = validateElSalvadorPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in El Salvador readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'sv', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildElSalvadorPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });
  assert.deepEqual(committed, expected);
  assert.equal(validateElSalvadorPostalSourceReadiness(committed).valid, true);
});
