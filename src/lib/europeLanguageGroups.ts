export type EuropeLanguageFamily =
  | 'romance'
  | 'germanic'
  | 'slavic'
  | 'nordic'
  | 'celtic'
  | 'baltic'
  | 'hellenic'
  | 'other';

const EUROPE_LANGUAGE_FAMILY_MAP: Record<string, EuropeLanguageFamily> = {
  fr: 'romance',
  it: 'romance',
  es: 'romance',
  pt: 'romance',
  'pt-PT': 'romance',
  ca: 'romance',
  gl: 'romance',
  oc: 'romance',
  co: 'romance',
  sc: 'romance',
  fur: 'romance',
  rm: 'romance',
  br: 'romance',
  wa: 'romance',

  de: 'germanic',
  'de-AT': 'germanic',
  'de-CH': 'germanic',
  nl: 'germanic',
  fy: 'germanic',
  lb: 'germanic',
  nds: 'germanic',
  hsb: 'germanic',
  dsb: 'germanic',
  li: 'germanic',
  vls: 'germanic',

  ru: 'slavic',
  uk: 'slavic',
  pl: 'slavic',
  cs: 'slavic',
  sk: 'slavic',
  hr: 'slavic',
  sr: 'slavic',
  bg: 'slavic',
  sl: 'slavic',
  be: 'slavic',
  bs: 'slavic',
  mk: 'slavic',

  sv: 'nordic',
  da: 'nordic',
  no: 'nordic',
  is: 'nordic',
  fo: 'nordic',
  fi: 'nordic',

  cy: 'celtic',
  gd: 'celtic',
  ga: 'celtic',

  et: 'baltic',
  lv: 'baltic',
  lt: 'baltic',

  el: 'hellenic',

  ro: 'other',
  hu: 'other',
  sq: 'other',
  tr: 'other',
  mt: 'other',
  ka: 'other',
  hy: 'other',
  eu: 'other',
};

const EUROPE_LANGUAGE_FAMILY_LABELS: Record<string, Record<EuropeLanguageFamily, string>> = {
  en: {
    romance: 'Romance Languages',
    germanic: 'Germanic Languages',
    slavic: 'Slavic Languages',
    nordic: 'Nordic Languages',
    celtic: 'Celtic Languages',
    baltic: 'Baltic Languages',
    hellenic: 'Hellenic Languages',
    other: 'Other European Languages'
  },
  ja: {
    romance: 'ロマンス諸語',
    germanic: 'ゲルマン諸語',
    slavic: 'スラブ諸語',
    nordic: '北欧諸語',
    celtic: 'ケルト諸語',
    baltic: 'バルト諸語',
    hellenic: 'ギリシャ語系',
    other: 'その他の欧州言語'
  },
  de: {
    romance: 'Romanische Sprachen',
    germanic: 'Germanische Sprachen',
    slavic: 'Slawische Sprachen',
    nordic: 'Nordische Sprachen',
    celtic: 'Keltische Sprachen',
    baltic: 'Baltische Sprachen',
    hellenic: 'Hellenische Sprachen',
    other: 'Weitere europäische Sprachen'
  },
  fr: {
    romance: 'Langues romanes',
    germanic: 'Langues germaniques',
    slavic: 'Langues slaves',
    nordic: 'Langues nordiques',
    celtic: 'Langues celtiques',
    baltic: 'Langues baltes',
    hellenic: 'Langues helléniques',
    other: 'Autres langues européennes'
  },
  es: {
    romance: 'Lenguas romances',
    germanic: 'Lenguas germánicas',
    slavic: 'Lenguas eslavas',
    nordic: 'Lenguas nórdicas',
    celtic: 'Lenguas celtas',
    baltic: 'Lenguas bálticas',
    hellenic: 'Lenguas helénicas',
    other: 'Otras lenguas europeas'
  },
  pt: {
    romance: 'Línguas românicas',
    germanic: 'Línguas germânicas',
    slavic: 'Línguas eslavas',
    nordic: 'Línguas nórdicas',
    celtic: 'Línguas celtas',
    baltic: 'Línguas bálticas',
    hellenic: 'Línguas helénicas',
    other: 'Outras línguas europeias'
  },
  'zh-Hans': {
    romance: '罗曼语族',
    germanic: '日耳曼语族',
    slavic: '斯拉夫语族',
    nordic: '北欧语族',
    celtic: '凯尔特语族',
    baltic: '波罗的海语族',
    hellenic: '希腊语族',
    other: '其他欧洲语言'
  },
  'zh-Hant': {
    romance: '羅曼語族',
    germanic: '日耳曼語族',
    slavic: '斯拉夫語族',
    nordic: '北歐語族',
    celtic: '凱爾特語族',
    baltic: '波羅的海語族',
    hellenic: '希臘語族',
    other: '其他歐洲語言'
  },
  ar: {
    romance: 'اللغات الرومانسية',
    germanic: 'اللغات الجرمانية',
    slavic: 'اللغات السلافية',
    nordic: 'اللغات الشمالية',
    celtic: 'اللغات الكلتية',
    baltic: 'اللغات البلطيقية',
    hellenic: 'اللغات اليونانية',
    other: 'لغات أوروبية أخرى'
  },
  ru: {
    romance: 'Романские языки',
    germanic: 'Германские языки',
    slavic: 'Славянские языки',
    nordic: 'Скандинавские языки',
    celtic: 'Кельтские языки',
    baltic: 'Балтийские языки',
    hellenic: 'Эллинские языки',
    other: 'Другие европейские языки'
  },
  it: {
    romance: 'Lingue romanze',
    germanic: 'Lingue germaniche',
    slavic: 'Lingue slave',
    nordic: 'Lingue nordiche',
    celtic: 'Lingue celtiche',
    baltic: 'Lingue baltiche',
    hellenic: 'Lingue elleniche',
    other: 'Altre lingue europee'
  },
  nl: {
    romance: 'Romaanse talen',
    germanic: 'Germaanse talen',
    slavic: 'Slavische talen',
    nordic: 'Noordse talen',
    celtic: 'Keltische talen',
    baltic: 'Baltische talen',
    hellenic: 'Helleense talen',
    other: 'Andere Europese talen'
  },
  pl: {
    romance: 'Języki romańskie',
    germanic: 'Języki germańskie',
    slavic: 'Języki słowiańskie',
    nordic: 'Języki nordyckie',
    celtic: 'Języki celtyckie',
    baltic: 'Języki bałtyckie',
    hellenic: 'Języki helleńskie',
    other: 'Inne języki europejskie'
  },
  cs: {
    romance: 'Románské jazyky',
    germanic: 'Germánské jazyky',
    slavic: 'Slovanské jazyky',
    nordic: 'Severské jazyky',
    celtic: 'Keltské jazyky',
    baltic: 'Pobaltské jazyky',
    hellenic: 'Helénské jazyky',
    other: 'Ostatní evropské jazyky'
  },
  sv: {
    romance: 'Romanska språk',
    germanic: 'Germanska språk',
    slavic: 'Slaviska språk',
    nordic: 'Nordiska språk',
    celtic: 'Keltiska språk',
    baltic: 'Baltiska språk',
    hellenic: 'Helleniska språk',
    other: 'Övriga europeiska språk'
  },
  fi: {
    romance: 'Romaaniset kielet',
    germanic: 'Germaaniset kielet',
    slavic: 'Slaavilaiset kielet',
    nordic: 'Pohjoismaiset kielet',
    celtic: 'Kelttiläiset kielet',
    baltic: 'Baltialaiset kielet',
    hellenic: 'Helleeniset kielet',
    other: 'Muut eurooppalaiset kielet'
  },
  no: {
    romance: 'Romanske språk',
    germanic: 'Germanske språk',
    slavic: 'Slaviske språk',
    nordic: 'Nordiske språk',
    celtic: 'Keltiske språk',
    baltic: 'Baltiske språk',
    hellenic: 'Helleniske språk',
    other: 'Andre europeiske språk'
  },
  da: {
    romance: 'Romanske sprog',
    germanic: 'Germanske sprog',
    slavic: 'Slaviske sprog',
    nordic: 'Nordiske sprog',
    celtic: 'Keltiske sprog',
    baltic: 'Baltiske sprog',
    hellenic: 'Helleniske sprog',
    other: 'Andre europæiske sprog'
  },
  ro: {
    romance: 'Limbi romanice',
    germanic: 'Limbi germanice',
    slavic: 'Limbi slave',
    nordic: 'Limbi nordice',
    celtic: 'Limbi celtice',
    baltic: 'Limbi baltice',
    hellenic: 'Limbi elenice',
    other: 'Alte limbi europene'
  },
  el: {
    romance: 'Ρομανικές γλώσσες',
    germanic: 'Γερμανικές γλώσσες',
    slavic: 'Σλαβικές γλώσσες',
    nordic: 'Βόρειες γλώσσες',
    celtic: 'Κελτικές γλώσσες',
    baltic: 'Βαλτικές γλώσσες',
    hellenic: 'Ελληνικές γλώσσες',
    other: 'Άλλες ευρωπαϊκές γλώσσες'
  },
  uk: {
    romance: 'Романські мови',
    germanic: 'Германські мови',
    slavic: 'Слов’янські мови',
    nordic: 'Північні мови',
    celtic: 'Кельтські мови',
    baltic: 'Балтійські мови',
    hellenic: 'Еллінські мови',
    other: 'Інші європейські мови'
  },
  tr: {
    romance: 'Roman dilleri',
    germanic: 'Cermen dilleri',
    slavic: 'Slav dilleri',
    nordic: 'Kuzey dilleri',
    celtic: 'Kelt dilleri',
    baltic: 'Baltık dilleri',
    hellenic: 'Helen dilleri',
    other: 'Diğer Avrupa dilleri'
  }
};

export function getEuropeLanguageFamily(code: string): EuropeLanguageFamily | null {
  return EUROPE_LANGUAGE_FAMILY_MAP[code] || null;
}

export function getEuropeLanguageFamilyLabel(family: EuropeLanguageFamily, locale: string): string {
  const baseLocale = (locale || 'en').toLowerCase();
  const lang = baseLocale.startsWith('zh') ? (baseLocale.startsWith('zh-hant') ? 'zh-Hant' : 'zh-Hans') : baseLocale.split('-')[0];
  return EUROPE_LANGUAGE_FAMILY_LABELS[lang]?.[family] || EUROPE_LANGUAGE_FAMILY_LABELS.en[family];
}

export function getEuropeLanguageFamilyFlag(family: EuropeLanguageFamily): string {
  switch (family) {
    case 'romance': return '🏛️';
    case 'germanic': return '🛡️';
    case 'slavic': return '🪆';
    case 'nordic': return '❄️';
    case 'celtic': return '☘️';
    case 'baltic': return '🌊';
    case 'hellenic': return '🏺';
    default: return '🌐';
  }
}