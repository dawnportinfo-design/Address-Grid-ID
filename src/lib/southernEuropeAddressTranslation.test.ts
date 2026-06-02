import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseSouthernEuropeAddressTranslationRoute,
getSouthernEuropeAddressTranslationProfile,
translateSouthernEuropeAddressField,
} from './southernEuropeAddressTranslation';

test('classifies Southern Europe address markets by domestic language algorithm and topology', () => {
  assert.equal(getSouthernEuropeAddressTranslationProfile('IT')?.englishAlgorithm, 'italian-poste-italiane-international-shipping');
  assert.equal(getSouthernEuropeAddressTranslationProfile('ES')?.englishAlgorithm, 'spain-multilingual-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('PT')?.englishAlgorithm, 'portugal-ctt-international-shipping');
  assert.equal(getSouthernEuropeAddressTranslationProfile('GR')?.englishAlgorithm, 'greek-elta-romanization');
  assert.equal(getSouthernEuropeAddressTranslationProfile('MT')?.englishAlgorithm, 'malta-maltese-english-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('SM')?.englishAlgorithm, 'san-marino-italian-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('MC')?.englishAlgorithm, 'monaco-french-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('VA')?.englishAlgorithm, 'vatican-italian-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('AD')?.englishAlgorithm, 'andorra-catalan-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('CY')?.englishAlgorithm, 'cyprus-greek-turkish-bilingual-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('ES_BAL')?.englishAlgorithm, 'spain-balearic-catalan-spanish-address');
  assert.equal(getSouthernEuropeAddressTranslationProfile('PT_MAD')?.englishAlgorithm, 'portugal-madeira-address');
});

test('allows only Southern Europe domestic language pairs and native-to-English routes', () => {
  assert.deepEqual(
    chooseSouthernEuropeAddressTranslationRoute({
      countryCode: 'ES',
      sourceLanguage: 'es',
      targetLanguage: 'en',
    }),
    {
      mode: 'english',
      sourceTopology: 'latin-romance',
      targetTopology: 'latin-address',
      pivotLanguage: 'en',
      algorithm: 'spain-multilingual-address',
    },
  );

  assert.equal(
    chooseSouthernEuropeAddressTranslationRoute({
      countryCode: 'ES',
      sourceLanguage: 'es',
      targetLanguage: 'ca',
    })?.mode,
    'direct-native',
  );

  assert.equal(
    chooseSouthernEuropeAddressTranslationRoute({
      countryCode: 'CY',
      sourceLanguage: 'el',
      targetLanguage: 'tr',
    })?.mode,
    'english-pivot',
  );

  assert.equal(
    chooseSouthernEuropeAddressTranslationRoute({
      countryCode: 'IT',
      sourceLanguage: 'it',
      targetLanguage: 'fr',
    }),
    null,
  );
});

test('translates representative Southern Europe native address fields to English', async () => {
  const cases = [
    ['IT', 'it', 'city', 'Roma', 'Rome', 'italian-poste-italiane-international-shipping'],
    ['IT', 'it', 'street', 'Via', 'Street', 'italian-poste-italiane-international-shipping'],
    ['ES', 'es', 'state', 'España', 'Spain', 'spain-multilingual-address'],
    ['ES', 'es', 'street', 'Calle', 'Street', 'spain-multilingual-address'],
    ['PT', 'pt', 'city', 'Lisboa', 'Lisbon', 'portugal-ctt-international-shipping'],
    ['GR', 'el', 'city', 'Αθήνα', 'Athens', 'greek-elta-romanization'],
    ['MT', 'mt', 'street', 'Triq', 'Street', 'malta-maltese-english-address'],
    ['SM', 'it', 'city', 'Città di San Marino', 'San Marino City', 'san-marino-italian-address'],
    ['MC', 'fr', 'city', 'Monaco', 'Monaco', 'monaco-french-address'],
    ['VA', 'it', 'state', 'Città del Vaticano', 'Vatican City', 'vatican-italian-address'],
    ['AD', 'ca', 'city', 'Andorra la Vella', 'Andorra la Vella', 'andorra-catalan-address'],
    ['CY', 'el', 'city', 'Λευκωσία', 'Nicosia', 'cyprus-greek-turkish-bilingual-address'],
    ['ES_BAL', 'ca', 'state', 'Illes Balears', 'Balearic Islands', 'spain-balearic-catalan-spanish-address'],
    ['ES_CAN', 'es', 'state', 'Islas Canarias', 'Canary Islands', 'spain-canary-spanish-address'],
    ['PT_AZO', 'pt', 'state', 'Açores', 'Azores', 'portugal-azores-address'],
    ['PT_MAD', 'pt', 'state', 'Região Autónoma da Madeira', 'Madeira', 'portugal-madeira-address'],
  ] as const;

  for (const [countryCode, sourceLanguage, fieldKey, text, expected, algorithm] of cases) {
    const translated = await translateSouthernEuropeAddressField({
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

test('uses direct native translation for same-topology Spain address tabs', async () => {
  const calls: string[] = [];
  const catalan = await translateSouthernEuropeAddressField({
    countryCode: 'ES',
    fieldKey: 'street',
    text: 'Calle Mayor',
    sourceLanguage: 'es',
    targetLanguage: 'ca',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'Carrer Major';
    },
  });

  assert.equal(catalan?.text, 'Carrer Major');
  assert.equal(catalan?.route.mode, 'direct-native');
  assert.deepEqual(calls, ['es->ca:Calle Mayor']);
});

test('uses English pivot for Cyprus Greek and Turkish address tabs', async () => {
  const calls: string[] = [];
  const turkish = await translateSouthernEuropeAddressField({
    countryCode: 'CY',
    fieldKey: 'city',
    text: 'Λευκωσία',
    sourceLanguage: 'el',
    targetLanguage: 'tr',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'Lefkoşa';
    },
  });

  assert.equal(turkish?.text, 'Lefkoşa');
  assert.equal(turkish?.route.mode, 'english-pivot');
  assert.deepEqual(calls, ['en->tr:Nicosia']);
});
