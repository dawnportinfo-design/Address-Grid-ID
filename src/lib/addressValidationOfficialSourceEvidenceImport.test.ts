import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildAddressValidationOfficialSourceEvidenceImport,
  buildAddressValidationQualityReportFromOfficialSourceEvidenceImport,
} from './addressValidationOfficialSourceEvidenceImport';
import { buildOfficialPostalSourceReuseLedger } from './officialPostalSourceReuseLedger';

test('converts only current metadata-only-approved sources into country evidence ledgers', () => {
  const imported = buildAddressValidationOfficialSourceEvidenceImport(
    buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z'),
    '2026-07-24T00:00:00.000Z',
  );

  assert.deepEqual(imported.ledgers.map(ledger => ledger.countryCode), ['ES', 'PT']);
  assert.deepEqual(imported.ledgers.map(ledger => ledger.records[0]?.sourceId), [
    'eurostat-gisco-postal-code-points-2024',
    'eurostat-gisco-postal-code-points-2024',
  ]);
  assert.ok(imported.skippedSourceIds.includes('correos-postal-code-database'));
  assert.ok(imported.skippedSourceIds.includes('ctt-universal-service-information'));
  assert.deepEqual(imported.countryReadiness.map(readiness => [
    readiness.countryCode,
    readiness.priority,
    readiness.status,
    readiness.approvedSourceIds,
  ]), [
    ['EH', 'blocking', 'source-approval-pending', []],
    ['ES', 'normal', 'metadata-only-source-ready', ['eurostat-gisco-postal-code-points-2024']],
    ['PT', 'normal', 'metadata-only-source-ready', ['eurostat-gisco-postal-code-points-2024']],
    ['SJ', 'blocking', 'source-approval-pending', []],
  ]);
  assert.doesNotMatch(JSON.stringify(imported), /postalCode|addressLine|latitude|longitude|privateKey|credential/i);
});

test('does not trust a stale reuse-ledger status when the review deadline enters its renewal window', () => {
  const reuseLedger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const imported = buildAddressValidationOfficialSourceEvidenceImport({
    ...reuseLedger,
    records: reuseLedger.records.map(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024'
      ? { ...record, reviewBy: '2026-07-30T00:00:00.000Z' }
      : record),
  }, '2026-07-24T00:00:00.000Z');

  assert.deepEqual(imported.ledgers, []);
  assert.ok(imported.skippedSourceIds.includes('eurostat-gisco-postal-code-points-2024'));
});

test('reassesses retrieval freshness instead of trusting a stale approved ledger status', () => {
  const reuseLedger = buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z');
  const imported = buildAddressValidationOfficialSourceEvidenceImport({
    ...reuseLedger,
    records: reuseLedger.records.map(record => record.sourceId === 'eurostat-gisco-postal-code-points-2024'
      ? { ...record, retrievedAt: '2026-01-01T00:00:00.000Z' }
      : record),
  }, '2026-07-24T00:00:00.000Z');

  assert.deepEqual(imported.ledgers, []);
  assert.ok(imported.skippedSourceIds.includes('eurostat-gisco-postal-code-points-2024'));
});

test('attaches imported source provenance while forcing metadata-only postal and delivery gates to remain unmet', () => {
  const imported = buildAddressValidationOfficialSourceEvidenceImport(
    buildOfficialPostalSourceReuseLedger('2026-07-24T00:00:00.000Z'),
    '2026-07-24T00:00:00.000Z',
  );
  const report = buildAddressValidationQualityReportFromOfficialSourceEvidenceImport({
    countryCode: 'ES',
    officialEvidence: {
      format: true,
      postal: true,
      deliveryPoint: true,
      rights: true,
      version: true,
      freshness: true,
      correctionPath: true,
    },
    privacyBoundary: 'no-raw-address-storage',
    evaluatedAt: '2026-07-24T00:00:00.000Z',
  }, imported);

  assert.equal(report.officialSourceEvidence.sourceId, 'eurostat-gisco-postal-code-points-2024');
  assert.equal(report.officialSourceEvidence.status, 'fresh');
  assert.deepEqual(report.officialSourceEvidence.correctionPathEvidenceUrls, [
    'https://ec.europa.eu/eurostat/web/gisco/geodata/administrative-units/postal-codes',
  ]);
  assert.equal(report.publicationStatus, 'internal-only-evidence-incomplete');
  assert.ok(report.gateSummary.blockers.includes('official-postal'));
  assert.ok(report.gateSummary.blockers.includes('official-delivery-point'));
});
