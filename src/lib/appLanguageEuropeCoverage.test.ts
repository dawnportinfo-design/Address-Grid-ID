import assert from 'node:assert/strict';
import { test } from 'node:test';

import { APP_LANGUAGES } from './languageSettings';

const EUROPE_FIRST_LANGUAGE_CODES = [
  'en',
  'en-GB',
  'fr',
  'es',
  'de',
  'it',
  'pt-PT',
  'ru',
  'tr',
  'pl',
  'uk',
  'nl',
  'sv',
  'fi',
  'da',
  'no',
  'nb',
  'nn',
  'is',
  'cs',
  'sk',
  'ro',
  'bg',
  'hr',
  'sr',
  'ca',
  'el',
  'mt',
  'ga',
  'lv',
  'et',
  'lt',
  'sl',
  'sq',
  'mk',
  'bs',
  'cnr',
  'be',
  'hu',
  'lb',
  'rm',
  'kl',
  'fo',
  'hy',
  'az',
  'ka',
] as const;

test('Europe app language picker includes every country first language even before all UI copy exists', () => {
  const appLanguageCodes = new Set(APP_LANGUAGES.map(language => language.code));

  for (const code of EUROPE_FIRST_LANGUAGE_CODES) {
    assert.equal(appLanguageCodes.has(code), true, `${code} should stay selectable`);
  }

  for (const code of ['wa', 'nds', 'vls', 'fur', 'la']) {
    assert.equal(appLanguageCodes.has(code), false, `${code} should stay in address languages only`);
  }
});
