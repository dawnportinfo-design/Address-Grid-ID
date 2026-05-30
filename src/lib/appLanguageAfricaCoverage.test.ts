import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TRANSLATIONS } from '../constants/translations';
import { hasUiTranslation } from './i18n';
import { APP_LANGUAGES } from './languageSettings';

const IMPLEMENTED_AFRICA_RELEVANT_UI_LANGUAGE_CODES = [
  'en',
  'fr',
  'ar',
  'pt-PT',
  'pt-BR',
] as const;

test('Africa app language picker excludes native placeholders without UI translations', () => {
  const appLanguageCodes = new Set(APP_LANGUAGES.map(language => language.code));

  for (const code of IMPLEMENTED_AFRICA_RELEVANT_UI_LANGUAGE_CODES) {
    assert.equal(appLanguageCodes.has(code), true, `${code} should stay selectable`);
    assert.equal(hasUiTranslation(TRANSLATIONS as any, code), true, `${code} needs UI copy`);
  }

  for (const code of ['sw', 'mfe', 'zu', 'xh', 'ha', 'yo', 'rw', 'sn']) {
    assert.equal(appLanguageCodes.has(code), false, `${code} should stay in address languages only`);
  }
});
