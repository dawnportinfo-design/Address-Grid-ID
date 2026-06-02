import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseCentralEuropeAddressTranslationRoute,
getCentralEuropeAddressTranslationProfile,
translateCentralEuropeAddressField,
} from './centralEuropeAddressTranslation';

test('classifies Central Europe address markets by domestic language algorithm and topology', () => {
  assert.equal(getCentralEuropeAddressTranslationProfile('PL')?.englishAlgorithm, 'polish-poczta-polska-international-shipping');
  assert.equal(getCentralEuropeAddressTranslationProfile('CZ')?.englishAlgorithm, 'czech-posta-address');
  assert.equal(getCentralEuropeAddressTranslationProfile('SK')?.englishAlgorithm, 'slovak-posta-address');
  assert.equal(getCentralEuropeAddressTranslationProfile('HU')?.englishAlgorithm, 'hungarian-magyar-posta-address');
  assert.equal(getCentralEuropeAddressTranslationProfile('SI')?.englishAlgorithm, 'slovenian-posta-slovenije-address');
  assert.equal(getCentralEuropeAddressTranslationProfile('HR')?.englishAlgorithm, 'croatian-hrvatska-posta-address');
});

test('allows only Central Europe native-to-English routes for single-language address markets', () => {
  assert.deepEqual(
    chooseCentralEuropeAddressTranslationRoute({
      countryCode: 'PL',
      sourceLanguage: 'pl',
      targetLanguage: 'en',
    }),
    {
      mode: 'english',
      sourceTopology: 'latin-slavic',
      targetTopology: 'latin-address',
      pivotLanguage: 'en',
      algorithm: 'polish-poczta-polska-international-shipping',
    },
  );

  assert.equal(
    chooseCentralEuropeAddressTranslationRoute({
      countryCode: 'CZ',
      sourceLanguage: 'cs',
      targetLanguage: 'sk',
    }),
    null,
  );

  assert.equal(
    chooseCentralEuropeAddressTranslationRoute({
      countryCode: 'HU',
      sourceLanguage: 'hu',
      targetLanguage: 'de',
    }),
    null,
  );
});

test('translates representative Central Europe native address fields to English', async () => {
  const cases = [
    ['PL', 'pl', 'state', 'Polska', 'Poland', 'polish-poczta-polska-international-shipping'],
    ['PL', 'pl', 'city', 'Warszawa', 'Warsaw', 'polish-poczta-polska-international-shipping'],
    ['PL', 'pl', 'street', 'Ulica', 'Street', 'polish-poczta-polska-international-shipping'],
    ['CZ', 'cs', 'city', 'Praha', 'Prague', 'czech-posta-address'],
    ['CZ', 'cs', 'street', 'Ulice', 'Street', 'czech-posta-address'],
    ['SK', 'sk', 'state', 'Slovensko', 'Slovakia', 'slovak-posta-address'],
    ['SK', 'sk', 'city', 'Košice', 'Kosice', 'slovak-posta-address'],
    ['HU', 'hu', 'state', 'Magyarország', 'Hungary', 'hungarian-magyar-posta-address'],
    ['HU', 'hu', 'street', 'Utca', 'Street', 'hungarian-magyar-posta-address'],
    ['SI', 'sl', 'state', 'Slovenija', 'Slovenia', 'slovenian-posta-slovenije-address'],
    ['SI', 'sl', 'city', 'Ljubljana', 'Ljubljana', 'slovenian-posta-slovenije-address'],
    ['HR', 'hr', 'state', 'Hrvatska', 'Croatia', 'croatian-hrvatska-posta-address'],
    ['HR', 'hr', 'city', 'Zagreb', 'Zagreb', 'croatian-hrvatska-posta-address'],
  ] as const;

  for (const [countryCode, sourceLanguage, fieldKey, text, expected, algorithm] of cases) {
    const translated = await translateCentralEuropeAddressField({
      countryCode,
      fieldKey,
      text,
      sourceLanguage,
      targetLanguage: 'en',
    });
    assert.equal(translated?.text, expected);
    assert.equal(translated?.route.algorithm, algorithm);
  }
});
