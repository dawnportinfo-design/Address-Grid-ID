import assert from 'node:assert/strict';
import { test } from 'node:test';

import { APP_LANGUAGES } from './languageSettings';

const ASIA_FIRST_LANGUAGE_CODES = [
  'ja',
  'zh-Hans',
  'zh-Hant',
  'ko',
  'ko-KP',
  'mn-Cyrl',
  'my',
  'vi',
  'km',
  'lo',
  'ms',
  'en',
  'id',
  'fil',
  'tet',
  'th',
  'hi',
  'ur',
  'bn',
  'ne',
  'si',
  'dz',
  'dv',
  'ps',
  'fa-AF',
  'tr',
  'fa',
  'he',
  'kk',
  'uz',
  'tk',
  'ky',
  'tg',
  'ru',
  'ar',
  'hy',
  'az',
  'ka',
] as const;

test('app language picker includes Asia first languages for every country coverage pass', () => {
  const appLanguageCodes = new Set(APP_LANGUAGES.map(language => language.code));

  for (const code of ASIA_FIRST_LANGUAGE_CODES) {
    assert.equal(appLanguageCodes.has(code), true, `${code} should stay selectable`);
  }

  assert.equal(appLanguageCodes.has('en-SG'), true, 'regional English should stay selectable');

  for (const code of ['jv', 'su', 'ceb', 'ilo']) {
    assert.equal(appLanguageCodes.has(code), false, `${code} should stay in address languages only`);
  }
});
