export type AsiaLanguageFamily =
  | 'east'
  | 'southeast'
  | 'south'
  | 'central'
  | 'west'
  | 'other';

const ASIA_LANGUAGE_FAMILY_MAP: Record<string, AsiaLanguageFamily> = {
  ja: 'east',
  ko: 'east',
  zh: 'east',
  'zh-Hans': 'east',
  'zh-Hant': 'east',
  yue: 'east',

  vi: 'southeast',
  th: 'southeast',
  id: 'southeast',
  ms: 'southeast',
  tl: 'southeast',
  km: 'southeast',
  lo: 'southeast',
  my: 'southeast',
  'en-SG': 'southeast',

  hi: 'south',
  bn: 'south',
  ta: 'south',
  te: 'south',
  mr: 'south',
  gu: 'south',
  kn: 'south',
  ml: 'south',
  pa: 'south',
  ur: 'south',
  ne: 'south',
  si: 'south',
  dz: 'south',
  dv: 'south',

  kk: 'central',
  uz: 'central',
  ky: 'central',
  tg: 'central',
  tk: 'central',
  ps: 'central',
  fa: 'central',

  ar: 'west',
  he: 'west',
  tr: 'west',
  az: 'west',
  ku: 'west',
  'en-PK': 'south',
  'en-IN': 'south',
  'en-BD': 'south',
  'en-LK': 'south',
  'en-NP': 'south',
  'en-MV': 'south',
  'en-PH': 'southeast',
  'en-MY': 'southeast',
  'en-ZA': 'other',
  'en-KE': 'other',
  'en-NG': 'other',
  'en-GH': 'other'
};

const ASIA_LANGUAGE_FAMILY_LABELS: Record<string, Record<AsiaLanguageFamily, string>> = {
  en: {
    east: 'East Asian Languages',
    southeast: 'Southeast Asian Languages',
    south: 'South Asian Languages',
    central: 'Central Asian Languages',
    west: 'West Asian Languages',
    other: 'Other Asian Languages'
  },
  ja: {
    east: '東アジア諸語',
    southeast: '東南アジア諸語',
    south: '南アジア諸語',
    central: '中央アジア諸語',
    west: '西アジア諸語',
    other: 'その他のアジア言語'
  },
  de: {
    east: 'Ostasiatische Sprachen',
    southeast: 'Südostasiatische Sprachen',
    south: 'Südasiatische Sprachen',
    central: 'Zentralasiatische Sprachen',
    west: 'Westasiatische Sprachen',
    other: 'Weitere asiatische Sprachen'
  },
  fr: {
    east: 'Langues d’Asie de l’Est',
    southeast: 'Langues d’Asie du Sud-Est',
    south: 'Langues d’Asie du Sud',
    central: 'Langues d’Asie centrale',
    west: 'Langues d’Asie occidentale',
    other: 'Autres langues asiatiques'
  },
  es: {
    east: 'Lenguas del Este de Asia',
    southeast: 'Lenguas del Sudeste Asiático',
    south: 'Lenguas del Sur de Asia',
    central: 'Lenguas de Asia Central',
    west: 'Lenguas de Asia Occidental',
    other: 'Otras lenguas asiáticas'
  },
  pt: {
    east: 'Línguas do Leste Asiático',
    southeast: 'Línguas do Sudeste Asiático',
    south: 'Línguas do Sul da Ásia',
    central: 'Línguas da Ásia Central',
    west: 'Línguas da Ásia Ocidental',
    other: 'Outras línguas asiáticas'
  },
  zh: {
    east: '東亞語言',
    southeast: '東南亞語言',
    south: '南亞語言',
    central: '中亞語言',
    west: '西亞語言',
    other: '其他亞洲語言'
  },
  ar: {
    east: 'لغات شرق آسيا',
    southeast: 'لغات جنوب شرق آسيا',
    south: 'لغات جنوب آسيا',
    central: 'لغات آسيا الوسطى',
    west: 'لغات غرب آسيا',
    other: 'لغات آسيوية أخرى'
  },
  ru: {
    east: 'Восточноазиатские языки',
    southeast: 'Юго-восточноазиатские языки',
    south: 'Южноазиатские языки',
    central: 'Среднеазиатские языки',
    west: 'Западноазиатские языки',
    other: 'Другие азиатские языки'
  }
};

export function getAsiaLanguageFamily(code: string): AsiaLanguageFamily | null {
  return ASIA_LANGUAGE_FAMILY_MAP[code] || null;
}

export function getAsiaLanguageFamilyLabel(family: AsiaLanguageFamily, locale: string): string {
  const normalized = (locale || 'en').toLowerCase();
  const lang = normalized.startsWith('zh') ? 'zh' : normalized.split('-')[0];
  return ASIA_LANGUAGE_FAMILY_LABELS[lang]?.[family] || ASIA_LANGUAGE_FAMILY_LABELS.en[family];
}

export function getAsiaLanguageFamilyFlag(family: AsiaLanguageFamily): string {
  switch (family) {
    case 'east': return '🀄';
    case 'southeast': return '🌴';
    case 'south': return '🪷';
    case 'central': return '🏔️';
    case 'west': return '🕌';
    default: return '🌐';
  }
}