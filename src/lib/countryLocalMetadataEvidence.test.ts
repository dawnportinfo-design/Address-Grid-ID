import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assessCountryLocalMetadataEvidence } from './countryLocalMetadataEvidence';

const safeReadiness = {
  countryCode: 'GT',
  containsPersonalData: false,
  containsRawThirdPartyData: false,
  realPostalLookupEnabled: false,
  deliveryClaimEnabled: false,
  sources: [{
    authorityStatus: 'recorded',
    postalMappingEvidence: false,
    redistributionStatus: 'metadata-only',
    version: '2026.07',
    retrievedAt: '2026-07-23T00:00:00.000Z',
    documentation: {
      sourceUrl: 'https://example.invalid/source',
      termsUrl: 'https://example.invalid/terms',
      correctionUrl: 'https://example.invalid/contact',
      correctionPathStatus: 'general-contact-only',
      reuseStatus: 'metadata-only-verified',
      verifiedAt: '2026-07-24T00:00:00.000Z',
    },
  }],
};

test('does not promote a general contact route to a source-specific correction path', () => {
  assert.equal(
    assessCountryLocalMetadataEvidence(safeReadiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('promotes only safe metadata with verified source-specific lifecycle documentation', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources[0]!.documentation!.correctionPathStatus = 'source-specific-confirmed';
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-reuse-verified',
  );
});

test('does not keep an old verification promoted after its review window', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources[0]!.documentation!.correctionPathStatus = 'source-specific-confirmed';
  readiness.sources[0]!.documentation!.verifiedAt = '2026-01-01T00:00:00.000Z';
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('does not promote a freshly reviewed but stale source retrieval', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources[0]!.documentation!.correctionPathStatus = 'source-specific-confirmed';
  readiness.sources[0]!.retrievedAt = '2026-01-01T00:00:00.000Z';
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('does not promote a verification that predates source retrieval', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources[0]!.documentation!.correctionPathStatus = 'source-specific-confirmed';
  readiness.sources[0]!.documentation!.verifiedAt = '2026-07-22T00:00:00.000Z';
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('does not combine lifecycle evidence from one source with safety evidence from another', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources.push({
    authorityStatus: 'unverified',
    postalMappingEvidence: true,
    redistributionStatus: 'unknown',
    version: '2026.07',
    retrievedAt: '2026-07-23T00:00:00.000Z',
    documentation: {
      sourceUrl: 'https://example.invalid/other-source',
      termsUrl: 'https://example.invalid/other-terms',
      correctionUrl: 'https://example.invalid/other-contact',
      correctionPathStatus: 'source-specific-confirmed',
      reuseStatus: 'metadata-only-verified',
      verifiedAt: '2026-07-24T00:00:00.000Z',
    },
  });
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('does not promote an untraceable source version marker', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources[0]!.documentation!.correctionPathStatus = 'source-specific-confirmed';
  readiness.sources[0]!.version = 'unknown';
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('does not promote timestamps without a timezone', () => {
  const readiness = structuredClone(safeReadiness);
  readiness.sources[0]!.documentation!.correctionPathStatus = 'source-specific-confirmed';
  readiness.sources[0]!.retrievedAt = '2026-07-23T00:00:00';
  assert.equal(
    assessCountryLocalMetadataEvidence(readiness, '2026-07-24T00:00:00.000Z'),
    'metadata-recorded',
  );
});

test('does not classify unsafe packs as local metadata evidence', () => {
  assert.equal(
    assessCountryLocalMetadataEvidence({ ...safeReadiness, containsRawThirdPartyData: true }, '2026-07-24T00:00:00.000Z'),
    'not-safe-or-not-recorded',
  );
});
