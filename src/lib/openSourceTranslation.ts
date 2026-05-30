import { franc } from 'franc-min';

export type OpenSourceTranslationProvider = {
  id: string;
  name: string;
  role: 'machine-translation' | 'language-detection' | 'transliteration';
  license: string;
  url: string;
};

export type OpenSourceTranslationResult = {
  translatedText: string;
  provider: 'libretranslate-compatible';
  sourceLanguage: string;
  targetLanguage: string;
  endpoint: string;
};

export type TranslateWithOpenSourceOptions = {
  text: string;
  target: string;
  source?: string;
  endpoints?: string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export const OPEN_SOURCE_TRANSLATION_PROVIDERS: OpenSourceTranslationProvider[] = [
  {
    id: 'libretranslate',
    name: 'LibreTranslate',
    role: 'machine-translation',
    license: 'AGPL-3.0',
    url: 'https://github.com/LibreTranslate/LibreTranslate',
  },
  {
    id: 'argos-translate',
    name: 'Argos Translate',
    role: 'machine-translation',
    license: 'MIT',
    url: 'https://github.com/argosopentech/argos-translate',
  },
  {
    id: 'franc-min',
    name: 'franc-min language detection',
    role: 'language-detection',
    license: 'MIT',
    url: 'https://github.com/wooorm/franc',
  },
  {
    id: 'agid-transliteration',
    name: 'AGID local transliteration rules',
    role: 'transliteration',
    license: 'MIT',
    url: 'src/lib/transliteration.ts',
  },
];

export const DEFAULT_OPEN_SOURCE_TRANSLATION_ENDPOINTS = [
  '/api/translate',
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
  'https://translate.terraprint.co/translate',
  'https://translate.fortland.io/translate',
  'https://translate.api.skidder.xyz/translate',
  'https://libretranslate.pussthecat.org/translate',
  'https://translate.trom.tf/translate',
];

const ISO3_TO_TRANSLATION_CODE: Record<string, string> = {
  ara: 'ar',
  ben: 'bn',
  cmn: 'zh',
  deu: 'de',
  ell: 'el',
  eng: 'en',
  fas: 'fa',
  fra: 'fr',
  hin: 'hi',
  ind: 'id',
  ita: 'it',
  jpn: 'ja',
  khm: 'km',
  kor: 'ko',
  lao: 'lo',
  mal: 'ml',
  mar: 'mr',
  mon: 'mn',
  mya: 'my',
  nep: 'ne',
  nld: 'nl',
  pan: 'pa',
  por: 'pt',
  rus: 'ru',
  sin: 'si',
  spa: 'es',
  swe: 'sv',
  tam: 'ta',
  tel: 'te',
  tha: 'th',
  tur: 'tr',
  ukr: 'uk',
  urd: 'ur',
  vie: 'vi',
};

export function normalizeTranslationLanguage(language: string | null | undefined): string {
  const code = (language || '').trim();
  if (!code || code === 'local' || code === 'auto') return 'auto';
  if (code === 'zh-Hans' || code.startsWith('zh-Hans')) return 'zh';
  if (code === 'zh-Hant' || code.startsWith('zh-Hant')) return 'zt';
  return code.split('-')[0].toLowerCase();
}

export function detectOpenSourceTranslationLanguage(text: string, hint?: string): string {
  const normalizedHint = normalizeTranslationLanguage(hint);
  if (normalizedHint !== 'auto') return normalizedHint;

  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';
  if (/[\u0e00-\u0e7f]/.test(text)) return 'th';
  if (/[\u1000-\u109f]/.test(text)) return 'my';
  if (/[\u1780-\u17ff]/.test(text)) return 'km';
  if (/[\u0e80-\u0eff]/.test(text)) return 'lo';

  const detected = franc(text, { minLength: 8 });
  return ISO3_TO_TRANSLATION_CODE[detected] || 'auto';
}

export async function translateWithOpenSource(options: TranslateWithOpenSourceOptions): Promise<OpenSourceTranslationResult | null> {
  const normalizedText = options.text.trim();
  if (!normalizedText) return null;

  const targetLanguage = normalizeTranslationLanguage(options.target);
  if (targetLanguage === 'auto' || targetLanguage === 'local') return null;

  const sourceLanguage = detectOpenSourceTranslationLanguage(normalizedText, options.source);
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs ?? 3500;
  const endpoints = options.endpoints?.length ? options.endpoints : DEFAULT_OPEN_SOURCE_TRANSLATION_ENDPOINTS;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: normalizedText,
          text: normalizedText,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;
      const data = await response.json();
      const translatedText = typeof data.translatedText === 'string'
        ? data.translatedText
        : typeof data.translation === 'string'
          ? data.translation
          : typeof data.text === 'string'
            ? data.text
            : '';

      if (translatedText.trim()) {
        return {
          translatedText,
          provider: 'libretranslate-compatible',
          sourceLanguage,
          targetLanguage,
          endpoint,
        };
      }
    } catch {
      clearTimeout(timeoutId);
    }
  }

  return null;
}
