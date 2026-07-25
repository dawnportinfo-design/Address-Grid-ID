import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { PERU_POSTAL_SOURCE_READINESS_SCHEMA_ID, buildPeruPostalSourceReadiness, validatePeruPostalSourceReadiness } from './peruPostalSourceReadiness';

test('Peru postal-source readiness records format and reuse terms without enabling lookup claims', () => {
  const readiness = buildPeruPostalSourceReadiness({ evaluatedAt: '2026-07-23T08:00:09.627Z' });
  const gates = new Map(readiness.gates.map(gate => [gate.id, gate]));
  assert.equal(readiness.schemaId, PERU_POSTAL_SOURCE_READINESS_SCHEMA_ID);
  assert.equal(readiness.countryCode, 'PE');
  assert.equal(readiness.postalFormat.nationalPattern, '^[0-9]{5}$');
  assert.equal(readiness.realPostalLookupEnabled, false);
  assert.equal(gates.get('postal-format-authority-evidence')?.status, 'passed');
  assert.equal(gates.get('open-data-reuse-terms-recorded')?.status, 'passed');
  assert.equal(gates.get('open-data-general-contact-recorded')?.status, 'passed');
  assert.deepEqual(
    readiness.sources.find(source => source.sourceId === 'mtc-peru-postcode-open-data')?.documentation,
    {
      sourceUrl: 'https://www.datosabiertos.gob.pe/dataset/mtc-codigo-postal-peru',
      termsUrl: 'https://www.datosabiertos.gob.pe/dataset/mtc-codigo-postal-peru',
      correctionUrl: 'https://www.datosabiertos.gob.pe/datos-abiertos-0',
      correctionPathStatus: 'general-contact-only',
      reuseStatus: 'metadata-only-verified',
      verifiedAt: '2026-07-24T00:00:00.000Z',
    },
  );
  assert.equal(gates.get('postal-code-mapping-and-coverage-evidence')?.status, 'blocked');
  assert.equal(gates.get('version-freshness-and-correction-path')?.blocksRealPostalLookup, true);
  assert.equal(validatePeruPostalSourceReadiness(readiness).valid, true);
});

test('Peru postal-source readiness rejects an accidental lookup release', () => {
  const readiness = {
    ...buildPeruPostalSourceReadiness(),
    realPostalLookupEnabled: true,
  };
  assert.ok(validatePeruPostalSourceReadiness(
    readiness as unknown as Parameters<typeof validatePeruPostalSourceReadiness>[0],
  ).errors.includes('real-postal-lookup-enabled'));
});

test('checked-in Peru readiness artifact matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'pe', 'postal-source-readiness.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  assert.deepEqual(committed, buildPeruPostalSourceReadiness({ evaluatedAt: committed.evaluatedAt }));
  assert.equal(validatePeruPostalSourceReadiness(committed).valid, true);
});
