import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  HONDURAS_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildHondurasPostalSourceReadiness,
  validateHondurasPostalSourceReadiness,
} from './hondurasPostalSourceReadiness';

test('Honduras postal-source readiness records official metadata while blocking postal claims', () => {
  const readiness = buildHondurasPostalSourceReadiness({ evaluatedAt: '2026-07-23T07:23:13.595Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, HONDURAS_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'HN');
  assert.equal(readiness.postalFormat.nationalPattern, null);
  assert.equal(readiness.postalFormat.formatAuthorityEvidence, false);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('postal-operator-source-recorded')?.status, 'passed');
  assert.equal(gates.get('administrative-and-geoportal-sources-recorded')?.status, 'passed');

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  assert.equal(validateHondurasPostalSourceReadiness(readiness).valid, true);
});

test('Honduras postal-source readiness rejects an accidental lookup release', () => {
  const readiness = buildHondurasPostalSourceReadiness();
  (readiness as unknown as { realPostalLookupEnabled: boolean }).realPostalLookupEnabled = true;

  const validation = validateHondurasPostalSourceReadiness(readiness);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Honduras readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'hn', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildHondurasPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateHondurasPostalSourceReadiness(committed).valid, true);
});
