import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  POSTAL_SOURCE_SCOPE_LEDGER,
  assessPostalSourceScopeLedgerEntry,
} from './postalSourceScopeLedger';

test('records source rights and scope gates without importing any postal or address records', () => {
  const assessments = POSTAL_SOURCE_SCOPE_LEDGER.map(entry => assessPostalSourceScopeLedgerEntry(
    entry,
    '2026-07-24T00:00:00.000Z',
  ));

  assert.deepEqual(assessments.map(assessment => [assessment.countryCode, assessment.status]), [
    ['ES', 'metadata-only-source-ready'],
    ['PT', 'metadata-only-source-ready'],
    ['SJ', 'blocked'],
    ['EH', 'blocked'],
  ]);
  assert.deepEqual(assessments[0]?.approvedSourceIds, ['eurostat-gisco-postal-code-points-2024']);
  assert.ok(assessments[2]?.blockers.some(blocker => blocker.includes('terms-review-required')));
  assert.ok(assessments[3]?.blockers.some(blocker => blocker.includes('no-neutral-operator-dataset')));
  assert.doesNotMatch(JSON.stringify(POSTAL_SOURCE_SCOPE_LEDGER), /addressLine|recipientData|latitude|BEGIN PUBLIC KEY/i);
});

test('expires source approval at the recorded review date', () => {
  const spain = POSTAL_SOURCE_SCOPE_LEDGER.find(entry => entry.countryCode === 'ES')!;
  const assessment = assessPostalSourceScopeLedgerEntry(spain, '2026-10-22T00:00:00.000Z');

  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.some(blocker => blocker.includes('review-expired')));
});

test('does not approve a source whose retrieval is stale despite a future review date', () => {
  const spain = structuredClone(POSTAL_SOURCE_SCOPE_LEDGER.find(entry => entry.countryCode === 'ES')!);
  spain.sources[0]!.retrievedAt = '2026-01-01T00:00:00.000Z';
  const assessment = assessPostalSourceScopeLedgerEntry(spain, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.approvedSourceIds, []);
  assert.ok(assessment.blockers.some(blocker => blocker.includes('retrieval-stale')));
});

test('does not approve duplicate source identifiers', () => {
  const spain = structuredClone(POSTAL_SOURCE_SCOPE_LEDGER.find(entry => entry.countryCode === 'ES')!);
  spain.sources.push(structuredClone(spain.sources[0]!));
  const assessment = assessPostalSourceScopeLedgerEntry(spain, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'blocked');
  assert.deepEqual(assessment.approvedSourceIds, []);
  assert.ok(assessment.blockers.some(blocker => blocker.includes('id-duplicate')));
});

test('requires a timezone-qualified assessment time', () => {
  const spain = POSTAL_SOURCE_SCOPE_LEDGER.find(entry => entry.countryCode === 'ES')!;
  const assessment = assessPostalSourceScopeLedgerEntry(spain, '2026-07-24');

  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.includes('checked-at-invalid'));
});

test('requires a public evidence record for a source-specific correction path', () => {
  const spain = structuredClone(POSTAL_SOURCE_SCOPE_LEDGER.find(entry => entry.countryCode === 'ES')!);
  delete spain.sources[0]!.correctionPathEvidenceUrl;
  const assessment = assessPostalSourceScopeLedgerEntry(spain, '2026-07-24T00:00:00.000Z');

  assert.equal(assessment.status, 'blocked');
  assert.ok(assessment.blockers.some(blocker => blocker.includes('correction-path-evidence-missing')));
});
