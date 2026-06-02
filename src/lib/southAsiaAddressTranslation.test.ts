import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseSouthAsiaAddressTranslationRoute,
getSouthAsiaAddressTranslationProfile,
translateSouthAsiaAddressField,
} from './southAsiaAddressTranslation';

test('classifies South Asian countries by domestic address language algorithm and topology', () => {
  assert.equal(getSouthAsiaAddressTranslationProfile('IN')?.englishAlgorithm, 'india-multilingual-romanization');
  assert.equal(getSouthAsiaAddressTranslationProfile('PK')?.englishAlgorithm, 'pakistan-urdu-romanization');
  assert.equal(getSouthAsiaAddressTranslationProfile('BD')?.englishAlgorithm, 'bangladesh-bengali-romanization');
  assert.equal(getSouthAsiaAddressTranslationProfile('NP')?.englishAlgorithm, 'nepal-devanagari-romanization');
  assert.equal(getSouthAsiaAddressTranslationProfile('LK')?.englishAlgorithm, 'sri-lanka-sinhala-tamil');
  assert.equal(getSouthAsiaAddressTranslationProfile('BT')?.englishAlgorithm, 'bhutan-dzongkha-romanization');
  assert.equal(getSouthAsiaAddressTranslationProfile('MV')?.englishAlgorithm, 'maldives-thaana-romanization');
  assert.equal(getSouthAsiaAddressTranslationProfile('AF')?.englishAlgorithm, 'afghanistan-pashto-dari');
});

test('allows only South Asian domestic language pairs and native-to-English routes', () => {
  assert.deepEqual(
    chooseSouthAsiaAddressTranslationRoute({
      countryCode: 'IN',
      sourceLanguage: 'hi',
      targetLanguage: 'en',
    }),
    {
      mode: 'english',
      sourceTopology: 'indic-abugida',
      targetTopology: 'latin-address',
      pivotLanguage: 'en',
      algorithm: 'india-multilingual-romanization',
    },
  );

  assert.equal(
    chooseSouthAsiaAddressTranslationRoute({
      countryCode: 'IN',
      sourceLanguage: 'hi',
      targetLanguage: 'bn',
    })?.mode,
    'direct-native',
  );

  assert.equal(
    chooseSouthAsiaAddressTranslationRoute({
      countryCode: 'IN',
      sourceLanguage: 'ur',
      targetLanguage: 'hi',
    })?.mode,
    'english-pivot',
  );

  assert.equal(
    chooseSouthAsiaAddressTranslationRoute({
      countryCode: 'LK',
      sourceLanguage: 'si',
      targetLanguage: 'ta',
    })?.mode,
    'direct-native',
  );

  assert.equal(
    chooseSouthAsiaAddressTranslationRoute({
      countryCode: 'BD',
      sourceLanguage: 'bn',
      targetLanguage: 'fr',
    }),
    null,
  );
});

test('translates representative South Asian native address fields to English', async () => {
  const cases = [
    ['IN', 'hi', 'city', 'नई दिल्ली', 'New Delhi', 'india-multilingual-romanization'],
    ['PK', 'ur', 'city', 'اسلام آباد', 'Islamabad', 'pakistan-urdu-romanization'],
    ['BD', 'bn', 'city', 'ঢাকা', 'Dhaka', 'bangladesh-bengali-romanization'],
    ['NP', 'ne', 'city', 'काठमाडौं', 'Kathmandu', 'nepal-devanagari-romanization'],
    ['LK', 'si', 'city', 'කොළඹ', 'Colombo', 'sri-lanka-sinhala-tamil'],
    ['BT', 'dz', 'city', 'ཐིམ་ཕུ', 'Thimphu', 'bhutan-dzongkha-romanization'],
    ['MV', 'dv', 'city', 'މާލެ', 'Male', 'maldives-thaana-romanization'],
    ['AF', 'fa', 'city', 'کابل', 'Kabul', 'afghanistan-pashto-dari'],
  ] as const;

  for (const [countryCode, sourceLanguage, fieldKey, text, expected, algorithm] of cases) {
    const translated = await translateSouthAsiaAddressField({
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

test('uses direct native translation for India same-topology language tabs', async () => {
  const calls: string[] = [];
  const translated = await translateSouthAsiaAddressField({
    countryCode: 'IN',
    fieldKey: 'city',
    text: 'मुंबई',
    sourceLanguage: 'hi',
    targetLanguage: 'bn',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'মুম্বই';
    },
  });

  assert.equal(translated?.text, 'মুম্বই');
  assert.equal(translated?.route.mode, 'direct-native');
  assert.deepEqual(calls, ['hi->bn:मुंबई']);
});

test('uses English pivot for South Asian domestic languages with different topology', async () => {
  const calls: string[] = [];
  const translated = await translateSouthAsiaAddressField({
    countryCode: 'IN',
    fieldKey: 'city',
    text: 'لکھنؤ',
    sourceLanguage: 'ur',
    targetLanguage: 'hi',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'लखनऊ';
    },
  });

  assert.equal(translated?.text, 'लखनऊ');
  assert.equal(translated?.route.mode, 'english-pivot');
  assert.deepEqual(calls, ['en->hi:Lucknow']);
});

test('uses direct native translation for Afghanistan Pashto and Dari address tabs', async () => {
  const calls: string[] = [];
  const translated = await translateSouthAsiaAddressField({
    countryCode: 'AF',
    fieldKey: 'city',
    text: 'کابل',
    sourceLanguage: 'ps',
    targetLanguage: 'fa',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'کابل';
    },
  });

  assert.equal(translated?.text, 'کابل');
  assert.equal(translated?.route.mode, 'direct-native');
  assert.deepEqual(calls, ['ps->fa:کابل']);
});
