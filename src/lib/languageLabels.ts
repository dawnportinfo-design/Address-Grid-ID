type EnglishTabMode = 'plain' | 'domestic' | 'international';
type EnglishAddressCircle = 'inner' | 'outer' | 'expanding';

const SPECIAL_ADDRESS_TAB_LABELS: Record<string, string> = {
  en_domestic: 'English (Domestic)',
  intl_en: 'English (International Shipping)',
  carrier: 'English (International Shipping)',
};

const ENGLISH_CIRCLE_DOMESTIC_LABELS: Record<Extract<EnglishAddressCircle, 'inner' | 'outer'>, string> = {
  inner: 'English (Inner Circle Domestic)',
  outer: 'English (Outer Circle Domestic)',
};

const LANGUAGE_NATIVE_LABEL_OVERRIDES: Record<string, string> = {
  aa: 'Qafar Af',
  af: 'Afrikaans',
  ak: 'Akan',
  am: 'አማርኛ',
  ar: 'العربية',
  as: 'অসমীয়া',
  az: 'Azərbaycanca',
  be: 'Беларуская',
  bem: 'IciBemba',
  bg: 'Български',
  bi: 'Bislama',
  bn: 'বাংলা',
  br: 'Brezhoneg',
  brx: 'बड़ो',
  bs: 'Bosanski',
  ca: 'Català',
  cnr: 'Crnogorski',
  co: 'Corsu',
  crh: 'Qırımtatarca',
  crs: 'Seselwa',
  cs: 'Čeština',
  cy: 'Cymraeg',
  da: 'Dansk',
  de: 'Deutsch',
  doi: 'डोगरी',
  dsb: 'Dolnoserbšćina',
  dv: 'ދިވެހި',
  dz: 'རྫོང་ཁ',
  ee: 'Eʋegbe',
  el: 'Ελληνικά',
  en: 'English',
  es: 'Español',
  et: 'Eesti',
  eu: 'Euskara',
  fa: 'فارسی',
  'fa-AF': 'دری',
  ff: 'Fulfulde',
  fi: 'Suomi',
  fj: 'Vosa Vakaviti',
  fo: 'Føroyskt',
  fr: 'Français',
  fur: 'Furlan',
  fy: 'Frysk',
  ga: 'Gaeilge',
  gd: 'Gàidhlig',
  gil: 'Kiribati',
  gl: 'Galego',
  gu: 'ગુજરાતી',
  ha: 'Hausa',
  he: 'עברית',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hsb: 'Hornjoserbšćina',
  hu: 'Magyar',
  hy: 'Հայերեն',
  id: 'Bahasa Indonesia',
  ig: 'Igbo',
  is: 'Íslenska',
  it: 'Italiano',
  ja: '日本語',
  ka: 'ქართული',
  kea: 'Kabuverdianu',
  kk: 'Қазақ тілі',
  kl: 'Kalaallisut',
  km: 'ភាសាខ្មែរ',
  kn: 'ಕನ್ನಡ',
  ko: '한국어',
  kok: 'कोंकणी',
  ks: 'کٲشُر',
  ku: 'Kurdî',
  ky: 'Кыргызча',
  lb: 'Lëtzebuergesch',
  li: 'Limburgs',
  ln: 'Lingála',
  lo: 'ພາສາລາວ',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  mai: 'मैथिली',
  mfe: 'Morisyen',
  mg: 'Malagasy',
  mh: 'Kajin M̧ajeļ',
  mk: 'Македонски',
  ml: 'മലയാളം',
  mn: 'Монгол',
  mni: 'মৈতৈলোন্',
  mr: 'मराठी',
  ms: 'Bahasa Melayu',
  mt: 'Malti',
  my: 'ဗမာစာ',
  na: 'Dorerin Naoero',
  nds: 'Plattdüütsch',
  ne: 'नेपाली',
  niu: 'Niuē',
  nl: 'Nederlands',
  no: 'Norsk',
  oc: 'Occitan',
  or: 'ଓଡ଼ିଆ',
  pap: 'Papiamentu',
  pau: 'Belau',
  ps: 'پښتو',
  pt: 'Português',
  rm: 'Rumantsch',
  ro: 'Română',
  ru: 'Русский',
  rw: 'Ikinyarwanda',
  sa: 'संस्कृतम्',
  sat: 'ᱥᱟᱱᱛᱟᱲᱤ',
  sc: 'Sardu',
  sd: 'سنڌي',
  si: 'සිංහල',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sm: 'Gagana Sāmoa',
  so: 'Soomaali',
  sq: 'Shqip',
  sr: 'Српски',
  ss: 'siSwati',
  st: 'Sesotho',
  sv: 'Svenska',
  sw: 'Kiswahili',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  tet: 'Tetun',
  tg: 'Тоҷикӣ',
  th: 'ไทย',
  ti: 'ትግርኛ',
  tk: 'Türkmençe',
  tkl: 'Gagana Tokelau',
  tl: 'Tagalog',
  tn: 'Setswana',
  to: 'Lea Faka-Tonga',
  tr: 'Türkçe',
  tvl: 'Tuvalu',
  uk: 'Українська',
  ur: 'اردو',
  uz: 'Oʻzbek',
  vi: 'Tiếng Việt',
  yue: '廣東話',
  zh: '中文',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  zu: 'isiZulu',
  xh: 'isiXhosa',
};

function normalizeLanguageLabelCode(code: string) {
  const value = code.trim();
  if (!value) return value;
  if (SPECIAL_ADDRESS_TAB_LABELS[value]) return value;
  if (LANGUAGE_NATIVE_LABEL_OVERRIDES[value]) return value;
  if (value.startsWith('zh-Hans') || value === 'zh-CN' || value === 'zh-SG') return 'zh-Hans';
  if (value.startsWith('zh-Hant') || value === 'zh-TW' || value === 'zh-HK' || value === 'zh-MO') return 'zh-Hant';
  if (value.startsWith('en')) return 'en';
  if (value.startsWith('pt')) return 'pt';
  if (value.startsWith('es')) return 'es';
  if (value.startsWith('fr')) return 'fr';
  if (value.startsWith('de')) return 'de';
  if (value.startsWith('ar')) return 'ar';
  if (value.startsWith('fa')) return 'fa';
  if (value === 'fil') return 'tl';
  if (value === 'nb' || value === 'nn') return 'no';
  return value.split('-')[0].toLowerCase();
}

function titleCaseLatinInitial(label: string) {
  const first = label.charAt(0);
  if (!first || first !== first.toLowerCase() || first === first.toUpperCase()) return label;
  return `${first.toUpperCase()}${label.slice(1)}`;
}

function intlLanguageName(code: string) {
  try {
    return new Intl.DisplayNames([code], { type: 'language' }).of(code);
  } catch {
    return undefined;
  }
}

export function getAddressLanguageTabLabel(
  code: string,
  fallback?: string,
  options: { englishMode?: EnglishTabMode; englishCircle?: EnglishAddressCircle } = {},
) {
  const normalized = normalizeLanguageLabelCode(code);
  const circleDomesticLabel =
    options.englishMode === 'domestic' &&
    (options.englishCircle === 'inner' || options.englishCircle === 'outer')
      ? ENGLISH_CIRCLE_DOMESTIC_LABELS[options.englishCircle]
      : undefined;

  if (normalized === 'en') {
    if (options.englishMode === 'domestic') return circleDomesticLabel || SPECIAL_ADDRESS_TAB_LABELS.en_domestic;
    if (options.englishMode === 'international') return SPECIAL_ADDRESS_TAB_LABELS.intl_en;
    return LANGUAGE_NATIVE_LABEL_OVERRIDES.en;
  }

  if (normalized === 'en_domestic' && circleDomesticLabel) return circleDomesticLabel;

  const specialLabel = SPECIAL_ADDRESS_TAB_LABELS[normalized];
  if (specialLabel) return specialLabel;

  const nativeLabel = LANGUAGE_NATIVE_LABEL_OVERRIDES[normalized];
  if (nativeLabel) return nativeLabel;

  const intlName = intlLanguageName(normalized);
  if (intlName && intlName !== normalized) return titleCaseLatinInitial(intlName);

  return fallback || code.toUpperCase();
}
