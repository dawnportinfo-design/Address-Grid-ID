import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
chooseWestAsiaAddressTranslationRoute,
getWestAsiaAddressTranslationProfile,
translateWestAsiaAddressField,
} from './westAsiaAddressTranslation';

test('classifies West Asian countries by domestic address language algorithm and topology', () => {
  assert.equal(getWestAsiaAddressTranslationProfile('TR')?.englishAlgorithm, 'turkish-standard-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('IR')?.englishAlgorithm, 'persian-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('IQ')?.englishAlgorithm, 'arabic-iraq-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('SY')?.englishAlgorithm, 'arabic-syria-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('LB')?.englishAlgorithm, 'arabic-lebanon-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('JO')?.englishAlgorithm, 'arabic-jordan-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('IL')?.englishAlgorithm, 'hebrew-arabic-bilingual-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('PS')?.englishAlgorithm, 'arabic-palestine-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('SA')?.englishAlgorithm, 'arabic-saudi-romanization');
  assert.equal(getWestAsiaAddressTranslationProfile('AE')?.englishAlgorithm, 'gulf-arabic-international-shipping');
  assert.equal(getWestAsiaAddressTranslationProfile('YE')?.englishAlgorithm, 'arabic-yemen-romanization');
});

test('allows only West Asian domestic language pairs and native-to-English routes', () => {
  assert.deepEqual(
    chooseWestAsiaAddressTranslationRoute({
      countryCode: 'JO',
      sourceLanguage: 'ar',
      targetLanguage: 'en',
    }),
    {
      mode: 'english',
      sourceTopology: 'arabic-abjad',
      targetTopology: 'latin-address',
      pivotLanguage: 'en',
      algorithm: 'arabic-jordan-romanization',
    },
  );

  assert.equal(
    chooseWestAsiaAddressTranslationRoute({
      countryCode: 'IL',
      sourceLanguage: 'he',
      targetLanguage: 'ar',
    })?.mode,
    'english-pivot',
  );

  assert.equal(
    chooseWestAsiaAddressTranslationRoute({
      countryCode: 'TR',
      sourceLanguage: 'tr',
      targetLanguage: 'ar',
    }),
    null,
  );

  assert.equal(
    chooseWestAsiaAddressTranslationRoute({
      countryCode: 'IR',
      sourceLanguage: 'fa',
      targetLanguage: 'fr',
    }),
    null,
  );
});

test('translates representative West Asian native address fields to English', async () => {
  const cases = [
    ['TR', 'tr', 'city', 'İstanbul', 'Istanbul', 'turkish-standard-romanization'],
    ['IR', 'fa', 'city', 'تهران', 'Tehran', 'persian-romanization'],
    ['IQ', 'ar', 'city', 'بغداد', 'Baghdad', 'arabic-iraq-romanization'],
    ['SY', 'ar', 'city', 'دمشق', 'Damascus', 'arabic-syria-romanization'],
    ['LB', 'ar', 'city', 'بيروت', 'Beirut', 'arabic-lebanon-romanization'],
    ['JO', 'ar', 'city', 'عمان', 'Amman', 'arabic-jordan-romanization'],
    ['IL', 'he', 'city', 'תל אביב', 'Tel Aviv', 'hebrew-arabic-bilingual-romanization'],
    ['PS', 'ar', 'city', 'رام الله', 'Ramallah', 'arabic-palestine-romanization'],
    ['SA', 'ar', 'city', 'الرياض', 'Riyadh', 'arabic-saudi-romanization'],
    ['AE', 'ar', 'city', 'دبي', 'Dubai', 'gulf-arabic-international-shipping'],
    ['QA', 'ar', 'city', 'الدوحة', 'Doha', 'gulf-arabic-international-shipping'],
    ['BH', 'ar', 'city', 'المنامة', 'Manama', 'gulf-arabic-international-shipping'],
    ['KW', 'ar', 'city', 'مدينة الكويت', 'Kuwait City', 'gulf-arabic-international-shipping'],
    ['OM', 'ar', 'city', 'مسقط', 'Muscat', 'gulf-arabic-international-shipping'],
    ['YE', 'ar', 'city', 'صنعاء', 'Sanaa', 'arabic-yemen-romanization'],
  ] as const;

  for (const [countryCode, sourceLanguage, fieldKey, text, expected, algorithm] of cases) {
    const translated = await translateWestAsiaAddressField({
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

test('normalizes West Asian address words for English shipping display', async () => {
  const translated = await translateWestAsiaAddressField({
    countryCode: 'SA',
    fieldKey: 'street',
    text: 'الشارع',
    sourceLanguage: 'ar',
    targetLanguage: 'en',
  });

  assert.equal(translated?.text, 'Street');
});

test('uses English pivot for Israel Hebrew and Arabic address tabs', async () => {
  const calls: string[] = [];
  const translated = await translateWestAsiaAddressField({
    countryCode: 'IL',
    fieldKey: 'city',
    text: 'תל אביב',
    sourceLanguage: 'he',
    targetLanguage: 'ar',
    translator: async ({ text, source, target }) => {
      calls.push(`${source}->${target}:${text}`);
      return 'تل أبيب';
    },
  });

  assert.equal(translated?.text, 'تل أبيب');
  assert.equal(translated?.route.mode, 'english-pivot');
  assert.deepEqual(calls, ['en->ar:Tel Aviv']);
});
