import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  PAKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildPakistanPostalSourceReadiness,
  validatePakistanPostalSourceReadiness,
} from './pakistanPostalSourceReadiness';

test('Pakistan readiness records its post-code directory as metadata only and blocks real claims', () => {
  const readiness = buildPakistanPostalSourceReadiness({ evaluatedAt: '2026-07-23T04:52:04.354Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, PAKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'PK');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.authorityVerified, false);
  assert.equal(readiness.postalFormat.fixedLegacyPatternRejected, true);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-directory-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validatePakistanPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Pakistan readiness rejects an accidental national format release', () => {
  const readiness = buildPakistanPostalSourceReadiness();
  readiness.postalFormat.nationalPattern = '^\\d{5}$' as never;

  const validation = validatePakistanPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('national-pattern-not-null'));
});

test('checked-in Pakistan readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'pk', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildPakistanPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validatePakistanPostalSourceReadiness(committed).valid, true);
});
