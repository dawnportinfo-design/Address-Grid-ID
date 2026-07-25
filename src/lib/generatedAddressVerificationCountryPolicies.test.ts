import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES } from './generatedAddressVerificationCountryPolicies';
import {
  DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES,
  getAddressVerificationTargetPolicy,
  isCountryEnabledForAddressVerification,
} from './addressVerificationEngine';

test('generated country policies cover every current AGID address-format country code conservatively', () => {
  assert.equal(Object.keys(GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES).length, 275);
  assert.equal(GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES.GT?.enabled, true);
  assert.equal(GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES.GT?.postalMode, 'format-and-lookup');
  assert.equal(GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES.PT?.postalMode, 'manual');
  assert.match(GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES.PT?.notes.join(' ') || '', /scope review/i);
});

test('generated policies extend but never replace curated country-specific controls', () => {
  assert.equal(isCountryEnabledForAddressVerification('GT'), true);
  assert.equal(getAddressVerificationTargetPolicy('GT')?.enabled, true);
  assert.equal(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES.AQ?.postalMode, 'geo-only');
  assert.match(DEFAULT_ADDRESS_VERIFICATION_TARGET_POLICIES.AQ?.notes.join(' ') || '', /station and natural-feature/i);
});
