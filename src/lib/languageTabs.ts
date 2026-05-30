type AgidAddressTabLanguageOptions = {
  countryCode: string;
  preferredLanguage?: string;
  countryLanguages?: string[];
  knownLanguageCodes: string[];
};

export const INTERNATIONAL_SHIPPING_ENGLISH_TAB = 'intl_en';
export const LEGACY_CARRIER_ENGLISH_TAB = 'carrier';

export const INNER_CIRCLE_ENGLISH_COUNTRIES = ['us', 'gb', 'ca', 'au', 'nz', 'ie'] as const;

export const OUTER_CIRCLE_ENGLISH_COUNTRIES = [
  'in', 'pk', 'bd', 'lk', 'np', 'bt', 'mv',
  'sg', 'my', 'ph', 'bn', 'mm',
  'hk',
  'ng', 'gh', 'sl', 'lr', 'gm', 'cm',
  'er', 'et', 'ke', 'mu', 'rw', 'sc', 'so', 'ss', 'tz', 'ug',
  'za', 'zw', 'zm', 'bw', 'na', 'mw', 'ls', 'sz',
  'jm', 'tt', 'bb', 'bs', 'bz', 'gy', 'ag', 'lc', 'gd', 'dm', 'vc', 'kn',
  'pg', 'fj', 'sb', 'vu', 'ws', 'to',
  'fm', 'pw', 'mh', 'ki', 'tv', 'nr',
  'nf', 'cx', 'cc', 'ck', 'tk', 'nu', 'pn', 'aq',
  'ae', 'qa', 'bh',
] as const;

export const EXPANDING_CIRCLE_ENGLISH_COUNTRIES = [
  'jp', 'kr', 'cn', 'tw', 'mo',
  'th', 'vn', 'id', 'kh', 'la', 'mn',
  'de', 'fr', 'es', 'it', 'nl', 'be', 'ch', 'at',
  'se', 'no', 'dk', 'fi', 'is',
  'bq', 'aw', 'cw', 'sx', 'gl', 'fo', 'sj_sva', 'sj_jan', 'es_bal', 'es_can', 'pt_azo', 'pt_mad',
  'ci', 'sn', 'bf', 'ml', 'ne', 'tg', 'bj', 'gn', 'gw', 'cv',
  'pl', 'cz', 'sk', 'hu', 'ro', 'bg', 'gr',
  'tr', 'ru', 'ua', 'md', 'by', 'rs', 'ba', 'me', 'xk', 'al', 'mk',
  'am', 'az', 'ge',
  'br', 'mx', 'ar', 'cl', 'co', 'pe', 'uy',
  'sa', 'kw', 'om', 'jo', 'lb', 'il', 'eg', 'dz', 'ma', 'tn', 'ly', 'sd', 'mr', 'eh',
] as const;

export const ENGLISH_ADDRESS_COUNTRIES = [
  ...INNER_CIRCLE_ENGLISH_COUNTRIES,
  ...OUTER_CIRCLE_ENGLISH_COUNTRIES,
] as const;

export type EnglishAddressCircle = 'inner' | 'outer' | 'expanding';

export type ExpandingCirclePreparationStage = {
  id: 'native-format' | 'script-conversion' | 'english-exonyms' | 'open-source-validation';
  status: 'ready' | 'partial' | 'planned';
  description: string;
};

const DEFAULT_NATIVE_LANGUAGES_BY_COUNTRY: Record<string, string[]> = {
  mm: ['my'],
  th: ['th'],
  vn: ['vi'],
  kh: ['km'],
  la: ['lo'],
  my: ['ms'],
  sg: ['en'],
  id: ['id'],
  ph: ['tl'],
  bn: ['ms'],
  tl: ['tet', 'pt-PT'],
  jp: ['ja'],
  mn: ['mn'],
  in: ['en'],
  pk: ['ur'],
  bd: ['bn'],
  np: ['ne'],
  lk: ['si', 'ta'],
  bt: ['dz'],
  mv: ['dv'],
  af: ['ps', 'fa-AF'],
  tr: ['tr'],
  ir: ['fa'],
  iq: ['ar'],
  sy: ['ar'],
  lb: ['ar'],
  jo: ['ar'],
  il: ['he', 'ar'],
  ps: ['ar'],
  sa: ['ar'],
  ae: ['ar'],
  qa: ['ar'],
  bh: ['ar'],
  kw: ['ar'],
  om: ['ar'],
  ye: ['ar'],
  kz: ['kk'],
  uz: ['uz'],
  tm: ['tk'],
  kg: ['ky'],
  tj: ['tg'],
  fj: ['en'],
  pg: ['en'],
  ws: ['sm'],
  to: ['to'],
  vu: ['bi'],
  sb: ['en'],
  fm: ['en'],
  pw: ['en'],
  mh: ['mh'],
  ki: ['gil'],
  tv: ['tvl'],
  nr: ['na'],
  nf: ['en'],
  cx: ['en'],
  cc: ['en'],
  ck: ['en'],
  tk: ['tkl'],
  nu: ['niu'],
  pn: ['en'],
  aq: ['en'],
  fr: ['fr'],
  de: ['de'],
  nl: ['nl'],
  be: ['nl', 'fr', 'de'],
  ch: ['de', 'fr', 'it', 'rm'],
  at: ['de'],
  li: ['de'],
  gp: ['fr'],
  mq: ['fr'],
  gf: ['fr'],
  re: ['fr'],
  yt: ['fr'],
  pf: ['fr'],
  nc: ['fr'],
  wf: ['fr'],
  mf: ['fr'],
  bl: ['fr'],
  pm: ['fr'],
  tf: ['fr'],
  cp: ['fr'],
  se: ['sv'],
  no: ['no'],
  dk: ['da'],
  fi: ['fi', 'sv'],
  lv: ['lv'],
  ee: ['et'],
  lt: ['lt'],
  is: ['is'],
  it: ['it'],
  es: ['es', 'ca', 'gl', 'eu'],
  pt: ['pt'],
  gr: ['el'],
  mt: ['mt', 'en'],
  sm: ['it'],
  mc: ['fr'],
  va: ['it'],
  ad: ['ca'],
  cy: ['el', 'tr'],
  lu: ['lb', 'fr', 'de'],
  ro: ['ro'],
  bg: ['bg'],
  ua: ['uk'],
  md: ['ro'],
  by: ['be', 'ru'],
  ru: ['ru'],
  rs: ['sr'],
  ba: ['bs', 'hr', 'sr'],
  me: ['cnr'],
  xk: ['sq', 'sr'],
  al: ['sq'],
  mk: ['mk'],
  bq: ['nl', 'en'],
  aw: ['nl', 'en'],
  cw: ['nl', 'en'],
  sx: ['nl', 'en'],
  gl: ['kl', 'da'],
  fo: ['fo', 'da'],
  sj_sva: ['no'],
  sj_jan: ['no'],
  es_bal: ['es', 'ca'],
  es_can: ['es'],
  pt_azo: ['pt'],
  pt_mad: ['pt'],
  am: ['hy'],
  az: ['az'],
  ge: ['ka'],
  eg: ['ar'],
  dz: ['ar', 'fr'],
  ma: ['ar', 'fr'],
  tn: ['ar', 'fr'],
  ly: ['ar'],
  sd: ['ar'],
  mr: ['ar'],
  eh: ['ar'],
  ci: ['fr'],
  sn: ['fr'],
  bf: ['fr'],
  ml: ['fr'],
  ne: ['fr'],
  tg: ['fr'],
  bj: ['fr'],
  gn: ['fr'],
  gw: ['pt'],
  cv: ['pt'],
  km: ['fr', 'ar'],
  dj: ['fr', 'ar'],
  er: ['ti', 'en'],
  et: ['am', 'en'],
  ke: ['en', 'sw'],
  mg: ['fr'],
  mw: ['en'],
  mu: ['en', 'fr'],
  mz: ['pt'],
  rw: ['en', 'fr', 'sw'],
  sc: ['en', 'fr'],
  so: ['so', 'ar', 'en'],
  ss: ['en'],
  tz: ['sw', 'en'],
  ug: ['en', 'sw'],
  zm: ['en'],
  ls: ['en', 'st'],
  sz: ['en', 'ss'],
  ao: ['pt'],
};

export function normalizeAgidLanguageCode(code: string | undefined | null): string {
  const value = (code || '').trim();
  if (!value || value === 'local') return value || 'local';
  if (value.startsWith('en')) return 'en';
  if (value.startsWith('zh-Hans') || value === 'zh-CN' || value === 'zh-SG') return 'zh-Hans';
  if (value.startsWith('zh-Hant') || value === 'zh-TW' || value === 'zh-HK' || value === 'zh-MO') return 'zh-Hant';
  if (value.startsWith('pt')) return 'pt';
  if (value.startsWith('es')) return 'es';
  if (value.startsWith('fr')) return 'fr';
  if (value.startsWith('de')) return 'de';
  if (value.startsWith('fa')) return 'fa';
  if (value === 'fil') return 'tl';
  if (value === 'nb' || value === 'nn') return 'no';
  return value.split('-')[0].toLowerCase();
}

const englishBase = normalizeAgidLanguageCode;

const isEnglish = (code: string) => englishBase(code) === 'en';

const EUROPEAN_MULTILINGUAL_ADDRESS_MARKETS = new Set([
  'ch',
  'be',
  'lu',
  'fi',
  'es',
  'cy',
  'ba',
]);

export const isEnglishAddressCountry = (countryCode: string) =>
  (ENGLISH_ADDRESS_COUNTRIES as readonly string[]).includes(countryCode.toLowerCase());

export function getEnglishAddressCircle(countryCode: string): EnglishAddressCircle {
  const code = countryCode.toLowerCase();
  if ((INNER_CIRCLE_ENGLISH_COUNTRIES as readonly string[]).includes(code)) return 'inner';
  if ((OUTER_CIRCLE_ENGLISH_COUNTRIES as readonly string[]).includes(code)) return 'outer';
  return 'expanding';
}

export function getExpandingCircleEnglishPreparation(countryCode: string): ExpandingCirclePreparationStage[] {
  const code = countryCode.toLowerCase();
  const isKnownExpanding = (EXPANDING_CIRCLE_ENGLISH_COUNTRIES as readonly string[]).includes(code);

  return [
    {
      id: 'native-format',
      status: 'ready',
      description: 'Keep the native-language address tab as the source of truth and apply country address-format metadata before English conversion.',
    },
    {
      id: 'script-conversion',
      status: isKnownExpanding ? 'partial' : 'planned',
      description: 'Convert local scripts with script-aware romanization, transliteration, and Latin deaccenting before rendering English.',
    },
    {
      id: 'english-exonyms',
      status: 'partial',
      description: 'Prefer English country, city, district, landmark, and OSM name:en style labels when available.',
    },
    {
      id: 'open-source-validation',
      status: 'planned',
      description: 'Validate converted English output against libaddressinput rules, optional libpostal parsing, and OpenAddresses-style references.',
    },
  ];
}

const uniqueKnownLanguages = (codes: string[], knownLanguageCodes: Set<string>) => {
  const seen = new Set<string>();
  const unique: string[] = [];
  const normalizedKnown = new Set([...knownLanguageCodes].map(normalizeAgidLanguageCode));

  for (const code of codes) {
    const base = normalizeAgidLanguageCode(code);
    if (!normalizedKnown.has(base)) continue;
    if (seen.has(base)) continue;
    seen.add(base);
    unique.push(base);
  }

  return unique;
};

const addIfKnown = (tabs: string[], code: string, knownLanguageCodes: Set<string>) => {
  const normalized = normalizeAgidLanguageCode(code);
  const normalizedKnown = new Set([...knownLanguageCodes].map(normalizeAgidLanguageCode));
  if (normalizedKnown.has(normalized) && !tabs.includes(normalized)) {
    tabs.push(normalized);
  }
};

export function getAgidAddressTabLanguages({
  countryCode,
  preferredLanguage,
  countryLanguages = [],
  knownLanguageCodes,
}: AgidAddressTabLanguageOptions): string[] {
  const known = new Set(knownLanguageCodes);
  const normalizedKnown = new Set(knownLanguageCodes.map(normalizeAgidLanguageCode));
  const normalizedCountryCode = countryCode.toLowerCase();
  const isEnglishAddressMarket = isEnglishAddressCountry(normalizedCountryCode);
  const nativeCandidates = uniqueKnownLanguages(countryLanguages, known);
  const defaultNativeCandidates = uniqueKnownLanguages(
    DEFAULT_NATIVE_LANGUAGES_BY_COUNTRY[normalizedCountryCode] || [],
    known
  );
  for (const code of defaultNativeCandidates.reverse()) {
    const existingIndex = nativeCandidates.findIndex(candidate => englishBase(candidate) === englishBase(code));
    if (existingIndex >= 0) nativeCandidates.splice(existingIndex, 1);
    nativeCandidates.unshift(code);
  }

  if (isEnglishAddressMarket && !nativeCandidates.some(isEnglish) && normalizedKnown.has('en')) {
    nativeCandidates.push('en');
  }

  if ((normalizedCountryCode === 'jp') && !nativeCandidates.includes('ja') && normalizedKnown.has('ja')) {
    nativeCandidates.unshift('ja');
  }

  const isEnglishPrimaryCountry = nativeCandidates.length > 0 && isEnglish(nativeCandidates[0]);
  const primaryNative = isEnglishPrimaryCountry
    ? 'en'
    : nativeCandidates[0] || (normalizedKnown.has('en') ? 'en' : normalizeAgidLanguageCode(knownLanguageCodes[0]) || 'en');
  const tabs = [primaryNative];

  if (EUROPEAN_MULTILINGUAL_ADDRESS_MARKETS.has(normalizedCountryCode)) {
    for (const code of nativeCandidates) {
      if (!tabs.some(tab => englishBase(tab) === englishBase(code))) {
        tabs.push(code);
      }
    }
  }

  if (
    preferredLanguage &&
    preferredLanguage !== 'local' &&
    normalizedKnown.has(normalizeAgidLanguageCode(preferredLanguage)) &&
    englishBase(preferredLanguage) === englishBase(primaryNative) &&
    !tabs.includes(normalizeAgidLanguageCode(preferredLanguage))
  ) {
    tabs[0] = normalizeAgidLanguageCode(preferredLanguage);
  }

  if (isEnglishPrimaryCountry) {
    for (const code of nativeCandidates) {
      if (!isEnglish(code)) {
        addIfKnown(tabs, code, known);
      }
    }
    if (normalizedCountryCode === 'us') {
      addIfKnown(tabs, 'es', known);
    }
    if (normalizedCountryCode === 'ca') {
      addIfKnown(tabs, 'fr', known);
    }
    if (normalizedCountryCode === 'ie') {
      addIfKnown(tabs, 'ga', known);
    }
    if (normalizedCountryCode === 'mu' || normalizedCountryCode === 'sc') {
      addIfKnown(tabs, 'fr', known);
    }
    if (normalizedCountryCode === 'ls') {
      addIfKnown(tabs, 'st', known);
    }
    if (normalizedCountryCode === 'sz') {
      addIfKnown(tabs, 'ss', known);
    }
  }

  if (!isEnglish(tabs[0]) && normalizedKnown.has('en')) {
    tabs.push('en');
  }

  if ((isEnglish(tabs[0]) || isEnglishAddressMarket) && normalizedKnown.has('en') && !tabs.includes('en_domestic')) {
    tabs.push('en_domestic');
  }

  return tabs;
}

export function getAgidAddressDisplayTabs(languages: string[]) {
  const tabs = Array.from(new Set(
    languages.map(language =>
      language === LEGACY_CARRIER_ENGLISH_TAB ? INTERNATIONAL_SHIPPING_ENGLISH_TAB : language
    )
  ));

  if (tabs.includes('en_domestic') && !tabs.includes(INTERNATIONAL_SHIPPING_ENGLISH_TAB)) {
    tabs.push(INTERNATIONAL_SHIPPING_ENGLISH_TAB);
  }

  return tabs;
}

export function isInternationalShippingEnglishTab(tabCode: string) {
  return tabCode === INTERNATIONAL_SHIPPING_ENGLISH_TAB || tabCode === LEGACY_CARRIER_ENGLISH_TAB;
}
