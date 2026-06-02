import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLanguageDirection,hasUiTranslation,isUiLanguageSelectable,translateUi } from './i18n';

const translations = {
  en: { app_language: 'App Language', save: 'Save {{count}}' },
  es: { app_language: 'Idioma de la aplicación' },
  ar: { app_language: 'لغة التطبيق' },
  'zh-Hant': { app_language: '應用語言' },
};

test('falls back from regional language codes to their base UI translation', () => {
  assert.equal(translateUi(translations, 'es-MX', 'app_language'), 'Idioma de la aplicación');
  assert.equal(translateUi(translations, 'ar-EG', 'app_language'), 'لغة التطبيق');
});

test('falls back from script-region language codes to their script translation', () => {
  assert.equal(translateUi(translations, 'zh-Hant-TW', 'app_language'), '應用語言');
});

test('falls back to English and interpolates params when no language translation exists', () => {
  assert.equal(translateUi(translations, 'pl', 'save', { count: 3 }), 'Save 3');
});

test('reports regional languages as supported when a parent translation exists', () => {
  assert.equal(hasUiTranslation(translations, 'es-MX'), true);
  assert.equal(hasUiTranslation(translations, 'zh-Hant-TW'), true);
});

test('does not mark fallback-only regional packs as selectable app UI languages', () => {
  assert.equal(translateUi(translations, 'es-MX', 'app_language'), 'Idioma de la aplicación');
  assert.equal(translateUi(translations, 'en-AU', 'app_language'), 'App Language');
  assert.equal(isUiLanguageSelectable(translations, 'es-MX'), false);
  assert.equal(isUiLanguageSelectable(translations, 'en-AU'), false);
});

test('reports languages without exact or parent translations as unsupported', () => {
  assert.equal(hasUiTranslation(translations, 'pl'), false);
});

test('does not select declared empty translation packs as app UI languages', () => {
  assert.equal(hasUiTranslation({ ...translations, mn: {} }, 'mn'), false);
  assert.equal(isUiLanguageSelectable({ ...translations, mn: {} }, 'mn'), false);
  assert.equal(translateUi({ ...translations, mn: {} }, 'mn', 'app_language'), 'App Language');
});

test('does not select aliases whose target translation pack is empty', () => {
  assert.equal(isUiLanguageSelectable({ ...translations, tl: {} }, 'fil'), false);
  assert.equal(translateUi({ ...translations, tl: {} }, 'fil', 'app_language'), 'App Language');
});

test('detects RTL language direction for right-to-left UI languages', () => {
  assert.equal(getLanguageDirection('ar-EG'), 'rtl');
  assert.equal(getLanguageDirection('he'), 'rtl');
  assert.equal(getLanguageDirection('dv'), 'rtl');
  assert.equal(getLanguageDirection('ks'), 'rtl');
  assert.equal(getLanguageDirection('sd'), 'rtl');
  assert.equal(getLanguageDirection('fa-AF'), 'rtl');
  assert.equal(getLanguageDirection('ja'), 'ltr');
});
