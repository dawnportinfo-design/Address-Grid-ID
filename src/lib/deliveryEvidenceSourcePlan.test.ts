import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildDeliveryEvidenceSourcePlan } from './deliveryEvidenceSourcePlan';

test('plans USPS as a credentialed authoritative delivery-point source without collecting addresses', () => {
  const plan = buildDeliveryEvidenceSourcePlan('US');

  assert.equal(plan.status, 'official-delivery-source-available');
  assert.equal(plan.capturePolicy, 'metadata-only-no-raw-address-storage');
  assert.deepEqual(plan.sources.map(source => source.id), ['usps-web-tools']);
  assert.equal(plan.sources[0]?.requiresCredential, true);
  assert.equal(plan.sources[0]?.activationStatus, 'blocked-pending-source-metadata');
  assert.deepEqual(plan.sources[0]?.missingMetadataGates, [
    'terms-url',
    'correction-url',
    'version',
    'coverage',
    'evidence-expiry',
  ]);
  assert.ok(plan.sources[0]?.requirements.includes('obtain-and-isolate-provider-credentials-in-a-deployment-secret-store'));
});

test('keeps licensed delivery-point sources behind explicit license gates', () => {
  const plan = buildDeliveryEvidenceSourcePlan('GB');

  assert.equal(plan.status, 'official-delivery-source-available');
  assert.deepEqual(plan.sources.map(source => source.id), ['royal-mail-paf']);
  assert.ok(plan.sources[0]?.requirements.includes('obtain-explicit-license-for-the-intended-use-before-enabling'));
  assert.ok(plan.blockers.includes('delivery-source-candidates-require-terms-correction-version-coverage-and-expiry-evidence-before-enablement'));
  assert.ok(plan.nextActions.includes('obtain-source-specific-credentials-only-after-the-source-metadata-gates-pass'));
});

test('does not turn an address-level catalog source into a delivery-point claim', () => {
  const plan = buildDeliveryEvidenceSourcePlan('JP');

  assert.equal(plan.status, 'no-authoritative-delivery-source-cataloged');
  assert.ok(plan.blockers.includes('no-authoritative-delivery-point-source-cataloged'));
  assert.ok(plan.nextActions.includes('do-not-claim-delivery-point-or-carrier-deliverability'));
});
