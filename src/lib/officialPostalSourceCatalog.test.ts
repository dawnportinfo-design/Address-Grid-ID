import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  classifyPostalSourceTrust,
  getOfficialPostalSourcesForCountry,
  getPreferredPostalSourceIdsForCountry,
  OFFICIAL_POSTAL_SOURCE_CATALOG,
} from './officialPostalSourceCatalog';

test('registers official and open postal sources for the priority rollout countries', () => {
  for (const countryCode of ['JP', 'US', 'GB', 'BR', 'SG', 'FR', 'NL', 'AU', 'HK', 'AQ']) {
    const sources = getOfficialPostalSourcesForCountry(countryCode);
    assert.ok(sources.length > 0, `${countryCode} should have at least one registered source`);
    assert.ok(getPreferredPostalSourceIdsForCountry(countryCode).length > 0, `${countryCode} should expose preferred source ids`);
  }
});

test('prefers country-specific official sources before the UPU global fallback', () => {
  const countrySpecificCountries = ['AO', 'DZ', 'EG', 'GH', 'KE', 'MA', 'TN', 'TZ', 'RW', 'ZM', 'MG', 'MU', 'BW', 'AT', 'CH', 'LI', 'NL'];

  for (const countryCode of countrySpecificCountries) {
    const sources = getOfficialPostalSourcesForCountry(countryCode);
    assert.notEqual(sources[0]?.id, 'upu-universal-postcode-database', `${countryCode} should not prefer the global fallback first`);
    assert.ok(
      sources.some(source => (
        !source.countryCodes.includes('*') &&
        ['authoritative', 'official', 'official-derived'].includes(source.trustTier)
      )),
      `${countryCode} should have a country-specific official source`,
    );
  }

  assert.equal(getOfficialPostalSourcesForCountry('DE')[0]?.id, 'upu-universal-postcode-database');
});

test('keeps the UPU source as an explicit official global fallback', () => {
  const sources = getOfficialPostalSourcesForCountry('ZZ');
  const upu = sources.find(source => source.id === 'upu-universal-postcode-database');

  assert.equal(upu?.authority, 'intergovernmental-postal-standard');
  assert.equal(upu?.trustTier, 'official');
  assert.equal(upu?.requiresCredential, true);
});

test('classifies official postal APIs and government address APIs as strong evidence', () => {
  const japanPost = classifyPostalSourceTrust({
    countryCode: 'JP',
    source: 'Japan Post Postal Code and Digital Address API',
  });
  const franceBan = classifyPostalSourceTrust({
    countryCode: 'FR',
    source: 'API Adresse Base Adresse Nationale data.gouv.fr',
  });
  const singaporeOneMap = classifyPostalSourceTrust({
    countryCode: 'SG',
    source: 'OneMap SLA address search',
  });

  assert.equal(japanPost.strength, 'strong');
  assert.equal(japanPost.tier, 'authoritative');
  assert.equal(franceBan.strength, 'strong');
  assert.equal(singaporeOneMap.strength, 'strong');
});

test('keeps weak third-party postal lists below official and official-derived sources', () => {
  const datahub = classifyPostalSourceTrust({
    countryCode: 'IT',
    source: 'datahub postal-codes-it',
  });
  const geonames = classifyPostalSourceTrust({
    countryCode: 'ZA',
    source: 'geonames-postal',
  });

  assert.equal(datahub.strength, 'weak');
  assert.equal(datahub.tier, 'weak');
  assert.equal(geonames.strength, 'weak');
  assert.equal(geonames.tier, 'community');
});

test('catalog source ids are unique and sorted by trust for a country lookup', () => {
  const ids = OFFICIAL_POSTAL_SOURCE_CATALOG.map(source => source.id);
  assert.equal(new Set(ids).size, ids.length);

  const jpSources = getOfficialPostalSourcesForCountry('JP');
  assert.equal(jpSources[0].id, 'japan-post-digital-address-api');
  assert.ok(jpSources.find(source => source.id === 'zipcloud-jp'));
});
