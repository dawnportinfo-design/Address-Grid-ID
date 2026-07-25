import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  CAMBODIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildCambodiaPostalSourceReadiness,
  validateCambodiaPostalSourceReadiness,
} from './cambodiaPostalSourceReadiness';

test('Cambodia readiness rejects an unverified fixed postal pattern and blocks real claims', () => {
  const readiness = buildCambodiaPostalSourceReadiness({ evaluatedAt: '2026-07-23T03:32:01.936Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, CAMBODIA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'KH');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.authorityVerified, false);
  assert.equal(readiness.postalFormat.fixedLegacyPatternRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-recorded')?.status, 'passed');
  assert.equal(gates.get('government-operator-relationship-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateCambodiaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Cambodia readiness rejects an accidental national format release', () => {
  const readiness = buildCambodiaPostalSourceReadiness();
  readiness.postalFormat.nationalPattern = '^\\d{6}$' as never;

  const validation = validateCambodiaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('national-pattern-not-null'));
});

test('checked-in Cambodia readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'kh', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildCambodiaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateCambodiaPostalSourceReadiness(committed).valid, true);
});
