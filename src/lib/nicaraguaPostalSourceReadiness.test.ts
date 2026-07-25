import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  NICARAGUA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildNicaraguaPostalSourceReadiness,
  validateNicaraguaPostalSourceReadiness,
} from './nicaraguaPostalSourceReadiness';

test('Nicaragua postal-source readiness records official metadata while blocking postal claims', () => {
  const readiness = buildNicaraguaPostalSourceReadiness({ evaluatedAt: '2026-07-23T07:23:13.595Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, NICARAGUA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'NI');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.formatAuthorityEvidence, false);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('official-postcode-query-interface-recorded')?.status, 'passed');
  assert.equal(gates.get('legal-and-administrative-geo-sources-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  assert.equal(validateNicaraguaPostalSourceReadiness(readiness).valid, true);
});

test('Nicaragua postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildNicaraguaPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;

  const validation = validateNicaraguaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Nicaragua readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ni', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildNicaraguaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateNicaraguaPostalSourceReadiness(committed).valid, true);
});
