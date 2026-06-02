import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseNorthernEuropeAddressTranslationRoute,
getNorthernEuropeAddressTranslationProfile,
translateNorthernEuropeAddressField,
} from './northernEuropeAddressTranslation';

test('classifies Nordic, Baltic, and northern autonomous address markets by algorithm and topology', () => {
  assert.equal(getNorthernEuropeAddressTranslationProfile('SE')?.englishAlgorithm, 'swedish-posten-international-shipping');
  assert.equal(getNorthernEuropeAddressTranslationProfile('NO')?.englishAlgorithm, 'norwegian-posten-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('DK')?.englishAlgorithm, 'danish-postnord-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('FI')?.englishAlgorithm, 'finnish-swedish-posti-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('LV')?.englishAlgorithm, 'latvian-pasts-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('EE')?.englishAlgorithm, 'estonian-eesti-post-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('LT')?.englishAlgorithm, 'lithuanian-post-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('IS')?.englishAlgorithm, 'icelandic-posturinn-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('AX')?.englishAlgorithm, 'aland-swedish-finnish-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('GL')?.englishAlgorithm, 'greenland-kalaallisut-danish-address');
  assert.equal(getNorthernEuropeAddressTranslationProfile('FO')?.englishAlgorithm, 'faroe-faroese-danish-address');
});

test('allows Nordic native-to-English and domestic multilingual routes only', () => {
  assert.deepEqual(
    chooseNorthernEuropeAddressTranslationRoute({
      countryCode: 'SE',
      sourceLanguage: 'sv',
      targetLanguage: 'en',
    }),
    {
      mode: 'english',
      sourceTopology: 'latin-north-germanic',
      targetTopology: 'latin-address',
      pivotLanguage: 'en',
      algorithm: 'swedish-posten-international-shipping',
    },
  );

  assert.deepEqual(
    chooseNorthernEuropeAddressTranslationRoute({
      countryCode: 'FI',
      sourceLanguage: 'fi',
      targetLanguage: 'sv',
    }),
    {
      mode: 'english-pivot',
      sourceTopology: 'latin-finnic',
      targetTopology: 'latin-north-germanic',
      pivotLanguage: 'en',
      algorithm: 'finnish-swedish-posti-address',
    },
  );

  assert.equal(
    chooseNorthernEuropeAddressTranslationRoute({
      countryCode: 'DK',
      sourceLanguage: 'da',
      targetLanguage: 'fr',
    }),
    null,
  );
});

test('translates representative Nordic and Baltic native address fields to English', async () => {
  const cases = [
    ['SE', 'sv', 'state', 'Sverige', 'Sweden', 'swedish-posten-international-shipping'],
    ['SE', 'sv', 'city', 'Göteborg', 'Gothenburg', 'swedish-posten-international-shipping'],
    ['SE', 'sv', 'street', 'Gata', 'Street', 'swedish-posten-international-shipping'],
    ['NO', 'no', 'state', 'Norge', 'Norway', 'norwegian-posten-address'],
    ['NO', 'no', 'street', 'Gate', 'Street', 'norwegian-posten-address'],
    ['DK', 'da', 'state', 'Danmark', 'Denmark', 'danish-postnord-address'],
    ['DK', 'da', 'city', 'København', 'Copenhagen', 'danish-postnord-address'],
    ['FI', 'fi', 'state', 'Suomi', 'Finland', 'finnish-swedish-posti-address'],
    ['FI', 'fi', 'street', 'Katu', 'Street', 'finnish-swedish-posti-address'],
    ['LV', 'lv', 'state', 'Latvija', 'Latvia', 'latvian-pasts-address'],
    ['LV', 'lv', 'city', 'Rīga', 'Riga', 'latvian-pasts-address'],
    ['EE', 'et', 'state', 'Eesti', 'Estonia', 'estonian-eesti-post-address'],
    ['EE', 'et', 'street', 'Tänav', 'Street', 'estonian-eesti-post-address'],
    ['LT', 'lt', 'state', 'Lietuva', 'Lithuania', 'lithuanian-post-address'],
    ['LT', 'lt', 'street', 'Gatvė', 'Street', 'lithuanian-post-address'],
    ['IS', 'is', 'state', 'Ísland', 'Iceland', 'icelandic-posturinn-address'],
    ['IS', 'is', 'city', 'Reykjavík', 'Reykjavik', 'icelandic-posturinn-address'],
    ['AX', 'sv', 'state', 'Åland', 'Aland Islands', 'aland-swedish-finnish-address'],
    ['GL', 'kl', 'state', 'Kalaallit Nunaat', 'Greenland', 'greenland-kalaallisut-danish-address'],
    ['FO', 'fo', 'state', 'Føroyar', 'Faroe Islands', 'faroe-faroese-danish-address'],
  ] as const;

  for (const [countryCode, sourceLanguage, fieldKey, text, expected, algorithm] of cases) {
    const translated = await translateNorthernEuropeAddressField({
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
