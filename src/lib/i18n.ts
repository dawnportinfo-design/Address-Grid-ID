type TranslationMap = Record<string, Record<string, string>>;

const RTL_LANGUAGES = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'dv', 'ks', 'sd']);

const LANGUAGE_TRANSLATION_ALIASES: Record<string, string[]> = {
  fil: ['tl'],
  pt: ['pt-PT'],
  yue: ['zh-Hant'],
};

function translationCandidates(language: string) {
  const parts = language.split('-');
  const candidates = [language];

  if (parts.length >= 2) {
    candidates.push(parts.slice(0, 2).join('-'));
  }

  if (parts[0]) {
    candidates.push(parts[0]);
  }

  for (const candidate of [...candidates]) {
    candidates.push(...(LANGUAGE_TRANSLATION_ALIASES[candidate] || []));
  }

  return Array.from(new Set(candidates));
}

export function hasUiTranslation(translations: TranslationMap, language: string) {
  return translationCandidates(language).some(candidate => Object.keys(translations[candidate] || {}).length > 0);
}

export function isUiLanguageSelectable(translations: TranslationMap, language: string) {
  return Object.keys(translations[language] || {}).length > 0;
}

export function getLanguageDirection(language: string) {
  const base = language.split('-')[0];
  return RTL_LANGUAGES.has(base) ? 'rtl' : 'ltr';
}

export function translateUi(
  translations: TranslationMap,
  language: string,
  key: string,
  params?: Record<string, string | number>
) {
  let str = translationCandidates(language)
    .map(candidate => translations[candidate]?.[key])
    .find(value => typeof value === 'string' && value.length > 0)
    || translations.en?.[key]
    || key;

  if (params && typeof str === 'string') {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(`{{${k}}}`, String(v));
    });
  }

  return str;
}
