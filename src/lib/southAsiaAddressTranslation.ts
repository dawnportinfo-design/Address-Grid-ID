import { normalizeEnglishAddressBuildingName,normalizeEnglishAddressPart } from './addressEnglish';
import { chooseCommonAddressTranslationRoute,translateAddressFieldByRoute,type AddressFieldTranslator,type AddressTranslationRoute } from './addressTranslationRouteCore';
import { isAddressBuildingField,normalizeAddressTranslationCountryCode,normalizeAddressTranslationLanguage,type AddressTranslationProfile } from './addressTranslationRegion';
import { normalizeIndianAddressPart } from './indiaAddressEnglish';

export type SouthAsiaAddressTopology =
  | 'indic-abugida'
  | 'arabic-abjad'
  | 'tibetan-abugida'
  | 'thaana-abugida'
  | 'latin-address';

export type SouthAsiaEnglishAlgorithm =
  | 'india-multilingual-romanization'
  | 'pakistan-urdu-romanization'
  | 'bangladesh-bengali-romanization'
  | 'nepal-devanagari-romanization'
  | 'sri-lanka-sinhala-tamil'
  | 'bhutan-dzongkha-romanization'
  | 'maldives-thaana-romanization'
  | 'afghanistan-pashto-dari';

export type SouthAsiaAddressTranslationRoute = AddressTranslationRoute<SouthAsiaAddressTopology, SouthAsiaEnglishAlgorithm>;

export type SouthAsiaAddressTranslationProfile = AddressTranslationProfile<SouthAsiaAddressTopology, SouthAsiaEnglishAlgorithm>;


const SOUTH_ASIA_ADDRESS_TRANSLATION_PROFILES: Record<string, SouthAsiaAddressTranslationProfile> = {
  IN: {
    countryCode: 'IN',
    nativeLanguages: ['hi', 'bn', 'ta', 'te', 'kn', 'ml', 'gu', 'pa', 'or', 'mr', 'as', 'ur'],
    defaultLanguage: 'hi',
    defaultTopology: 'indic-abugida',
    englishAlgorithm: 'india-multilingual-romanization',
  },
  PK: {
    countryCode: 'PK',
    nativeLanguages: ['ur'],
    defaultLanguage: 'ur',
    defaultTopology: 'arabic-abjad',
    englishAlgorithm: 'pakistan-urdu-romanization',
  },
  BD: {
    countryCode: 'BD',
    nativeLanguages: ['bn'],
    defaultLanguage: 'bn',
    defaultTopology: 'indic-abugida',
    englishAlgorithm: 'bangladesh-bengali-romanization',
  },
  NP: {
    countryCode: 'NP',
    nativeLanguages: ['ne'],
    defaultLanguage: 'ne',
    defaultTopology: 'indic-abugida',
    englishAlgorithm: 'nepal-devanagari-romanization',
  },
  LK: {
    countryCode: 'LK',
    nativeLanguages: ['si', 'ta'],
    defaultLanguage: 'si',
    defaultTopology: 'indic-abugida',
    englishAlgorithm: 'sri-lanka-sinhala-tamil',
  },
  BT: {
    countryCode: 'BT',
    nativeLanguages: ['dz'],
    defaultLanguage: 'dz',
    defaultTopology: 'tibetan-abugida',
    englishAlgorithm: 'bhutan-dzongkha-romanization',
  },
  MV: {
    countryCode: 'MV',
    nativeLanguages: ['dv'],
    defaultLanguage: 'dv',
    defaultTopology: 'thaana-abugida',
    englishAlgorithm: 'maldives-thaana-romanization',
  },
  AF: {
    countryCode: 'AF',
    nativeLanguages: ['ps', 'fa'],
    defaultLanguage: 'ps',
    defaultTopology: 'arabic-abjad',
    englishAlgorithm: 'afghanistan-pashto-dari',
  },
};

const SOUTH_ASIA_TOPOLOGY_BY_LANGUAGE: Record<string, SouthAsiaAddressTopology> = {
  hi: 'indic-abugida',
  bn: 'indic-abugida',
  ta: 'indic-abugida',
  te: 'indic-abugida',
  kn: 'indic-abugida',
  ml: 'indic-abugida',
  gu: 'indic-abugida',
  pa: 'indic-abugida',
  or: 'indic-abugida',
  mr: 'indic-abugida',
  as: 'indic-abugida',
  ne: 'indic-abugida',
  si: 'indic-abugida',
  ur: 'arabic-abjad',
  ps: 'arabic-abjad',
  fa: 'arabic-abjad',
  dz: 'tibetan-abugida',
  dv: 'thaana-abugida',
  en: 'latin-address',
};

const SOUTH_ASIA_ENGLISH_ALIASES: Record<string, Record<string, string>> = {
  PK: {
    'پاکستان': 'Pakistan',
    'اسلام آباد': 'Islamabad',
    'اسلاماباد': 'Islamabad',
    'کراچی': 'Karachi',
    'لاہور': 'Lahore',
  },
  BD: {
    'বাংলাদেশ': 'Bangladesh',
    'ঢাকা': 'Dhaka',
    'চট্টগ্রাম': 'Chattogram',
  },
  NP: {
    'नेपाल': 'Nepal',
    'काठमाडौं': 'Kathmandu',
    'काठमाडौँ': 'Kathmandu',
    'पोखरा': 'Pokhara',
  },
  LK: {
    'ශ්‍රී ලංකාව': 'Sri Lanka',
    'ලංකාව': 'Sri Lanka',
    'කොළඹ': 'Colombo',
    'இலங்கை': 'Sri Lanka',
    'யாழ்ப்பாணம்': 'Jaffna',
  },
  BT: {
    'འབྲུག་ཡུལ': 'Bhutan',
    'འབྲུག་ཡུལ་': 'Bhutan',
    'ཐིམ་ཕུ': 'Thimphu',
  },
  MV: {
    'ދިވެހިރާއްޖެ': 'Maldives',
    'މާލެ': 'Male',
  },
  AF: {
    'افغانستان': 'Afghanistan',
    'کابل': 'Kabul',
    'کندهار': 'Kandahar',
  },
};


function countryCodeOf(countryCode: string) {
  return normalizeAddressTranslationCountryCode(countryCode);
}

export function getSouthAsiaAddressTranslationProfile(countryCode: string) {
  return SOUTH_ASIA_ADDRESS_TRANSLATION_PROFILES[countryCodeOf(countryCode)] || null;
}

function normalizeSouthAsiaAddressLanguage(language: string | undefined | null, profile: SouthAsiaAddressTranslationProfile) {
  return normalizeAddressTranslationLanguage(language, profile, {
    mapLanguage: raw => (raw === 'fa-AF' ? 'fa' : null),
  });
}

function isAllowedLanguage(language: string, profile: SouthAsiaAddressTranslationProfile) {
  return language === 'en' || profile.nativeLanguages.includes(language);
}

function topologyForLanguage(language: string, profile: SouthAsiaAddressTranslationProfile): SouthAsiaAddressTopology {
  return SOUTH_ASIA_TOPOLOGY_BY_LANGUAGE[language] || profile.defaultTopology;
}

export function chooseSouthAsiaAddressTranslationRoute(options: {
  countryCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
}): SouthAsiaAddressTranslationRoute | null {
  const profile = getSouthAsiaAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const sourceLanguage = normalizeSouthAsiaAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeSouthAsiaAddressLanguage(options.targetLanguage, profile);
  if (!isAllowedLanguage(sourceLanguage, profile) || !isAllowedLanguage(targetLanguage, profile)) return null;

  const sourceTopology = topologyForLanguage(sourceLanguage, profile);
  const targetTopology = topologyForLanguage(targetLanguage, profile);

  return chooseCommonAddressTranslationRoute({
    sourceLanguage,
    targetLanguage,
    sourceTopology,
    targetTopology,
    englishAlgorithm: profile.englishAlgorithm,
    englishTopology: 'latin-address',
  });
}

function shouldUseBuildingEnglish(fieldKey: string) {
  return isAddressBuildingField(fieldKey);
}

function normalizeSouthAsiaEnglish(text: string, countryCode: string, fieldKey: string) {
  const code = countryCodeOf(countryCode);

  if (code === 'IN') {
    const india = normalizeIndianAddressPart(text);
    if (india) return india;
  }

  const aliases = SOUTH_ASIA_ENGLISH_ALIASES[code] || {};
  if (aliases[text]) return aliases[text];

  if (shouldUseBuildingEnglish(fieldKey)) {
    const building = normalizeEnglishAddressBuildingName(text, code);
    if (building) return building;
  }

  return normalizeEnglishAddressPart(text, code);
}

export async function translateSouthAsiaAddressField(options: {
  countryCode: string;
  fieldKey: string;
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translator?: AddressFieldTranslator;
}): Promise<{ text: string; route: SouthAsiaAddressTranslationRoute } | null> {
  const profile = getSouthAsiaAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const text = String(options.text ?? '').trim();
  if (!text) return null;

  const route = chooseSouthAsiaAddressTranslationRoute(options);
  if (!route) return null;

  const sourceLanguage = normalizeSouthAsiaAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeSouthAsiaAddressLanguage(options.targetLanguage, profile);

  return translateAddressFieldByRoute({
    text,
    route,
    fieldKey: options.fieldKey,
    sourceLanguage,
    targetLanguage,
    normalizeEnglish: value => normalizeSouthAsiaEnglish(value, profile.countryCode, options.fieldKey),
    translator: options.translator,
  });
}
