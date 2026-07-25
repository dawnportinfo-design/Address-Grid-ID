import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  UGANDA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildUgandaPostalSourceReadiness,
  validateUgandaPostalSourceReadiness,
} from './ugandaPostalSourceReadiness';

test('Uganda readiness records postal-address metadata while rejecting a legacy postal regex', () => {
  const readiness = buildUgandaPostalSourceReadiness({ evaluatedAt: '2026-07-23T05:32:05.143Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, UGANDA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'UG');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.authorityVerified, false);
  assert.equal(readiness.postalFormat.fixedLegacyPatternRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-address-service-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateUgandaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Uganda readiness rejects an accidental national format release', () => {
  const readiness = buildUgandaPostalSourceReadiness();
  readiness.postalFormat.nationalPattern = '^\\d{5}$' as never;

  const validation = validateUgandaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('national-pattern-not-null'));
});

test('checked-in Uganda readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'ug', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildUgandaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateUgandaPostalSourceReadiness(committed).valid, true);
});
