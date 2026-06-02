import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseCentralAsiaAddressTranslationRoute,
getCentralAsiaAddressTranslationProfile,
translateCentralAsiaAddressField,
} from './centralAsiaAddressTranslation';

test('classifies Central Asian countries by domestic address language algorithm and topology', () => {
  assert.equal(getCentralAsiaAddressTranslationProfile('KZ')?.englishAlgorithm, 'kazakh-russian-bilingual-romanization');
  assert.equal(getCentralAsiaAddressTranslationProfile('UZ')?.englishAlgorithm, 'uzbek-latin-cyrillic-romanization');
  assert.equal(getCentralAsiaAddressTranslationProfile('TM')?.englishAlgorithm, 'turkmen-latin-romanization');
  assert.equal(getCentralAsiaAddressTranslationProfile('KG')?.englishAlgorithm, 'kyrgyz-russian-bilingual-romanization');
  assert.equal(getCentralAsiaAddressTranslationProfile('TJ')?.englishAlgorithm, 'tajik-russian-bilingual-romanization');
});

test('allows only Central Asian domestic language pairs and native-to-English routes', () => {
  assert.deepEqual(
    chooseCentralAsiaAddressTranslationRoute({
      countryCode: 'KZ',
      sourceLanguage: 'kk',
      targetLanguage: 'en',
    }),
    {
      mode: 'english',
      sourceTopology: 'cyrillic-address',
      targetTopology: 'latin-address',
      pivotLanguage: 'en',
      algorithm: 'kazakh-russian-bilingual-romanization',
    },
  );

  assert.equal(
    chooseCentralAsiaAddressTranslationRoute({
      countryCode: 'KZ',
      sourceLanguage: 'kk',
      targetLanguage: 'ru',
    })?.mode,
    'direct-native',
  );

  assert.equal(
    chooseCentralAsiaAddressTranslationRoute({
      countryCode: 'UZ',
      sourceLanguage: 'uz',
      targetLanguage: 'ru',
    })?.mode,
    'english-pivot',
  );

  assert.equal(
    chooseCentralAsiaAddressTranslationRoute({
      countryCode: 'TM',
      sourceLanguage: 'tk',
      targetLanguage: 'fr',
    }),
    null,
  );
});

test('translates representative Central Asian native address fields to English', async () => {
  const cases = [
    ['KZ', 'kk', 'city', 'Астана', 'Astana', 'kazakh-russian-bilingual-romanization'],
    ['KZ', 'kk', 'street', 'Көше', 'Street', 'kazakh-russian-bilingual-romanization'],
    ['UZ', 'uz', 'city', 'Toshkent', 'Tashkent', 'uzbek-latin-cyrillic-romanization'],
    ['UZ', 'uz', 'street', "Ko'cha", 'Street', 'uzbek-latin-cyrillic-romanization'],
    ['TM', 'tk', 'city', 'Aşgabat', 'Ashgabat', 'turkmen-latin-romanization'],
    ['KG', 'ky', 'city', 'Бишкек', 'Bishkek', 'kyrgyz-russian-bilingual-romanization'],
    ['TJ', 'tg', 'city', 'Душанбе', 'Dushanbe', 'tajik-russian-bilingual-romanization'],
  ] as const;

  for (const [countryCode, sourceLanguage, fieldKey, text, expected, algorithm] of cases) {
    const translated = await translateCentralAsiaAddressField({
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

test('uses direct native translation for Central Asian Cyrillic domestic tabs', async () => {
  const calls: string[] = [];
  const translated = await translateCentralAsiaAddressField({
    countryCode: 'KZ',
    fieldKey: 'city',
    text: 'Астана',
    sourceLanguage: 'kk',
    targetLanguage: 'ru',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'Астана';
    },
  });

  assert.equal(translated?.text, 'Астана');
  assert.equal(translated?.route.mode, 'direct-native');
  assert.deepEqual(calls, ['kk->ru:Астана']);
});

test('uses English pivot when Central Asian domestic tabs cross script topology', async () => {
  const calls: string[] = [];
  const translated = await translateCentralAsiaAddressField({
    countryCode: 'UZ',
    fieldKey: 'city',
    text: 'Toshkent',
    sourceLanguage: 'uz',
    targetLanguage: 'ru',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'Ташкент';
    },
  });

  assert.equal(translated?.text, 'Ташкент');
  assert.equal(translated?.route.mode, 'english-pivot');
  assert.deepEqual(calls, ['en->ru:Tashkent']);
});
