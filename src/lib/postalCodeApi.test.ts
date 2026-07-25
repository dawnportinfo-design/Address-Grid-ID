import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getPostalCodeApiCapabilities,
  getPostalCodeApiProfile,
  POSTAL_CODE_API_PROFILES,
  POSTAL_CODE_API_SYNTHETIC_TEST_VECTORS,
  validatePostalCodeApiFormat,
} from './postalCodeApi';

test('postal code API covers the requested mature, restricted, and neutrality-gated jurisdictions', () => {
  assert.equal(POSTAL_CODE_API_PROFILES.length, 34);
  assert.equal(POSTAL_CODE_API_PROFILES.filter(profile => profile.cohort === 'mature-system').length, 19);
  assert.equal(POSTAL_CODE_API_PROFILES.filter(profile => profile.cohort === 'restricted-source').length, 6);
  assert.equal(POSTAL_CODE_API_PROFILES.filter(profile => profile.cohort === 'neutrality-gated').length, 9);
  assert.equal(getPostalCodeApiProfile('cl_ea')?.publicationStatus, 'metadata-only');
  assert.equal(getPostalCodeApiProfile('EH')?.publicationStatus, 'withheld');
});

test('postal code API emits a format-only result without echoing the submitted code', () => {
  const result = validatePostalCodeApiFormat({
    jurisdictionId: 'pt',
    postalCode: '0000-000',
    formatRegex: '^\\d{4}-\\d{3}$',
  });

  assert.equal(result.status, 'valid-format');
  assert.equal(result.validationLevel, 'syntax-only');
  assert.equal(result.formatMatched, true);
  assert.equal(result.lookupPerformed, false);
  assert.equal(result.deliveryConfirmed, false);
  assert.equal(result.storesPostalCode, false);
  assert.equal(JSON.stringify(result).includes('0000-000'), false);
});

test('postal code API rejects a partial regex match as invalid format', () => {
  const result = validatePostalCodeApiFormat({
    jurisdictionId: 'PT',
    postalCode: 'prefix-0000-suffix',
    formatRegex: '\\d{4}',
  });

  assert.equal(result.status, 'invalid-format');
  assert.equal(result.validationLevel, 'syntax-only');
  assert.equal(result.formatMatched, false);
});

test('restricted-source jurisdictions remain format-only and no parent format is inherited for CL special areas', () => {
  const restricted = validatePostalCodeApiFormat({
    jurisdictionId: 'CN',
    postalCode: '000000',
    formatRegex: '^\\d{6}$',
  });
  const parentReview = validatePostalCodeApiFormat({
    jurisdictionId: 'CL-EA',
    postalCode: '0000000',
    formatRegex: '^\\d{7}$',
  });

  assert.equal(restricted.status, 'valid-format');
  assert.ok(restricted.warnings.includes('restricted-source-jurisdiction-format-only'));
  assert.equal(parentReview.status, 'metadata-only');
  assert.equal(parentReview.validationLevel, 'not-performed');
  assert.equal(parentReview.formatMatched, null);
});

test('neutrality-gated jurisdictions do not expose format validation', () => {
  const result = validatePostalCodeApiFormat({
    jurisdictionId: 'EH',
    postalCode: '00000',
    formatRegex: '^\\d{5}$',
  });

  assert.equal(result.status, 'guarded');
  assert.equal(result.validationLevel, 'not-performed');
  assert.equal(result.formatMatched, null);
  assert.ok(result.warnings.includes('neutrality-and-source-review-required'));
});

test('capabilities state the non-storage and non-replication boundaries', () => {
  const capabilities = getPostalCodeApiCapabilities();

  assert.equal(capabilities.inputBoundary.rawAddressAccepted, false);
  assert.equal(capabilities.outputBoundary.officialDataReplicated, false);
  assert.equal(capabilities.syntheticTestVectors.containsAddressData, false);
  assert.equal(POSTAL_CODE_API_SYNTHETIC_TEST_VECTORS.length, 4);
});
