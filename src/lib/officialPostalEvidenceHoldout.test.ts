import assert from 'node:assert/strict';
import { test } from 'node:test';

import { runOfficialPostalEvidenceSyntheticHoldout } from './officialPostalEvidenceHoldout';

test('reports only aggregate outcomes for the synthetic official-evidence holdout', () => {
  const report = runOfficialPostalEvidenceSyntheticHoldout();

  assert.equal(report.summary.caseCount, 8);
  assert.equal(report.summary.expectedAccepted, 2);
  assert.equal(report.summary.expectedRejected, 6);
  assert.equal(report.summary.acceptancePrecision, 1);
  assert.equal(report.summary.acceptanceRecall, 1);
  assert.equal(report.summary.rejectionPrecision, 1);
  assert.equal(report.summary.rejectionRecall, 1);
  assert.equal(report.summary.allExpectationsMet, true);
  assert.equal(report.byFamily['blocked-scope'].caseCount, 2);
  assert.equal(report.byFamily['missing-metadata'].caseCount, 2);
  assert.equal(report.byCountry.PT.caseCount, 3);
  const aggregatePayload = JSON.stringify({ ...report, nonClaim: '' });
  assert.doesNotMatch(aggregatePayload, /postalCode|addressLine|latitude|longitude|sourceId|sourceUrl|credential/i);
});
