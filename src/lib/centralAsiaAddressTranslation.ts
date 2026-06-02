import { normalizeEnglishAddressBuildingName,normalizeEnglishAddressPart } from './addressEnglish';
import {
  chooseConfiguredAddressTranslationRoute,
  getConfiguredAddressTranslationProfile,
  isAddressBuildingField,
  normalizeAddressTranslationCountryCode,
  normalizeAddressTranslationLanguage,
  translateConfiguredAddressField,
  type AddressTranslationProfile,
} from './addressTranslationRegion';
import type { AddressFieldTranslator,AddressTranslationRoute } from './addressTranslationRouteCore';

export type CentralAsiaAddressTopology =
  | 'cyrillic-address'
  | 'latin-turkic'
  | 'latin-address';

export type CentralAsiaEnglishAlgorithm =
  | 'kazakh-russian-bilingual-romanization'
  | 'uzbek-latin-cyrillic-romanization'
  | 'turkmen-latin-romanization'
  | 'kyrgyz-russian-bilingual-romanization'
  | 'tajik-russian-bilingual-romanization';

export type CentralAsiaAddressTranslationRoute = AddressTranslationRoute<CentralAsiaAddressTopology, CentralAsiaEnglishAlgorithm>;

export type CentralAsiaAddressTranslationProfile = AddressTranslationProfile<CentralAsiaAddressTopology, CentralAsiaEnglishAlgorithm>;

const CENTRAL_ASIA_ADDRESS_TRANSLATION_PROFILES: Record<string, CentralAsiaAddressTranslationProfile> = {
  KZ: {
    countryCode: 'KZ',
    nativeLanguages: ['kk', 'ru'],
    defaultLanguage: 'kk',
    defaultTopology: 'cyrillic-address',
    englishAlgorithm: 'kazakh-russian-bilingual-romanization',
  },
  UZ: {
    countryCode: 'UZ',
    nativeLanguages: ['uz', 'ru'],
    defaultLanguage: 'uz',
    defaultTopology: 'latin-turkic',
    englishAlgorithm: 'uzbek-latin-cyrillic-romanization',
  },
  TM: {
    countryCode: 'TM',
    nativeLanguages: ['tk', 'ru'],
    defaultLanguage: 'tk',
    defaultTopology: 'latin-turkic',
    englishAlgorithm: 'turkmen-latin-romanization',
  },
  KG: {
    countryCode: 'KG',
    nativeLanguages: ['ky', 'ru'],
    defaultLanguage: 'ky',
    defaultTopology: 'cyrillic-address',
    englishAlgorithm: 'kyrgyz-russian-bilingual-romanization',
  },
  TJ: {
    countryCode: 'TJ',
    nativeLanguages: ['tg', 'ru'],
    defaultLanguage: 'tg',
    defaultTopology: 'cyrillic-address',
    englishAlgorithm: 'tajik-russian-bilingual-romanization',
  },
};

const CENTRAL_ASIA_TOPOLOGY_BY_LANGUAGE: Record<string, CentralAsiaAddressTopology> = {
  kk: 'cyrillic-address',
  ky: 'cyrillic-address',
  tg: 'cyrillic-address',
  ru: 'cyrillic-address',
  uz: 'latin-turkic',
  tk: 'latin-turkic',
  en: 'latin-address',
};

const COMMON_CYRILLIC_ADDRESS_TERMS: Record<string, string> = {
  Получатель: 'Recipient',
  Улица: 'Street',
  Дом: 'House',
  Корпус: 'Building',
  Город: 'City',
  Область: 'Region',
  Район: 'District',
  Индекс: 'Postal Code',
  'Почтовый индекс': 'Postal Code',
};

const CENTRAL_ASIA_ENGLISH_ALIASES: Record<string, Record<string, string>> = {
  KZ: {
    Қазақстан: 'Kazakhstan',
    Астана: 'Astana',
    Алматы: 'Almaty',
    Шымкент: 'Shymkent',
    Көше: 'Street',
    Үй: 'House',
    Қала: 'City',
    Облыс: 'Region',
    Индекс: 'Postal Code',
  },
  UZ: {
    "O'zbekiston": 'Uzbekistan',
    Ўзбекистон: 'Uzbekistan',
    Toshkent: 'Tashkent',
    Тошкент: 'Tashkent',
    Samarqand: 'Samarkand',
    Самарқанд: 'Samarkand',
    Buxoro: 'Bukhara',
    Бухоро: 'Bukhara',
    "Ko'cha": 'Street',
    Кўча: 'Street',
    Uy: 'House',
    Shahar: 'City',
    Viloyat: 'Region',
    'Pochta indeksi': 'Postal Code',
  },
  TM: {
    Türkmenistan: 'Turkmenistan',
    Aşgabat: 'Ashgabat',
    Mary: 'Mary',
    Türkmenabat: 'Turkmenabat',
    Köçe: 'Street',
    'Öý': 'House',
    Şäher: 'City',
    Welaýat: 'Region',
    'Poçta indeksi': 'Postal Code',
  },
  KG: {
    Кыргызстан: 'Kyrgyzstan',
    Бишкек: 'Bishkek',
    Ош: 'Osh',
    Чүй: 'Chuy',
    Көчө: 'Street',
    Үй: 'House',
    Шаар: 'City',
    Область: 'Region',
    'Почта индекси': 'Postal Code',
  },
  TJ: {
    Тоҷикистон: 'Tajikistan',
    Душанбе: 'Dushanbe',
    Хуҷанд: 'Khujand',
    Кӯча: 'Street',
    Хона: 'House',
    Шаҳр: 'City',
    Вилоят: 'Region',
    'Почтаи индекси': 'Postal Code',
  },
};

function countryCodeOf(countryCode: string) {
  return normalizeAddressTranslationCountryCode(countryCode);
}

export function getCentralAsiaAddressTranslationProfile(countryCode: string) {
  return getConfiguredAddressTranslationProfile(countryCode, CENTRAL_ASIA_ADDRESS_TRANSLATION_PROFILES);
}

function normalizeCentralAsiaAddressLanguage(
  language: string | undefined | null,
  profile: CentralAsiaAddressTranslationProfile,
) {
  return normalizeAddressTranslationLanguage(language, profile);
}

function isAllowedLanguage(language: string, profile: CentralAsiaAddressTranslationProfile) {
  return language === 'en' || profile.nativeLanguages.includes(language);
}

function topologyForLanguage(language: string, profile: CentralAsiaAddressTranslationProfile) {
  return CENTRAL_ASIA_TOPOLOGY_BY_LANGUAGE[language] || profile.defaultTopology;
}

export function chooseCentralAsiaAddressTranslationRoute(options: {
  countryCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
}): CentralAsiaAddressTranslationRoute | null {
  return chooseConfiguredAddressTranslationRoute({
    ...options,
    profiles: CENTRAL_ASIA_ADDRESS_TRANSLATION_PROFILES,
    topologyByLanguage: CENTRAL_ASIA_TOPOLOGY_BY_LANGUAGE,
    englishTopology: 'latin-address',
    normalizeLanguage: normalizeCentralAsiaAddressLanguage,
    isAllowedLanguage: (language, profile) => isAllowedLanguage(language, profile),
  });
}

function shouldUseBuildingEnglish(fieldKey: string) {
  return isAddressBuildingField(fieldKey);
}

function normalizeCentralAsiaEnglish(text: string, countryCode: string, fieldKey: string) {
  const code = countryCodeOf(countryCode);
  const aliases = CENTRAL_ASIA_ENGLISH_ALIASES[code] || {};
  if (aliases[text]) return aliases[text];
  if (COMMON_CYRILLIC_ADDRESS_TERMS[text]) return COMMON_CYRILLIC_ADDRESS_TERMS[text];

  if (shouldUseBuildingEnglish(fieldKey)) {
    const building = normalizeEnglishAddressBuildingName(text, code);
    if (building) return building;
  }

  return normalizeEnglishAddressPart(text, code);
}

export async function translateCentralAsiaAddressField(options: {
  countryCode: string;
  fieldKey: string;
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translator?: AddressFieldTranslator;
}): Promise<{ text: string; route: CentralAsiaAddressTranslationRoute } | null> {
  return translateConfiguredAddressField({
    ...options,
    profiles: CENTRAL_ASIA_ADDRESS_TRANSLATION_PROFILES,
    topologyByLanguage: CENTRAL_ASIA_TOPOLOGY_BY_LANGUAGE,
    englishTopology: 'latin-address',
    normalizeLanguage: normalizeCentralAsiaAddressLanguage,
    isAllowedLanguage: (language, profile) => isAllowedLanguage(language, profile),
    normalizeEnglish: (value, context) => normalizeCentralAsiaEnglish(value, context.profile.countryCode, context.fieldKey),
    translator: options.translator,
  });
}
