import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chooseConfiguredAddressTranslationRoute,
  getConfiguredAddressTranslationProfile,
  isAddressBuildingField,
  normalizeAddressTranslationCountryCode,
  normalizeAddressTranslationLanguage,
  translateConfiguredAddressField,
  type AddressTranslationProfile,
} from './addressTranslationRegion';

type TestTopology = 'native' | 'latin-address';
type TestAlgorithm = 'test-romanization';
type TestProfile = AddressTranslationProfile<TestTopology, TestAlgorithm>;

const profiles: Record<string, TestProfile> = {
  GB: {
    countryCode: 'GB',
    nativeLanguages: ['en', 'cy'],
    defaultLanguage: 'en',
    defaultTopology: 'latin-address',
    englishAlgorithm: 'test-romanization',
  },
  ZZ: {
    countryCode: 'ZZ',
    nativeLanguages: ['zz'],
    defaultLanguage: 'zz',
    defaultTopology: 'native',
    englishAlgorithm: 'test-romanization',
  },
};

const topologyByLanguage: Record<string, TestTopology> = {
  en: 'latin-address',
  cy: 'native',
  zz: 'native',
};

test('normalizes country aliases and English shipping language aliases', () => {
  assert.equal(normalizeAddressTranslationCountryCode(' uk ', { UK: 'GB' }), 'GB');
  const profile = profiles.ZZ;
  assert.equal(normalizeAddressTranslationLanguage('en-GB', profile), 'en');
  assert.equal(normalizeAddressTranslationLanguage('carrier', profile), 'en');
  assert.equal(normalizeAddressTranslationLanguage('local', profile), 'zz');
});

test('chooses configured routes from reusable region metadata', () => {
  const route = chooseConfiguredAddressTranslationRoute({
    countryCode: 'UK',
    sourceLanguage: 'cy',
    targetLanguage: 'en-international',
    profiles,
    topologyByLanguage,
    englishTopology: 'latin-address',
    countryCodeAliases: { UK: 'GB' },
  });

  assert.equal(route?.mode, 'english');
  assert.equal(route?.sourceTopology, 'native');
  assert.equal(route?.targetTopology, 'latin-address');
  assert.equal(route?.algorithm, 'test-romanization');
});

test('limits building translation helpers to address object fields', () => {
  assert.equal(isAddressBuildingField('buildingName'), true);
  assert.equal(isAddressBuildingField('landmark'), true);
  assert.equal(isAddressBuildingField('recipient'), false);
  assert.equal(isAddressBuildingField('postcode'), false);
});

test('translates configured fields with common trimming and route handling', async () => {
  const result = await translateConfiguredAddressField({
    countryCode: 'ZZ',
    fieldKey: 'city',
    text: '  የሙከራ ከተማ  ',
    targetLanguage: 'en',
    profiles,
    topologyByLanguage,
    englishTopology: 'latin-address',
    normalizeEnglish: text => (text.includes('የሙከራ') ? 'Test City' : ''),
  });

  assert.equal(result?.text, 'Test City');
  assert.equal(result?.route.mode, 'english');
});
