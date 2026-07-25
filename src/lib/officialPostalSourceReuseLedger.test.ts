import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  assessOfficialPostalSourceReuseLedgerRecord,
  buildOfficialPostalSourceReuseLedger,
} from './officialPostalSourceReuseLedger';

test('records reviewed official-source reuse conditions without source payloads', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;
  const correos = ledger.records.find(record => record.sourceId === 'correos-postal-code-database')!;

  assert.equal(ledger.summary.sourceCount, 5);
  assert.equal(ledger.summary.metadataOnlyApprovedCount, 1);
  assert.equal(gisco.status, 'metadata-only-approved');
  assert.deepEqual(gisco.countryCodes, ['ES', 'PT']);
  assert.deepEqual(gisco.correctionPathEvidenceUrls, [
    'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
  ]);
  assert.equal(correos.status, 'terms-or-license-pending');
  assert.doesNotMatch(JSON.stringify(ledger), /postalCode|addressLine|latitude|longitude|privateKey|credential/i);
});

test('removes approval when the recorded review deadline has elapsed', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-10-22T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;

  assert.equal(gisco.status, 'not-approved');
});

test('marks a source renewal due before its review deadline and withholds approval', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-10-10T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;

  assert.equal(gisco.status, 'metadata-only-renewal-due');
  assert.equal(ledger.summary.metadataOnlyRenewalDueCount, 1);
});

test('withholds metadata-only approval when source evidence is malformed or retrieved in the future', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;

  const futureRetrieval = assessOfficialPostalSourceReuseLedgerRecord({
    ...gisco,
    retrievedAt: '2026-07-25T00:00:00.000Z',
  }, '2026-07-24T00:00:00.000Z');
  const missingCorrection = assessOfficialPostalSourceReuseLedgerRecord({
    ...gisco,
    correctionUrl: 'not-a-url',
  }, '2026-07-24T00:00:00.000Z');

  assert.equal(futureRetrieval.status, 'not-approved');
  assert.ok(futureRetrieval.blockers.includes('retrieval-time-invalid-or-future'));
  assert.equal(missingCorrection.status, 'not-approved');
  assert.ok(missingCorrection.blockers.includes('correction-url-missing-or-invalid'));
});

test('withholds metadata-only approval when the source scope has unresolved blockers', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;
  const assessment = assessOfficialPostalSourceReuseLedgerRecord({
    ...gisco,
    scopeBlockers: ['scope-status-coverage-review-required'],
  }, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'not-approved');
  assert.ok(assessment.blockers.includes('scope-scope-status-coverage-review-required'));
});

test('withholds metadata-only approval when a recorded retrieval is stale', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;
  const assessment = assessOfficialPostalSourceReuseLedgerRecord({
    ...gisco,
    retrievedAt: '2026-01-01T00:00:00.000Z',
  }, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'not-approved');
  assert.ok(assessment.blockers.includes('retrieval-time-stale'));
});

test('withholds metadata-only approval when aggregated correction evidence is missing', () => {
  const ledger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const gisco = ledger.records.find(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024')!;
  const assessment = assessOfficialPostalSourceReuseLedgerRecord({
    ...gisco,
    correctionPathEvidenceUrls: [],
  }, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'not-approved');
  assert.ok(assessment.blockers.includes('correction-path-evidence-missing'));
});
