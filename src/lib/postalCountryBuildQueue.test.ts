import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  POSTAL_COUNTRY_BUILD_QUEUE_SCHEMA_ID,
  buildPostalCountryBuildQueue,
  validatePostalCountryBuildQueue,
} from './postalCountryBuildQueue';

test('country build queue starts with Guatemala and keeps every item metadata-only', () => {
  const queue = buildPostalCountryBuildQueue({ generatedAt: '2026-07-23T02:52:01.274Z' });

  assert.equal(queue.schemaId, POSTAL_COUNTRY_BUILD_QUEUE_SCHEMA_ID);
  assert.equal(queue.items[0]?.countryCode, 'GT');
  assert.equal(queue.items[0]?.postalPattern, '^\\d{5}$');
  assert.equal(queue.items[0]?.phase, 'source-readiness-gated');
  assert.equal(queue.items.find(item => item.countryCode === 'KE')?.phase, 'country-specific-source-review-required');
  assert.equal(queue.items.find(item => item.countryCode === 'KH')?.postalPattern, null);
  assert.equal(queue.items.find(item => item.countryCode === 'KH')?.phase, 'country-specific-source-discovery-required');
  assert.equal(queue.items.find(item => item.countryCode === 'LA')?.postalPattern, null);
  assert.equal(queue.items.find(item => item.countryCode === 'LA')?.phase, 'country-specific-source-discovery-required');
  assert.equal(queue.items.find(item => item.countryCode === 'MM')?.postalPattern, null);
  assert.equal(queue.items.find(item => item.countryCode === 'MM')?.phase, 'country-specific-source-discovery-required');
  assert.equal(queue.items.find(item => item.countryCode === 'NP')?.postalPattern, null);
  assert.equal(queue.items.find(item => item.countryCode === 'NP')?.phase, 'country-specific-source-discovery-required');
  assert.equal(queue.items.find(item => item.countryCode === 'PK')?.postalPattern, null);
  assert.equal(queue.items.find(item => item.countryCode === 'PK')?.phase, 'country-specific-source-discovery-required');
  assert.equal(queue.items.find(item => item.countryCode === 'UG')?.postalPattern, null);
  assert.equal(queue.items.find(item => item.countryCode === 'UG')?.phase, 'country-specific-source-review-required');
  assert.ok(queue.items.length >= 10);
  assert.ok(queue.items.every(item => item.publicationBoundary.containsPersonalData === false));
  assert.ok(queue.items.every(item => item.publicationBoundary.containsRawThirdPartyData === false));
  assert.ok(queue.items.every(item => item.publicationBoundary.realPostalLookupEnabled === false));
  assert.ok(queue.items.every(item => item.publicationBoundary.deliveryClaimEnabled === false));

  const validation = validatePostalCountryBuildQueue(queue);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test('checked-in country build queue matches its generator definition', async () => {
  const filePath = join(process.cwd(), 'data', 'postal_country_packs', 'build-queue.json');
  const committed = JSON.parse(await readFile(filePath, 'utf8'));
  const expected = buildPostalCountryBuildQueue({ generatedAt: committed.generatedAt });

  assert.deepEqual(committed, expected);
  assert.equal(validatePostalCountryBuildQueue(committed).valid, true);
});
