import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  MYANMAR_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildMyanmarPostalSourceReadiness,
  validateMyanmarPostalSourceReadiness,
} from './myanmarPostalSourceReadiness';

test('Myanmar readiness rejects an unverified fixed postal pattern and blocks real claims', () => {
  const readiness = buildMyanmarPostalSourceReadiness({ evaluatedAt: '2026-07-23T04:12:03.184Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, MYANMAR_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'MM');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.authorityVerified, false);
  assert.equal(readiness.postalFormat.fixedLegacyPatternRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-search-recorded')?.status, 'passed');
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

  const validation = validateMyanmarPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Myanmar readiness rejects an accidental national format release', () => {
  const readiness = buildMyanmarPostalSourceReadiness();
  readiness.postalFormat.nationalPattern = '^\\d{5}$' as never;

  const validation = validateMyanmarPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('national-pattern-not-null'));
});

test('checked-in Myanmar readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'mm', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildMyanmarPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateMyanmarPostalSourceReadiness(committed).valid, true);
});
