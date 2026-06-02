import { normalizeLanguageCode } from './languageCodeRules';

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
  ay: 'Aymar aru',
  be: 'Беларуская',
  bem: 'IciBemba',
  bg: 'Български',
  bi: 'Bislama',
  bn: 'বাংলা',
  br: 'Brezhoneg',
  brx: 'बड़ो',
  bs: 'Bosanski',
  ca: 'Català',
  chk: 'Chuukese',
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
  gn: "Avañe'ẽ",
  gu: 'ગુજરાતી',
  ha: 'Hausa',
  he: 'עברית',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hsb: 'Hornjoserbšćina',
  ht: 'Kreyòl ayisyen',
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
  mi: 'Te reo Māori',
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
  pis: 'Pijin',
  ps: 'پښتو',
  pt: 'Português',
  qu: 'Runasimi',
  rm: 'Rumantsch',
  ro: 'Română',
  ru: 'Русский',
  rw: 'Ikinyarwanda',
  rar: 'Māori Kūki Airani',
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
  tpi: 'Tok Pisin',
  tr: 'Türkçe',
  tvl: 'Tuvalu',
  uk: 'Українська',
  ur: 'اردو',
  uz: 'Oʻzbek',
  vi: 'Tiếng Việt',
  yue: '廣東話',
  yap: 'Yapese',
  zh: '中文',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  zu: 'isiZulu',
  xh: 'isiXhosa',
};

const PRESERVED_LANGUAGE_LABEL_CODES = new Set([
  ...Object.keys(SPECIAL_ADDRESS_TAB_LABELS),
  ...Object.keys(LANGUAGE_NATIVE_LABEL_OVERRIDES),
]);

function normalizeLanguageLabelCode(code: string) {
  return normalizeLanguageCode(code, { preserveExact: PRESERVED_LANGUAGE_LABEL_CODES });
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
