import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
getAddressLanguageSpheresForCountry,
resolveCommonAddressLanguageAlgorithm,
verifySharedAddressAlgorithmForLanguage,
} from './addressLanguageSpheres';

test('major language spheres share common address algorithms across representative countries', () => {
  const cases: Array<[string, string[], string]> = [
    ['en', ['US', 'GB', 'CA', 'AU', 'NZ', 'IN', 'NG'], 'english-domestic-international-common'],
    ['es', ['ES', 'MX', 'AR', 'CO', 'PE'], 'latin-spanish-address-common'],
    ['fr', ['FR', 'BE', 'CH', 'SN', 'CI', 'CD'], 'latin-french-address-common'],
    ['ar', ['SA', 'EG', 'IQ', 'JO', 'MA'], 'arabic-abjad-address-common'],
    ['pt', ['PT', 'BR', 'AO', 'MZ'], 'latin-portuguese-address-common'],
    ['ru', ['RU', 'BY', 'KZ', 'KG'], 'cyrillic-russian-address-common'],
    ['de', ['DE', 'AT', 'CH', 'LI'], 'latin-german-address-common'],
    ['it', ['IT', 'CH', 'SM', 'VA'], 'latin-italian-address-common'],
    ['sw', ['TZ', 'KE', 'UG', 'CD'], 'latin-swahili-address-common'],
  ];

  for (const [language, countries, expectedAlgorithm] of cases) {
    const verified = verifySharedAddressAlgorithmForLanguage(language, countries);
    assert.equal(verified.shared, true, `${language} should share an algorithm`);
    assert.equal(verified.commonAlgorithm, expectedAlgorithm);
    assert.deepEqual(verified.missingCountries, []);
  }
});

test('Chinese sphere uses one script-aware common model with country-specific romanization overrides', () => {
  const mainland = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'CN',
    sourceLanguage: 'zh-Hans',
    targetLanguage: 'en',
  });
  const taiwan = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'TW',
    sourceLanguage: 'zh-Hant',
    targetLanguage: 'en',
  });
  const singapore = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'SG',
    sourceLanguage: 'zh-Hans',
    targetLanguage: 'en',
  });
  const scriptConversion = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'TW',
    sourceLanguage: 'zh-Hant',
    targetLanguage: 'zh-Hans',
  });

  assert.equal(mainland?.commonAlgorithm, 'sinitic-script-aware-address-common');
  assert.equal(mainland?.countryAlgorithm, 'hanyu-pinyin-mainland');
  assert.equal(taiwan?.countryAlgorithm, 'taiwan-customary-plus-hanyu-pinyin-aliases');
  assert.equal(singapore?.countryAlgorithm, 'singapore-mandarin-plus-english-address');
  assert.equal(scriptConversion?.mode, 'script-conversion');
});

test('same language sphere routes directly when scripts match and pivots when they differ', () => {
  const malayIndonesian = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'MY',
    sourceLanguage: 'ms',
    targetLanguage: 'id',
  });
  const persianDari = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'AF',
    sourceLanguage: 'fa-AF',
    targetLanguage: 'fa',
  });
  const persianTajik = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'TJ',
    sourceLanguage: 'fa',
    targetLanguage: 'tg',
  });
  const arabicToEnglish = resolveCommonAddressLanguageAlgorithm({
    countryCode: 'MA',
    sourceLanguage: 'ar',
    targetLanguage: 'en',
  });

  assert.equal(malayIndonesian?.commonAlgorithm, 'malay-indonesian-latin-address-common');
  assert.equal(malayIndonesian?.mode, 'direct-same-sphere');
  assert.equal(persianDari?.commonAlgorithm, 'persian-dari-tajik-address-common');
  assert.equal(persianDari?.mode, 'identity');
  assert.equal(persianTajik?.mode, 'english-pivot');
  assert.equal(arabicToEnglish?.mode, 'to-english');
});

test('country lookup can expose multiple language spheres for multilingual states', () => {
  assert.deepEqual(
    getAddressLanguageSpheresForCountry('CH').map(sphere => sphere.id).sort(),
    ['french', 'german', 'italian', 'romansh'],
  );
  assert.deepEqual(
    getAddressLanguageSpheresForCountry('BE').map(sphere => sphere.id).sort(),
    ['dutch', 'french', 'german'],
  );
});
