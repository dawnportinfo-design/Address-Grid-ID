import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DEFAULT_ADDRESS_VERIFICATION_TARGET_COUNTRIES,
  getAddressVerificationTargetPolicy,
  isCountryEnabledForAddressVerification,
  verifyAddressCandidate,
} from './addressVerificationEngine';

const jpFormat = {
  countryCode: 'JP',
  name: 'Japan',
  native: {
    addressFormat: '〒{{postcode}}\n{{state}}{{city}}{{street}}{{houseNumber}}',
    fields: [
      { key: 'postcode', required: true },
      { key: 'state', required: true },
      { key: 'city', required: true },
    ],
  },
  postalCode: {
    regex: '^\\d{3}-?\\d{4}$',
    source: 'agid-country-postal-format-policy',
  },
  addressRules: {
    postalCode: { required: true, usage: 'required' as const },
    openSourceIds: ['agid-address-verification-engine'],
  },
};

test('target countries gate address verification before postcode checks', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['JP'],
    countryCode: 'US',
    postalCode: '100-0001',
    address: {
      city: 'Chiyoda-ku',
      state: 'Tokyo',
      road: 'Marunouchi',
    },
    scope: 'postal',
  });

  assert.equal(result.status, 'country_mismatch');
  assert.equal(result.country.targetAllowed, false);
  assert.ok(result.nextActions.includes('select-the-correct-target-country'));
});

test('postcode-only verification is partial until lookup evidence agrees for lookup countries', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['JP'],
    countryCode: 'JP',
    postalCode: '1000001',
    scope: 'postal',
    format: jpFormat,
  });

  assert.equal(result.status, 'partial');
  assert.equal(result.postal.formatValid, true);
  assert.equal(result.postal.evidence, 'not-provided');
  assert.ok(result.nextActions.includes('run-postal-code-lookup'));
  assert.equal(result.standardLibrary.freeOnly, true);
  assert.ok(result.standardLibrary.primary.some(entry => entry.id === 'local-address-parser'));
  assert.ok(result.audit.some(step => step.step === 'standard-library-resolution'));
});

test('postcode lookup evidence can verify a selected target country address', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['JP', 'US'],
    countryCode: 'JP',
    postalCode: '100-0001',
    scope: 'address',
    format: jpFormat,
    address: {
      country: 'Japan',
      state: 'Tokyo',
      city: 'Chiyoda-ku',
      road: 'Marunouchi',
      postcode: '100-0001',
    },
    postalEvidence: [{
      source: 'zipcloud',
      countryCode: 'JP',
      postalCode: '1000001',
      state: 'Tokyo',
      city: 'Chiyoda-ku',
      confidence: 0.91,
    }],
  });

  assert.equal(result.status, 'verified');
  assert.equal(result.postal.evidence, 'matched');
  assert.equal(result.score >= 0.91, true);
  assert.ok(result.sources.includes('zipcloud'));
  assert.equal((result as any).evidence.postalSourceTrust, 'official-derived');
  assert.ok((result as any).evidence.postalSourceCatalogMatches.includes('zipcloud-jp'));
});

test('official postal source catalog evidence can verify without legacy source-name patterns', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['FR'],
    countryCode: 'FR',
    postalCode: '75001',
    scope: 'address',
    address: {
      country: 'France',
      city: 'Paris',
      road: 'Rue de Rivoli',
      house_number: '99',
      postcode: '75001',
    },
    postalEvidence: [{
      source: 'API Adresse Base Adresse Nationale',
      sourceId: 'api-adresse-data-gouv-fr',
      countryCode: 'FR',
      postalCode: '75001',
      city: 'Paris',
      confidence: 0.95,
    }],
  });

  assert.equal(result.status, 'verified');
  assert.equal((result as any).evidence.postalStrength, 'strong');
  assert.equal((result as any).evidence.postalSourceTrust, 'authoritative');
  assert.ok((result as any).evidence.postalSourceCatalogMatches.includes('api-adresse-data-gouv-fr'));
});

test('invalid postcode format is unresolved even before external lookup', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['US'],
    countryCode: 'US',
    postalCode: 'ABCDE',
    scope: 'postal',
  });

  assert.equal(result.status, 'unresolved');
  assert.equal(result.postal.formatValid, false);
  assert.ok(result.nextActions.includes('correct-postal-code-format'));
});

test('no-postal-code countries switch to geo verification actions', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['HK'],
    countryCode: 'HK',
    scope: 'address',
    address: {
      country: 'Hong Kong',
      district: 'Central and Western',
      road: "Queen's Road Central",
      building: 'IFC',
    },
    sources: ['hk-csdi', 'osm-nominatim'],
  });

  assert.equal(result.status, 'verified');
  assert.equal(result.postal.required, false);
  assert.equal(result.postal.evidence, 'not-required');
  assert.ok(result.nextActions.includes('verify-with-coordinate-and-open-geodata'));
});

test('country policy helpers expose enabled verification targets', () => {
  assert.ok(DEFAULT_ADDRESS_VERIFICATION_TARGET_COUNTRIES.includes('JP'));
  assert.equal(isCountryEnabledForAddressVerification('uk'), true);
  assert.equal(isCountryEnabledForAddressVerification('JP', ['US']), false);
  assert.equal(getAddressVerificationTargetPolicy('NL')?.postcodeFormat, 'NNNN AA');
});

test('weak postal candidates do not upgrade a deliverability-style address to verified', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['US'],
    countryCode: 'US',
    postalCode: '10001',
    scope: 'address',
    address: {
      country: 'United States',
      state: 'NY',
      city: 'New York',
      road: 'Broadway',
      house_number: '1',
      postcode: '10001',
    },
    postalEvidence: [{
      source: 'zippopotam',
      countryCode: 'US',
      postalCode: '10001',
      state: 'New York',
      city: 'New York',
      confidence: 0.96,
    }],
  });

  assert.equal(result.status, 'partial');
  assert.equal((result as any).evidence.postalStrength, 'weak');
  assert.ok(result.nextActions.includes('collect-strong-postal-or-address-reference'));
});

test('reference address matches can verify street and house-level addresses', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['US'],
    countryCode: 'US',
    postalCode: '10001',
    scope: 'address',
    address: {
      country: 'United States',
      state: 'NY',
      city: 'New York',
      road: 'Broadway',
      house_number: '1',
      postcode: '10001',
    },
    referenceRecords: [{
      source: 'openaddresses',
      countryCode: 'US',
      state: 'NY',
      city: 'New York',
      street: 'Broadway',
      houseNumber: '1',
      postcode: '10001',
    }],
  } as any);

  assert.equal(result.status, 'verified');
  assert.equal((result as any).evidence.addressReference, 'matched');
  assert.ok(result.sources.includes('openaddresses'));
});

test('caller supplied country formats enable safe global postal verification without default policies', () => {
  const portugalFormat = {
    countryCode: 'PT',
    name: 'Portugal',
    native: {
      addressFormat: '{{street}} {{houseNumber}}\n{{postcode}} {{city}}\n{{country}}',
      fields: [
        { key: 'postcode', required: true },
        { key: 'city', required: true },
      ],
    },
    postalCode: {
      regex: '^\\d{4}-\\d{3}$',
      source: 'CTT / official postal metadata',
      api: 'https://www.ctt.pt/',
    },
    addressRules: {
      postalCode: { required: true, usage: 'required' as const },
      openSourceIds: ['ctt', 'osm-nominatim'],
    },
  };

  const result = verifyAddressCandidate({
    targetCountries: ['PT'],
    countryCode: 'PT',
    postalCode: '1000-001',
    scope: 'postal',
    format: portugalFormat,
  });

  assert.equal(result.status, 'partial');
  assert.equal(result.country.supported, true);
  assert.equal(result.country.policy?.countryCode, 'PT');
  assert.ok(result.nextActions.includes('run-postal-code-lookup'));
  assert.equal(result.quality.readiness, 'format-only');
  assert.equal(result.quality.paidApiParityClaimed, false);
});

test('authoritative delivery point evidence can be labeled paid-grade for the supplied evidence set', () => {
  const result = verifyAddressCandidate({
    targetCountries: ['US'],
    countryCode: 'US',
    postalCode: '10001-0001',
    scope: 'address',
    address: {
      country: 'United States',
      country_code: 'US',
      state: 'NY',
      city: 'New York',
      road: 'Broadway',
      house_number: '1',
      postcode: '10001-0001',
    },
    postalEvidence: [{
      source: 'USPS Web Tools',
      sourceId: 'usps-web-tools',
      countryCode: 'US',
      postalCode: '10001-0001',
      city: 'New York',
      confidence: 0.97,
    }],
  });

  assert.equal(result.status, 'verified');
  assert.equal(result.quality.depth, 'delivery-point');
  assert.equal(result.quality.evidenceGrade, 'authoritative');
  assert.equal(result.quality.readiness, 'paid-grade-for-supplied-evidence');
  assert.equal(result.quality.paidApiParityClaimed, true);
});
