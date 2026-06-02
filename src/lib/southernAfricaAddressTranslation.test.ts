import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseSouthernAfricaAddressTranslationRoute,
getSouthernAfricaAddressTranslationProfile,
translateSouthernAfricaAddressField,
} from './southernAfricaAddressTranslation';

test('classifies Southern Africa address markets by delivery-language algorithm and topology', () => {
  assert.deepEqual(getSouthernAfricaAddressTranslationProfile('ZA'), {
    countryCode: 'ZA',
    nativeLanguages: ['en', 'af', 'zu', 'xh'],
    defaultLanguage: 'en',
    defaultTopology: 'english-address',
    englishAlgorithm: 'south-africa-multilingual-address',
  });
  assert.equal(getSouthernAfricaAddressTranslationProfile('MZ')?.englishAlgorithm, 'southern-africa-lusophone-international-shipping');
  assert.equal(getSouthernAfricaAddressTranslationProfile('KM')?.nativeLanguages.join(','), 'fr,ar');
  assert.equal(getSouthernAfricaAddressTranslationProfile('SC')?.defaultTopology, 'english-address');
});

test('allows Southern Africa native-to-English and domestic multilingual routes only', () => {
  assert.equal(
    chooseSouthernAfricaAddressTranslationRoute({
      countryCode: 'ZA',
      sourceLanguage: 'af',
      targetLanguage: 'zu',
    })?.mode,
    'english-pivot'
  );
  assert.equal(
    chooseSouthernAfricaAddressTranslationRoute({
      countryCode: 'LS',
      sourceLanguage: 'st',
      targetLanguage: 'en',
    })?.algorithm,
    'lesotho-english-sesotho-address'
  );
  assert.equal(
    chooseSouthernAfricaAddressTranslationRoute({
      countryCode: 'SC',
      sourceLanguage: 'fr',
      targetLanguage: 'crs',
    })?.mode,
    'english-pivot'
  );
  assert.equal(
    chooseSouthernAfricaAddressTranslationRoute({
      countryCode: 'MZ',
      sourceLanguage: 'pt',
      targetLanguage: 'de',
    }),
    null
  );
});

test('translates representative Southern Africa native address fields to English', async () => {
  assert.equal((await translateSouthernAfricaAddressField({
    countryCode: 'ZA',
    fieldKey: 'city',
    text: 'eGoli',
    sourceLanguage: 'zu',
    targetLanguage: 'en',
  }))?.text, 'Johannesburg');
  assert.equal((await translateSouthernAfricaAddressField({
    countryCode: 'ZA',
    fieldKey: 'state',
    text: 'Suid-Afrika',
    sourceLanguage: 'af',
    targetLanguage: 'en',
  }))?.text, 'South Africa');
  assert.equal((await translateSouthernAfricaAddressField({
    countryCode: 'MZ',
    fieldKey: 'country',
    text: 'Moçambique',
    sourceLanguage: 'pt',
    targetLanguage: 'en',
  }))?.text, 'Mozambique');
  assert.equal((await translateSouthernAfricaAddressField({
    countryCode: 'MU',
    fieldKey: 'country',
    text: 'Maurice',
    sourceLanguage: 'fr',
    targetLanguage: 'en',
  }))?.text, 'Mauritius');
  assert.equal((await translateSouthernAfricaAddressField({
    countryCode: 'KM',
    fieldKey: 'country',
    text: 'جزر القمر',
    sourceLanguage: 'ar',
    targetLanguage: 'en',
  }))?.text, 'Comoros');
  assert.equal((await translateSouthernAfricaAddressField({
    countryCode: 'SC',
    fieldKey: 'country',
    text: 'Sesel',
    sourceLanguage: 'crs',
    targetLanguage: 'en',
  }))?.text, 'Seychelles');
});

test('uses English pivot for South Africa and Indian Ocean multilingual address tabs', async () => {
  const calls: string[] = [];
  const translated = await translateSouthernAfricaAddressField({
    countryCode: 'ZA',
    fieldKey: 'city',
    text: 'eGoli',
    sourceLanguage: 'zu',
    targetLanguage: 'af',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return `${target}:${text}`;
    },
  });

  assert.equal(translated?.text, 'af:Johannesburg');
  assert.deepEqual(calls, ['en->af:Johannesburg']);
});
