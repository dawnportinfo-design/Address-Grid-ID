import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildVeygritIdAccount,
  buildVeygritIdAuthorizationRequest,
  buildVeygritIdConsentGrant,
  buildVeygritIdIntegrationPlan,
  buildVeygritIdPartnerApplication,
  validateVeygritIdGrant,
} from './veygritId';

test('Veygrit ID issues a reviewed address-fill grant for an approved EC partner', () => {
  const account = buildVeygritIdAccount({
    displayAlias: 'traveler-user',
    loginProviders: ['google', 'apple', 'email'],
    primaryProvider: 'google',
    emailVerified: true,
    mfaEnabled: true,
    locale: 'ja-JP',
    countryCode: 'JP',
    basicProfileCommitment: 'profile_basic_commitment',
    travelProfileCommitment: 'profile_travel_commitment',
    passportNameCommitment: 'passport_name_commitment',
    addresses: [
      {
        addressId: 'HOME-JP',
        kind: 'home',
        ownerRelationship: 'self',
        countryCode: 'JP',
        language: 'ja-JP',
        addressCommitment: 'address_commitment_home',
        agidCommitment: 'agid_commitment_home',
        aoidCommitment: 'aoid_commitment_home',
        qualityDecision: 'verified',
      },
    ],
  });
  const partner = buildVeygritIdPartnerApplication({
    legalName: 'Example Shop Inc.',
    displayName: 'Example Shop',
    siteCategory: 'ec',
    domains: ['example-shop.com'],
    verifiedDomains: ['example-shop.com'],
    requestedScopes: ['profile.basic', 'address.shipping', 'contact.phone', 'locale'],
    privacyPolicyUrl: 'https://example-shop.com/privacy',
    termsUrl: 'https://example-shop.com/terms',
    businessVerified: true,
    kybVerified: true,
    contentReviewed: true,
    fraudReviewPassed: true,
    privacyPolicyReviewed: true,
    securityReviewed: true,
    httpsOnly: true,
    dataRetentionDays: 30,
    apiKeyIssued: true,
    clientId: 'vg_client_example_shop',
    redirectUris: ['https://example-shop.com/veygrit/callback'],
  });
  const request = buildVeygritIdAuthorizationRequest({
    clientId: 'vg_client_example_shop',
    origin: 'https://example-shop.com',
    redirectUri: 'https://example-shop.com/veygrit/callback',
    requestedScopes: ['profile.basic', 'address.shipping', 'contact.phone', 'locale'],
    purpose: 'checkout-address-autofill',
    state: 'state-token-001',
    nonce: 'nonce-token-001',
    createdAt: '2026-06-20T00:00:00.000Z',
    expiresAt: '2026-06-20T00:10:00.000Z',
    userLoggedIn: true,
    reauthenticatedAt: '2026-06-20T00:00:30.000Z',
  });
  const grant = buildVeygritIdConsentGrant({
    account,
    partner,
    request,
    now: '2026-06-20T00:01:00.000Z',
    consent: {
      approvedScopes: ['profile.basic', 'address.shipping', 'contact.phone', 'locale'],
      selectedAddressId: account.addresses[0].addressId,
      userConfirmed: true,
      consentedAt: '2026-06-20T00:01:00.000Z',
    },
  });

  assert.equal(account.errors.length, 0);
  assert.equal(partner.status, 'approved');
  assert.equal(grant.status, 'ready-to-fill');
  assert.equal(grant.nextAction, 'post-sealed-claims');
  assert.deepEqual(grant.approvedScopes, ['profile.basic', 'address.shipping', 'contact.phone', 'locale']);
  assert.ok(grant.claimKinds.includes('shipping-address'));
  assert.equal(grant.sealedClaimEnvelope.loggedPlaintext, false);
  assert.equal(grant.sealedClaimEnvelope.containsPlaintextForRecipientOnly, true);
  assert.equal(validateVeygritIdGrant(grant).ok, true);
});

test('Veygrit ID requires reviewed legal entities and rejects personal or anonymous embed sites', () => {
  const partner = buildVeygritIdPartnerApplication({
    legalName: 'Anonymous personal checkout',
    siteCategory: 'personal-site',
    domains: ['personal.example'],
    verifiedDomains: ['personal.example'],
    requestedScopes: ['address.shipping'],
    businessVerified: false,
    anonymousOperator: true,
    httpsOnly: true,
  });

  assert.equal(partner.status, 'rejected');
  assert.ok(partner.errors.includes('partner-category-not-eligible-for-veygrit-id'));
  assert.equal(partner.apiKeyIssued, false);
  assert.equal(partner.privacy.exposesPersonalAddressData, false);
});

test('Veygrit ID account stores only self address commitments and rejects raw private material', () => {
  const account = buildVeygritIdAccount({
    loginProviders: ['email'],
    passportNumber: 'AB1234567',
    rawEmail: 'alice@example.com',
    addresses: [
      {
        kind: 'home',
        ownerRelationship: 'family',
        rawAddress: '1-1 Chiyoda Tokyo',
        addressCommitment: 'address_commitment_family',
      },
    ],
  });

  assert.ok(account.errors.includes('passportNumber-not-allowed-in-veygrit-id-account'));
  assert.ok(account.errors.includes('rawEmail-not-allowed-in-veygrit-id-account'));
  assert.ok(account.errors.includes('only-self-addresses-allowed-in-mvp'));
  assert.ok(account.errors.includes('raw-private-address-material-not-allowed'));
  assert.equal(account.addresses.length, 0);
  assert.equal(account.privacy.storesOnlySelfAddresses, true);
});

test('Veygrit ID blocks address autofill when fresh reauthentication or user consent is missing', () => {
  const account = buildVeygritIdAccount({
    loginProviders: ['google'],
    emailVerified: true,
    basicProfileCommitment: 'profile_basic_commitment',
    addresses: [
      {
        kind: 'home',
        ownerRelationship: 'self',
        countryCode: 'JP',
        addressCommitment: 'address_commitment_home',
      },
    ],
  });
  const partner = buildVeygritIdPartnerApplication({
    legalName: 'Example Travel Inc.',
    displayName: 'Example Travel',
    siteCategory: 'travel',
    domains: ['travel.example'],
    verifiedDomains: ['travel.example'],
    requestedScopes: ['profile.basic', 'profile.travel', 'address.shipping'],
    businessVerified: true,
    kybVerified: true,
    contentReviewed: true,
    fraudReviewPassed: true,
    privacyPolicyReviewed: true,
    securityReviewed: true,
    httpsOnly: true,
    clientId: 'vg_client_travel',
    redirectUris: ['https://travel.example/veygrit/callback'],
  });
  const request = buildVeygritIdAuthorizationRequest({
    clientId: 'vg_client_travel',
    origin: 'travel.example',
    redirectUri: 'https://travel.example/veygrit/callback',
    requestedScopes: ['profile.basic', 'profile.travel', 'address.shipping'],
    createdAt: '2026-06-20T00:00:00.000Z',
    expiresAt: '2026-06-20T00:10:00.000Z',
    userLoggedIn: true,
  });
  const grant = buildVeygritIdConsentGrant({
    account,
    partner,
    request,
    now: '2026-06-20T00:01:00.000Z',
    consent: {
      approvedScopes: ['profile.basic', 'profile.travel', 'address.shipping'],
      userConfirmed: false,
    },
  });

  assert.equal(grant.status, 'requires-consent');
  assert.ok(grant.errors.includes('user-consent-not-confirmed'));
  assert.ok(grant.errors.includes('fresh-reauthentication-required'));
  assert.equal(validateVeygritIdGrant(grant).ok, false);
});

test('Veygrit ID integration plan is Clerk-like but partner-gated', () => {
  const plan = buildVeygritIdIntegrationPlan();

  assert.equal(plan.packageName, '@veygrit/id');
  assert.equal(plan.buttonLabel, 'Veygritで住所入力');
  assert.ok(plan.components.includes('<VeygritAddressButton />'));
  assert.ok(plan.backendEndpoints.includes('POST /veygrit/address-fill/exchange'));
  assert.ok(plan.requiredPartnerGates.includes('法人確認'));
  assert.ok(plan.recommendedFlow.some(step => step.includes('sealed claims')));
});
