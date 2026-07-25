import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION } from './addressValidationOfficialSourceEvidenceLedger';
import { buildAddressValidationOfficialSourcePortfolio } from './addressValidationOfficialSourcePortfolio';

function ledger(countryCode: string, sourceId: string, validUntil: string, rightsUrl = 'https://example.invalid/terms') {
  return {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode,
    records: [{
      sourceId,
      sourceVersion: '2026.07',
      sourceUrl: 'https://example.invalid/source',
      retrievedAt: '2026-07-20T00:00:00.000Z',
      validUntil,
      rightsUrl,
      correctionUrl: 'https://example.invalid/corrections',
    }],
  };
}

test('prioritizes country-level official-source blockers with reason metadata only', () => {
  const portfolio = buildAddressValidationOfficialSourcePortfolio([
    ledger('US', 'current-source', '2026-09-01T00:00:00.000Z'),
    ledger('GT', 'renewal-source', '2026-07-30T00:00:00.000Z'),
    ledger('GB', 'expired-source', '2026-07-22T00:00:00.000Z', 'not-a-url'),
    ledger('US', 'duplicate-source', '2026-09-01T00:00:00.000Z'),
  ], '2026-07-23T00:00:00.000Z');

  assert.deepEqual(portfolio.summary, {
    countryCount: 3,
    blockingCountryCount: 2,
    renewalDueCountryCount: 1,
    currentCountryCount: 0,
  });
  assert.deepEqual(portfolio.countries.map(country => [country.countryCode, country.priority]), [
    ['GB', 'blocking'],
    ['US', 'blocking'],
    ['GT', 'renewal-due'],
  ]);
  assert.ok(portfolio.countries[0]?.blockers.includes('rights-url-missing-or-invalid'));
  assert.ok(portfolio.countries[1]?.blockers.includes('duplicate-country-source-evidence-ledger'));
  const { nonClaim: _nonClaim, ...metadataOnlyPortfolio } = portfolio;
  assert.doesNotMatch(JSON.stringify(metadataOnlyPortfolio), /recipient|addressLine|latitude|BEGIN PUBLIC KEY/i);
});
