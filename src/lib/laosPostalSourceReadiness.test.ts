import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  LAOS_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildLaosPostalSourceReadiness,
  validateLaosPostalSourceReadiness,
} from './laosPostalSourceReadiness';

test('Laos readiness rejects an unverified fixed postal pattern and blocks real claims', () => {
  const readiness = buildLaosPostalSourceReadiness({ evaluatedAt: '2026-07-23T03:52:02.272Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, LAOS_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'LA');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.authorityVerified, false);
  assert.equal(readiness.postalFormat.fixedLegacyPatternRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-postcode-page-recorded')?.status, 'passed');
  assert.equal(gates.get('postal-law-role-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateLaosPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Laos readiness rejects an accidental national format release', () => {
  const readiness = buildLaosPostalSourceReadiness();
  readiness.postalFormat.nationalPattern = '^\\d{5}$' as never;

  const validation = validateLaosPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('national-pattern-not-null'));
});

test('checked-in Laos readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'la', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildLaosPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateLaosPostalSourceReadiness(committed).valid, true);
});
