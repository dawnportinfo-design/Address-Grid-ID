import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
OPEN_SOURCE_TRANSLATION_PROVIDERS,
detectOpenSourceTranslationLanguage,
normalizeTranslationLanguage,
translateWithOpenSource,
} from './openSourceTranslation';

test('documents open-source translation engines and compatible services', () => {
  const providerIds = OPEN_SOURCE_TRANSLATION_PROVIDERS.map(provider => provider.id);

  assert.ok(providerIds.includes('libretranslate'));
  assert.ok(providerIds.includes('argos-translate'));
  assert.ok(providerIds.includes('franc-min'));
  assert.ok(OPEN_SOURCE_TRANSLATION_PROVIDERS.every(provider => provider.license.length > 0));
});

test('normalizes AGID locale tabs to translation API language codes', () => {
  assert.equal(normalizeTranslationLanguage('en-CA'), 'en');
  assert.equal(normalizeTranslationLanguage('pt-BR'), 'pt');
  assert.equal(normalizeTranslationLanguage('zh-Hans'), 'zh');
  assert.equal(normalizeTranslationLanguage('zh-Hant-TW'), 'zt');
  assert.equal(normalizeTranslationLanguage('local'), 'auto');
});

test('detects likely source language with franc-min and caller hints', () => {
  assert.equal(detectOpenSourceTranslationLanguage('東京都千代田区丸の内', 'ja-JP'), 'ja');
  assert.equal(detectOpenSourceTranslationLanguage('東京都千代田区丸の内'), 'ja');
  assert.equal(detectOpenSourceTranslationLanguage('Avenida Paulista 1000 Sao Paulo'), 'auto');
});

test('translates through LibreTranslate-compatible endpoints with fallback', async () => {
  const calls: string[] = [];
  const fetchImpl = async (url: string, init?: RequestInit) => {
    calls.push(url);
    if (url.includes('broken')) {
      return new Response(JSON.stringify({ error: 'temporary' }), { status: 503 });
    }
    const body = JSON.parse(String(init?.body));
    assert.equal(body.source, 'ja');
    assert.equal(body.target, 'en');
    assert.equal(body.format, 'text');
    return Response.json({ translatedText: 'Marunouchi, Chiyoda City, Tokyo' });
  };

  const result = await translateWithOpenSource({
    text: '東京都千代田区丸の内',
    source: 'ja-JP',
    target: 'en-US',
    endpoints: ['https://broken.example/translate', 'https://ok.example/translate'],
    fetchImpl,
    timeoutMs: 50,
  });

  assert.equal(result?.translatedText, 'Marunouchi, Chiyoda City, Tokyo');
  assert.equal(result?.provider, 'libretranslate-compatible');
  assert.deepEqual(calls, ['https://broken.example/translate', 'https://ok.example/translate']);
});
