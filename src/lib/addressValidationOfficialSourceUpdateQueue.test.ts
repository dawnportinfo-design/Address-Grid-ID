import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION } from './addressValidationOfficialSourceEvidenceLedger';
import { buildAddressValidationOfficialSourceUpdateQueue } from './addressValidationOfficialSourceUpdateQueue';

function ledger(countryCode: string, sourceId: string, validUntil: string) {
  return {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode,
    records: [{
      sourceId,
      sourceVersion: '2026.07',
      sourceUrl: 'https://example.invalid/source',
      retrievedAt: '2026-07-20T00:00:00.000Z',
      validUntil,
      rightsUrl: 'https://example.invalid/terms',
      correctionUrl: 'https://example.invalid/corrections',
    }],
  };
}

test('prioritizes blocked source evidence ahead of renewal-due countries without exposing source payloads', () => {
  const queue = buildAddressValidationOfficialSourceUpdateQueue([
    ledger('US', 'current-source', '2026-09-01T00:00:00.000Z'),
    ledger('GT', 'renewal-source', '2026-07-30T00:00:00.000Z'),
    ledger('GB', 'expired-source', '2026-07-22T00:00:00.000Z'),
  ], '2026-07-23T00:00:00.000Z');

  assert.equal(queue.countryCount, 3);
  assert.equal(queue.currentCountryCount, 1);
  assert.deepEqual(queue.items, [
    {
      countryCode: 'GB',
      priority: 'blocking',
      sourceIds: ['expired-source'],
      reason: 'official-source-evidence-expired-or-invalid',
    },
    {
      countryCode: 'GT',
      priority: 'renewal-due',
      sourceIds: ['renewal-source'],
      reason: 'official-source-evidence-renewal-window',
    },
  ]);
  assert.doesNotMatch(JSON.stringify(queue), /BEGIN PUBLIC KEY|addressLine|recipient/i);
});
