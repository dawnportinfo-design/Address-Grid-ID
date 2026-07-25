import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
  assessAddressValidationOfficialSourceEvidenceLedger,
} from './addressValidationOfficialSourceEvidenceLedger';

const currentRecord = {
  sourceId: 'official-postal-authority',
  sourceVersion: '2026.07',
  sourceUrl: 'https://example.invalid/source',
  retrievedAt: '2026-07-20T00:00:00.000Z',
  validUntil: '2026-09-01T00:00:00.000Z',
  rightsUrl: 'https://example.invalid/terms',
  correctionUrl: 'https://example.invalid/corrections',
};

test('keeps country source evidence current until its renewal lead window', () => {
  const assessment = assessAddressValidationOfficialSourceEvidenceLedger({
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode: 'uk',
    records: [currentRecord],
  }, '2026-07-23T00:00:00.000Z');

  assert.equal(assessment.countryCode, 'GB');
  assert.equal(assessment.status, 'current');
  assert.equal(assessment.records[0]?.status, 'current');
});

test('marks near-expiry evidence for renewal and blocks expired or malformed evidence', () => {
  const renewalDue = assessAddressValidationOfficialSourceEvidenceLedger({
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode: 'GT',
    records: [{ ...currentRecord, validUntil: '2026-07-30T00:00:00.000Z' }],
  }, '2026-07-23T00:00:00.000Z');
  assert.equal(renewalDue.status, 'renewal-due');
  assert.ok(renewalDue.nextActions.includes('refresh-official-source-evidence-before-the-recorded-expiry'));

  const blocked = assessAddressValidationOfficialSourceEvidenceLedger({
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
    countryCode: 'GT',
    records: [{ ...currentRecord, validUntil: '2026-07-22T00:00:00.000Z', sourceUrl: 'not-a-url', rightsUrl: 'not-a-url' }],
  }, '2026-07-23T00:00:00.000Z');
  assert.equal(blocked.status, 'blocked');
  assert.ok(blocked.blockers.includes('official-source-evidence-expired-or-invalid'));
  assert.ok(blocked.records[0].blockers.includes('source-url-missing-or-invalid'));
  assert.ok(blocked.records[0]?.blockers.includes('rights-url-missing-or-invalid'));
  assert.ok(blocked.records[0]?.blockers.includes('source-evidence-expired-or-invalid'));
});
