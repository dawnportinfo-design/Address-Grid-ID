import assert from 'node:assert/strict';
import { describe,it } from 'node:test';

import { chooseCommonAddressTranslationRoute,translateAddressFieldByRoute } from './addressTranslationRouteCore';

describe('chooseCommonAddressTranslationRoute', () => {
  it('keeps the common route priority stable', () => {
    assert.deepEqual(
      chooseCommonAddressTranslationRoute({
        sourceLanguage: 'fr',
        targetLanguage: 'fr',
        sourceTopology: 'latin-romance',
        targetTopology: 'latin-romance',
        englishAlgorithm: 'french-international',
        englishTopology: 'latin-address',
      }),
      {
        mode: 'identity',
        sourceTopology: 'latin-romance',
        targetTopology: 'latin-romance',
        algorithm: 'same-topology-mt',
      },
    );

    assert.deepEqual(
      chooseCommonAddressTranslationRoute({
        sourceLanguage: 'fr',
        targetLanguage: 'en',
        sourceTopology: 'latin-romance',
        targetTopology: 'latin-address',
        englishAlgorithm: 'french-international',
        englishTopology: 'latin-address',
      }),
      {
        mode: 'english',
        sourceTopology: 'latin-romance',
        targetTopology: 'latin-address',
        pivotLanguage: 'en',
        algorithm: 'french-international',
      },
    );

    assert.deepEqual(
      chooseCommonAddressTranslationRoute({
        sourceLanguage: 'en',
        targetLanguage: 'fr',
        sourceTopology: 'latin-address',
        targetTopology: 'latin-romance',
        englishAlgorithm: 'french-international',
        englishTopology: 'latin-address',
      }),
      {
        mode: 'english-pivot',
        sourceTopology: 'latin-address',
        targetTopology: 'latin-romance',
        pivotLanguage: 'en',
        algorithm: 'french-international',
      },
    );

    assert.deepEqual(
      chooseCommonAddressTranslationRoute({
        sourceLanguage: 'fr',
        targetLanguage: 'it',
        sourceTopology: 'latin-romance',
        targetTopology: 'latin-romance',
        englishAlgorithm: 'swiss-quadrilingual',
        englishTopology: 'latin-address',
      }),
      {
        mode: 'direct-native',
        sourceTopology: 'latin-romance',
        targetTopology: 'latin-romance',
        algorithm: 'same-topology-mt',
      },
    );
  });

  it('supports script conversion and explicit same-family native routes', () => {
    assert.deepEqual(
      chooseCommonAddressTranslationRoute({
        sourceLanguage: 'zh-Hans',
        targetLanguage: 'zh-Hant',
        sourceTopology: 'sinitic-hanzi',
        targetTopology: 'sinitic-hanzi',
        englishAlgorithm: 'hanyu-pinyin',
        englishTopology: 'latin-address',
        scriptConversion: true,
      }),
      {
        mode: 'script-conversion',
        sourceTopology: 'sinitic-hanzi',
        targetTopology: 'sinitic-hanzi',
        algorithm: 'script-conversion',
      },
    );

    assert.deepEqual(
      chooseCommonAddressTranslationRoute({
        sourceLanguage: 'es',
        targetLanguage: 'pt',
        sourceTopology: 'latin-spanish',
        targetTopology: 'latin-portuguese',
        englishAlgorithm: 'multilingual-international',
        englishTopology: 'latin-address',
        directNative: true,
      }),
      {
        mode: 'direct-native',
        sourceTopology: 'latin-spanish',
        targetTopology: 'latin-portuguese',
        algorithm: 'same-topology-mt',
      },
    );
  });
});

describe('translateAddressFieldByRoute', () => {
  it('runs identity, English normalization, direct native, and English pivot routes', async () => {
    const route = chooseCommonAddressTranslationRoute({
      sourceLanguage: 'fr',
      targetLanguage: 'en',
      sourceTopology: 'latin-romance',
      targetTopology: 'latin-address',
      englishAlgorithm: 'french-international',
      englishTopology: 'latin-address',
    });

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: 'Rue de Lyon',
        route,
        sourceLanguage: 'fr',
        targetLanguage: 'en',
        normalizeEnglish: text => text.replace('Rue', 'Street'),
      }),
      { text: 'Street de Lyon', route },
    );

    const directRoute = chooseCommonAddressTranslationRoute({
      sourceLanguage: 'fr',
      targetLanguage: 'it',
      sourceTopology: 'latin-romance',
      targetTopology: 'latin-romance',
      englishAlgorithm: 'swiss-quadrilingual',
      englishTopology: 'latin-address',
    });

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: 'Rue',
        route: directRoute,
        sourceLanguage: 'fr',
        targetLanguage: 'it',
        normalizeEnglish: text => text,
        translator: async input => `${input.source}->${input.target}:${input.text}`,
      }),
      { text: 'fr->it:Rue', route: directRoute },
    );

    const pivotRoute = chooseCommonAddressTranslationRoute({
      sourceLanguage: 'ar',
      targetLanguage: 'he',
      sourceTopology: 'arabic-abjad',
      targetTopology: 'hebrew-abjad',
      englishAlgorithm: 'levant-bilingual',
      englishTopology: 'latin-address',
    });

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: 'شارع',
        route: pivotRoute,
        sourceLanguage: 'ar',
        targetLanguage: 'he',
        normalizeEnglish: () => 'Street',
        translator: async input => `${input.source}->${input.target}:${input.text}`,
      }),
      { text: 'en->he:Street', route: pivotRoute },
    );
  });

  it('handles script conversion and English identity normalization hooks', async () => {
    const scriptRoute = chooseCommonAddressTranslationRoute({
      sourceLanguage: 'zh-Hans',
      targetLanguage: 'zh-Hant',
      sourceTopology: 'sinitic-hanzi',
      targetTopology: 'sinitic-hanzi',
      englishAlgorithm: 'hanyu-pinyin',
      englishTopology: 'latin-address',
      scriptConversion: true,
    });

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: '汉字',
        route: scriptRoute,
        sourceLanguage: 'zh-Hans',
        targetLanguage: 'zh-Hant',
        normalizeEnglish: text => text,
        convertScript: text => `traditional:${text}`,
      }),
      { text: 'traditional:汉字', route: scriptRoute },
    );

    const identityRoute = chooseCommonAddressTranslationRoute({
      sourceLanguage: 'en',
      targetLanguage: 'en',
      sourceTopology: 'english-address',
      targetTopology: 'english-address',
      englishAlgorithm: 'domestic-english',
      englishTopology: 'latin-address',
    });

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: 'Aotearoa',
        route: identityRoute,
        sourceLanguage: 'en',
        targetLanguage: 'en',
        normalizeEnglish: () => 'New Zealand',
        normalizeEnglishIdentity: true,
      }),
      { text: 'New Zealand', route: identityRoute },
    );
  });

  it('falls back to a configured open-source translator when local English normalization cannot cover a place name', async () => {
    const route = chooseCommonAddressTranslationRoute({
      sourceLanguage: 'am',
      targetLanguage: 'en',
      sourceTopology: 'ethiopic-abugida',
      targetTopology: 'latin-address',
      englishAlgorithm: 'ethiopia-amharic-english-address',
      englishTopology: 'latin-address',
    });
    const calls: Array<{ text: string; source?: string; target: string }> = [];

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: 'ባህር ዳር',
        route,
        sourceLanguage: 'am',
        targetLanguage: 'en',
        normalizeEnglish: () => '',
        translator: async input => {
          calls.push(input);
          return 'Bahir Dar';
        },
      }),
      { text: 'Bahir Dar', route },
    );
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], { text: 'ባህር ዳር', source: 'am', target: 'en' });

    assert.deepEqual(
      await translateAddressFieldByRoute({
        text: 'မြောက်ဥက္ကလာပ',
        route,
        sourceLanguage: 'my',
        targetLanguage: 'en',
        normalizeEnglish: text => text,
        translator: async input => {
          calls.push(input);
          return 'North Okkalapa';
        },
      }),
      { text: 'North Okkalapa', route },
    );
    const lastCall = calls.at(-1);
    assert.ok(lastCall);
    assert.deepEqual(lastCall, { text: 'မြောက်ဥက္ကလာပ', source: 'my', target: 'en' });
  });
});
