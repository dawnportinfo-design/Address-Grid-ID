import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  KENYA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildKenyaPostalSourceReadiness,
  validateKenyaPostalSourceReadiness,
} from './kenyaPostalSourceReadiness';

test('Kenya postal-source readiness keeps real lookup and delivery claims blocked', () => {
  const readiness = buildKenyaPostalSourceReadiness({ evaluatedAt: '2026-07-23T03:12:01.634Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, KENYA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'KE');
  assert.equal(readiness.postalFormat.pattern, '^\\d{5}$');
  assert.equal(readiness.containsPersonalData, false);
  assert.equal(readiness.containsRawThirdPartyData, false);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-locator-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateKenyaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Kenya postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildKenyaPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;

  const validation = validateKenyaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Kenya readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ke', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildKenyaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateKenyaPostalSourceReadiness(committed).valid, true);
});
