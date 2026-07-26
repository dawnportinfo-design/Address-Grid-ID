import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  ADDRESSQL_PRACTICAL_API_LIMITS,
  ADDRESSQL_PRACTICAL_API_VERSION,
  createAddressQlPracticalApi,
} from './addressQlPracticalApi';
import type { AddressQlRuntimeAdapter } from './addressQlRuntimeAdapter';

const api = createAddressQlPracticalApi(process.cwd(), {
  now: '2026-07-26T00:00:00Z',
});

const runtimeDigest = (character: string) => `sha256:${character.repeat(64)}`;

function runtimeAdapter(
  mode: AddressQlRuntimeAdapter['mode'],
): AddressQlRuntimeAdapter {
  return {
    id: 'jp-postal-runtime-fixture',
    version: 'v1',
    mode,
    countryCodes: ['JP'],
    purposes: ['existence'],
    evidence: {
      sourceId: 'jp-postal-runtime-source',
      sourceVersion: 'fixture-v1',
      reuseRights: 'Synthetic conformance fixture',
      coverageStatement: 'Synthetic postal existence adapter for API tests.',
      correctionUrl: 'https://example.invalid/addressql-corrections',
      retrievedAt: '2026-07-01T00:00:00Z',
      validUntil: '2027-07-01T00:00:00Z',
      datasetDigest: runtimeDigest('b'),
      holdoutDigest: runtimeDigest('c'),
      reportDigest: runtimeDigest('d'),
      attestationKeyId: 'fixture-reviewer',
      attestationSignature: 'synthetic-signature',
    },
    evaluate: input => ({
      status: input.postalCode === '100-0001' ? 'pass' : 'fail',
      confidence: 0.99,
      reasonCode: 'postal_source_exact_match',
    }),
  };
}

test('P1 practical API starts with complete country coverage and no L2/L5 overclaim', () => {
  const health = api.handle({ method: 'GET', path: '/v1/health' });
  const countries = api.handle({ method: 'GET', path: '/v1/countries' });

  assert.equal(api.version, ADDRESSQL_PRACTICAL_API_VERSION);
  assert.equal(api.profileCount, 276);
  assert.equal(health.statusCode, 200);
  assert.equal(health.body.profileCount, 276);
  assert.equal(health.body.postalExistenceEnabledProfiles, 0);
  assert.equal(health.body.deliveryPointEnabledProfiles, 0);
  assert.equal(health.body.dataPromotionReviewCandidateProfiles, 4);
  assert.equal(health.body.dataPromotionEnabledProfiles, 0);
  assert.equal(health.body.multilingualNativeFormatEnabledProfiles, 271);
  assert.equal(health.body.multilingualInternationalEnglishFormatEnabledProfiles, 271);
  assert.equal(health.body.automaticPlaceNameTranslationEnabledProfiles, 0);
  assert.equal(countries.statusCode, 200);
  assert.equal(countries.body.count, 276);
});

test('P1 format validation normalizes bounded input without reflecting the postal code', () => {
  const output = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    headers: { 'X-Request-Id': 'test.jp-format-1' },
    body: {
      countryCode: 'jp',
      postalCode: '１０００００１',
      purpose: 'format',
      requestId: 'test.jp-format-1',
    },
  });
  const serialized = JSON.stringify(output.body);
  const validation = output.body.validation as Record<string, unknown>;
  const capability = output.body.capability as Record<string, unknown>;

  assert.equal(output.statusCode, 200);
  assert.equal(output.body.countryCode, 'JP');
  assert.equal(output.body.requestId, 'test.jp-format-1');
  assert.equal(output.body.highestEnabledLevel, 'L1');
  assert.equal(validation.status, 'pass');
  assert.equal(validation.purpose, 'format');
  assert.equal(capability.requestedLevel, 'L1');
  assert.equal(capability.state, 'enabled');
  assert.doesNotMatch(serialized, /100-0001|1000001|１０００００１/);
  assert.doesNotMatch(serialized, /"postalCode"|"rawAddress"|"street"|"premise"/i);
});

test('P1 existence and delivery requests fail closed with machine-readable evidence gaps', () => {
  const existence = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'JP', postalCode: '100-0001', purpose: 'existence' },
  });
  const delivery = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'JP', postalCode: '100-0001', purpose: 'delivery' },
  });
  const existenceValidation = existence.body.validation as Record<string, unknown>;
  const existenceCapability = existence.body.capability as Record<string, unknown>;
  const deliveryValidation = delivery.body.validation as Record<string, unknown>;
  const deliveryCapability = delivery.body.capability as Record<string, unknown>;

  assert.equal(existence.statusCode, 200);
  assert.equal(existenceValidation.status, 'unknown');
  assert.equal(existenceCapability.requestedLevel, 'L2');
  assert.equal(existenceCapability.state, 'blocked');
  assert.deepEqual(existenceCapability.missingEvidence, [
    'correction-path',
    'coverage-statement',
    'freshness-window',
    'independent-signature',
    'reuse-rights',
    'runtime-adapter',
    'source-identity',
    'source-version',
    'synthetic-holdout',
  ]);

  assert.equal(deliveryValidation.status, 'unknown');
  assert.equal(deliveryCapability.requestedLevel, 'L4');
  assert.equal(deliveryCapability.state, 'blocked');
  assert.ok((deliveryCapability.missingEvidence as string[]).includes('delivery-area-source'));
});

test('P1 executes independently attested runtime adapters without reflecting inputs', () => {
  const runtimeApi = createAddressQlPracticalApi(process.cwd(), {
    now: '2026-07-26T00:00:00Z',
    runtimeAdapters: [runtimeAdapter('approved')],
    verifyIndependentAttestation: evidence =>
      evidence.attestationKeyId === 'fixture-reviewer',
  });
  const output = runtimeApi.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: {
      countryCode: 'JP',
      postalCode: '100-0001',
      purpose: 'existence',
    },
  });
  const validation = output.body.validation as Record<string, unknown>;
  const capability = output.body.capability as Record<string, unknown>;
  const countryCapabilities = runtimeApi.handle({
    method: 'GET',
    path: '/v1/countries/JP/capabilities',
  });
  const countryPromotions = runtimeApi.handle({
    method: 'GET',
    path: '/v1/countries/JP/promotions',
  });
  const promotionSummary = runtimeApi.handle({
    method: 'GET',
    path: '/v1/promotions',
  });
  const health = runtimeApi.handle({ method: 'GET', path: '/v1/health' });
  const l2Capability = (
    countryCapabilities.body.capabilities as Array<Record<string, unknown>>
  ).find(item => item.level === 'L2')!;
  const l2Promotion = (
    countryPromotions.body.targets as Array<Record<string, unknown>>
  ).find(item => item.level === 'L2')!;
  const serialized = JSON.stringify(output.body);

  assert.equal(validation.status, 'pass');
  assert.equal(validation.evidence_level, 'independently_attested');
  assert.equal(capability.state, 'enabled');
  assert.equal(capability.liveRuntimeEvidence, true);
  assert.deepEqual(capability.missingEvidence, []);
  assert.deepEqual(capability.adapterIds, ['jp-postal-runtime-fixture']);
  assert.equal(
    (countryCapabilities.body.country as Record<string, unknown>)
      .highestEnabledLevel,
    'L2',
  );
  assert.equal(l2Capability.state, 'enabled');
  assert.equal(l2Capability.evidenceLevel, 'independently_attested');
  assert.equal(countryPromotions.body.highestEnabledLevel, 'L2');
  assert.equal(l2Promotion.state, 'enabled');
  assert.equal(l2Promotion.independentAttestationVerified, true);
  assert.deepEqual(promotionSummary.body.enabledCountryCodes, ['JP']);
  assert.equal(
    (promotionSummary.body.enabledByLevel as Record<string, unknown>).L2,
    1,
  );
  assert.equal(health.body.postalExistenceEnabledProfiles, 1);
  assert.equal(health.body.dataPromotionEnabledProfiles, 1);
  assert.doesNotMatch(serialized, /100-0001/);
});

test('P1 can test conformance adapters without promoting live capability', () => {
  const conformanceApi = createAddressQlPracticalApi(process.cwd(), {
    now: '2026-07-26T00:00:00Z',
    runtimeAdapters: [runtimeAdapter('conformance')],
    allowConformanceAdapters: true,
  });
  const output = conformanceApi.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: {
      countryCode: 'JP',
      postalCode: '100-0001',
      purpose: 'existence',
    },
  });
  const validation = output.body.validation as Record<string, unknown>;
  const capability = output.body.capability as Record<string, unknown>;

  assert.equal(validation.status, 'unknown');
  assert.equal(validation.evidence_level, 'synthetic_conformance');
  assert.equal(
    (validation.field_results as Array<Record<string, unknown>>)[1].reason_code,
    'existence_conformance_adapter_not_live',
  );
  assert.equal(capability.state, 'blocked');
  assert.equal(capability.liveRuntimeEvidence, false);
});

test('P1 no-postal policy and capability endpoint remain explicit', () => {
  const empty = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'HK', postalCode: '', purpose: 'format' },
  });
  const invented = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'HK', postalCode: '00000', purpose: 'format' },
  });
  const capability = api.handle({
    method: 'GET',
    path: '/v1/countries/HK/capabilities',
  });

  assert.equal((empty.body.validation as Record<string, unknown>).status, 'not_applicable');
  assert.equal((invented.body.validation as Record<string, unknown>).status, 'fail');
  assert.equal(capability.statusCode, 200);
  assert.equal((capability.body.country as Record<string, unknown>).postalStatus, 'no_postal_code');
  assert.equal((capability.body.country as Record<string, unknown>).highestEnabledLevel, 'L1');
});

test('P1 rejects unsafe fields, identifiers, unknown countries, and oversized batches', () => {
  const rawAddress = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'JP', postalCode: '100-0001', address: 'not accepted' },
  });
  const confusableId = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'JP', postalCode: '100-0001', requestId: 'rev\u0456ewer' },
  });
  const unknown = api.handle({
    method: 'POST',
    path: '/v1/postal/validate',
    body: { countryCode: 'ZZ', postalCode: '00000' },
  });
  const malformedPath = api.handle({
    method: 'GET',
    path: '/v1/countries/%/capabilities',
  });
  const oversized = api.handle({
    method: 'POST',
    path: '/v1/postal/validate/batch',
    body: {
      requests: Array.from(
        { length: ADDRESSQL_PRACTICAL_API_LIMITS.maxBatchSize + 1 },
        () => ({ countryCode: 'JP', postalCode: '100-0001' }),
      ),
    },
  });

  assert.equal(rawAddress.statusCode, 400);
  assert.equal((rawAddress.body.error as Record<string, unknown>).code, 'unknown_field');
  assert.equal(confusableId.statusCode, 400);
  assert.equal((confusableId.body.error as Record<string, unknown>).code, 'invalid_request_id');
  assert.equal(unknown.statusCode, 404);
  assert.equal(malformedPath.statusCode, 400);
  assert.equal(oversized.statusCode, 413);
});

test('P1 batch validation isolates item errors and OpenAPI publishes the same routes', () => {
  const batch = api.handle({
    method: 'POST',
    path: '/v1/postal/validate/batch',
    body: {
      requests: [
        { countryCode: 'JP', postalCode: '100-0001' },
        { countryCode: 'ZZ', postalCode: '00000' },
      ],
    },
  });
  const openApi = JSON.parse(
    readFileSync('docs/specs/openapi/addressql-practical-api-v1.openapi.json', 'utf8'),
  ) as { paths: Record<string, unknown>; components: { schemas: Record<string, unknown> } };

  assert.equal(batch.statusCode, 200);
  assert.equal(batch.body.count, 2);
  assert.deepEqual(
    (batch.body.results as Array<Record<string, unknown>>).map(result => result.statusCode),
    [200, 404],
  );
  for (const path of [
    '/v1/health',
    '/v1/countries',
    '/v1/countries/{countryCode}/capabilities',
    '/v1/countries/{countryCode}/promotions',
    '/v1/countries/{countryCode}/languages',
    '/v1/promotions',
    '/v1/multilingual',
    '/v1/multilingual/assess',
    '/v1/postal/validate',
    '/v1/postal/validate/batch',
  ]) {
    assert.ok(openApi.paths[path], `${path} missing from OpenAPI`);
  }
  assert.doesNotMatch(JSON.stringify(openApi.components.schemas), /rawAddress|recipient|street|premise/);
});

test('P2 promotion endpoints expose exact country blockers without enabling validation', () => {
  const summary = api.handle({ method: 'GET', path: '/v1/promotions' });
  const gt = api.handle({
    method: 'GET',
    path: '/v1/countries/gt/promotions',
  });
  const targets = gt.body.targets as Array<Record<string, unknown>>;
  const l3 = targets.find(target => target.level === 'L3')!;

  assert.equal(summary.statusCode, 200);
  assert.deepEqual(summary.body.reviewCandidateCountryCodes, ['AU', 'GT', 'NZ', 'PA']);
  assert.deepEqual(summary.body.enabledCountryCodes, []);
  assert.equal(gt.statusCode, 200);
  assert.equal(gt.body.countryCode, 'GT');
  assert.equal(gt.body.highestReviewCandidateLevel, 'L3');
  assert.equal(gt.body.highestEnabledLevel, null);
  assert.equal(l3.state, 'review_candidate');
  assert.deepEqual(l3.missingEvidence, [
    'approved-administrative-keys',
    'independent-signature',
    'runtime-adapter',
  ]);
  assert.equal((gt.body.privacy as Record<string, unknown>).containsRawAddress, false);
});

test('P3 multilingual endpoints separate formatting from verified translation', () => {
  const summary = api.handle({ method: 'GET', path: '/v1/multilingual' });
  const jp = api.handle({
    method: 'GET',
    path: '/v1/countries/JP/languages',
  });
  const route = api.handle({
    method: 'POST',
    path: '/v1/multilingual/assess',
    headers: { 'x-request-id': 'test.jp-language-1' },
    body: {
      countryCode: 'JP',
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      purpose: 'international-shipping',
      requestId: 'test.jp-language-1',
    },
  });
  const assessment = route.body.assessment as Record<string, unknown>;

  assert.equal(summary.statusCode, 200);
  assert.equal(summary.body.countryCount, 276);
  assert.equal(summary.body.nativeFormatEnabledProfiles, 271);
  assert.equal(summary.body.automaticPlaceNameTranslationEnabledProfiles, 0);
  assert.equal(jp.statusCode, 200);
  assert.equal(jp.body.highestEnabledLevel, 'M2');
  assert.equal(jp.body.highestReviewCandidateLevel, 'M4');
  assert.equal(jp.body.automaticPlaceNameTranslationEnabled, false);
  assert.equal(route.statusCode, 200);
  assert.equal(route.body.requestId, 'test.jp-language-1');
  assert.equal(assessment.status, 'review_required');
  assert.equal(assessment.formatReady, true);
  assert.equal(assessment.translationVerified, false);
});

test('P3 multilingual assessment rejects address text and invalid language tags', () => {
  const rawText = api.handle({
    method: 'POST',
    path: '/v1/multilingual/assess',
    body: {
      countryCode: 'JP',
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      text: 'not accepted',
    },
  });
  const invalidLanguage = api.handle({
    method: 'POST',
    path: '/v1/multilingual/assess',
    body: {
      countryCode: 'JP',
      sourceLanguage: 'ja<script>',
      targetLanguage: 'en',
    },
  });

  assert.equal(rawText.statusCode, 400);
  assert.equal((rawText.body.error as Record<string, unknown>).code, 'unknown_field');
  assert.equal(invalidLanguage.statusCode, 400);
  assert.equal(
    (invalidLanguage.body.error as Record<string, unknown>).code,
    'invalid_language_tag',
  );
});
