import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  GUATEMALA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
  buildGuatemalaPostalSourceReadiness,
  validateGuatemalaPostalSourceReadiness,
} from './guatemalaPostalSourceReadiness';

test('Guatemala postal-source readiness keeps real lookup and delivery claims blocked', () => {
  const readiness = buildGuatemalaPostalSourceReadiness({ evaluatedAt: '2026-07-23T01:51:59.289Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));

  assert.equal(readiness.schemaId, GUATEMALA_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'GT');
  assert.equal(readiness.postalFormat.pattern, '^\\d{5}$');
  assert.equal(readiness.postalFormat.verifiedFormatOnly, true);
  assert.equal(readiness.containsPersonalData, false);
  assert.equal(readiness.containsRawThirdPartyData, false);
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(readiness.deliveryClaimEnabled, false);
  assert.equal(gates.get('country-specific-populated-place-source-recorded')?.status, 'passed');
  assert.equal(gates.get('populated-place-metadata-reuse-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('populated-place-metadata-general-contact-recorded')?.status, 'passed');
  assert.equal(gates.get('licensed-international-postcode-candidate-recorded')?.status, 'passed');
  assert.deepEqual(
    readiness.sources.find(source => source.sourceId === 'gt-ine-censo-2018-lugares-poblados')?.documentation,
    {
      sourceUrl: 'https://datos.ine.gob.gt/es/dataset/censo-2018-lugares-poblados',
      termsUrl: 'https://datos.ine.gob.gt/es/dataset/censo-2018-lugares-poblados',
      correctionUrl: 'https://www.ine.gob.gt/contactenos/',
      correctionPathStatus: 'general-contact-only',
      reuseStatus: 'metadata-only-verified',
      verifiedAt: '2026-07-24T00:00:00.000Z',
    },
  );
  assert.equal(
    readiness.sources.find(source => source.sourceId === 'upu-universal-postcode-database')?.redistributionStatus,
    'license-review-required',
  );

  for (const gateId of [
    'postal-authority-and-jurisdiction-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    assert.equal(gates.get(gateId)?.status, 'blocked');
    assert.equal(gates.get(gateId)?.blocksRealPostalLookup, true);
  }

  const validation = validateGuatemalaPostalSourceReadiness(readiness);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('Guatemala postal-source readiness rejects an accidental lookup release', () => {
  const readiness = {
    ...buildGuatemalaPostalSourceReadiness(),
    realPostalLookupEnabled: true,
  };

  const validation = validateGuatemalaPostalSourceReadiness(
    readiness as unknown as Parameters<typeof validateGuatemalaPostalSourceReadiness>[0],
  );
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Guatemala readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'gt', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildGuatemalaPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validateGuatemalaPostalSourceReadiness(committed).valid, true);
});
