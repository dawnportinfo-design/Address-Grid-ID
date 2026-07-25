import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  NEPAL_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildNepalPostalSourceReadiness,
  validateNepalPostalSourceReadiness,
} from './nepalPostalSourceReadiness';

test('Nepal readiness records official publication surfaces while blocking real postal claims', () => {
  const readiness = buildNepalPostalSourceReadiness({ evaluatedAt: '2026-07-23T04:32:04.132Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, NEPAL_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'NP');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.authorityVerified, false);
  assert.equal(readiness.postalFormat.fixedLegacyPatternRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('national-postal-code-publication-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-code-update-and-change-surfaces-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateNepalPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Nepal readiness rejects an accidental national format release', () => {
  const readiness = buildNepalPostalSourceReadiness();
  readiness.postalFormat.nationalPattern = '^\\d{5}$' as never;

  const validation = validateNepalPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('national-pattern-not-null'));
});

test('checked-in Nepal readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'np', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildNepalPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateNepalPostalSourceReadiness(committed).valid, true);
});
