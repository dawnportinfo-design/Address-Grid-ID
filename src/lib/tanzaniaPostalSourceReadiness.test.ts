import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  TANZANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildTanzaniaPostalSourceReadiness,
  validateTanzaniaPostalSourceReadiness,
} from './tanzaniaPostalSourceReadiness';

test('Tanzania readiness verifies format only while blocking real postal claims', () => {
  const readiness = buildTanzaniaPostalSourceReadiness({ evaluatedAt: '2026-07-23T05:12:04.621Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, TANZANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'TZ');
  assert.equal(readiness.postalFormat.pattern, '^\\d{5}$');
  assert.equal(readiness.postalFormat.authorityVerified, true);
  assert.equal(readiness.postalFormat.verifiedFormatOnly, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'passed');
  assert.equal(gates.get('postcode-list-publication-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateTanzaniaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Tanzania readiness rejects an accidental lookup release', () => {
  const readiness = buildTanzaniaPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;

  const validation = validateTanzaniaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Tanzania readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'tz', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildTanzaniaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateTanzaniaPostalSourceReadiness(committed).valid, true);
});
