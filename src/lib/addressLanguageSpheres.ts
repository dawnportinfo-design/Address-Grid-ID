import { normalizeLanguageCode } from './languageCodeRules';

export type AddressLanguageSphereId =
  | 'english'
  | 'spanish'
  | 'french'
  | 'arabic'
  | 'portuguese'
  | 'russian'
  | 'german'
  | 'chinese'
  | 'italian'
  | 'swahili'
  | 'malay-indonesian'
  | 'persian'
  | 'dutch'
  | 'romansh'
  | 'south-slavic'
  | 'nordic'
  | 'turkic';

export type AddressLanguageScript =
  | 'latin'
  | 'cyrillic'
  | 'arabic'
  | 'han-simplified'
  | 'han-traditional';

export type CommonAddressLanguageMode =
  | 'identity'
  | 'to-english'
  | 'from-english'
  | 'direct-same-sphere'
  | 'script-conversion'
  | 'english-pivot';

export type AddressLanguageSphereProfile = {
  id: AddressLanguageSphereId;
  label: string;
  languages: readonly string[];
  countryCodes: readonly string[];
  commonAlgorithm: string;
  scriptByLanguage: Readonly<Record<string, AddressLanguageScript>>;
  countryAlgorithms?: Readonly<Record<string, string>>;
};

export type CommonAddressLanguageAlgorithmResult = {
  mode: CommonAddressLanguageMode;
  sourceLanguage: string;
  targetLanguage: string;
  sourceSphereId?: AddressLanguageSphereId;
  targetSphereId?: AddressLanguageSphereId;
  commonAlgorithm: string;
  countryAlgorithm?: string;
  countrySpecificOrderRequired: boolean;
  sharedAcrossCountries: boolean;
};

export type SharedAddressAlgorithmVerification = {
  language: string;
  sphereId: AddressLanguageSphereId | null;
  commonAlgorithm: string | null;
  shared: boolean;
  supportedCountries: string[];
  missingCountries: string[];
};

const ADDRESS_LANGUAGE_SPHERES: AddressLanguageSphereProfile[] = [
  {
    id: 'english',
    label: 'English address sphere',
    languages: ['en'],
    countryCodes: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'IN', 'NG', 'GH', 'KE', 'UG', 'ZA', 'SG'],
    commonAlgorithm: 'english-domestic-international-common',
    scriptByLanguage: { en: 'latin' },
  },
  {
    id: 'spanish',
    label: 'Spanish address sphere',
    languages: ['es'],
    countryCodes: ['ES', 'MX', 'AR', 'CO', 'PE', 'CL', 'EC', 'BO', 'PY', 'UY', 'VE', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'PR', 'GQ'],
    commonAlgorithm: 'latin-spanish-address-common',
    scriptByLanguage: { es: 'latin' },
  },
  {
    id: 'french',
    label: 'French address sphere',
    languages: ['fr'],
    countryCodes: ['FR', 'BE', 'CH', 'LU', 'MC', 'SN', 'CI', 'CD', 'CG', 'CM', 'GA', 'GN', 'BF', 'ML', 'NE', 'TG', 'BJ', 'HT', 'CA', 'GP', 'MQ', 'GF', 'RE', 'YT', 'PF', 'NC', 'WF', 'MF', 'BL', 'PM'],
    commonAlgorithm: 'latin-french-address-common',
    scriptByLanguage: { fr: 'latin' },
  },
  {
    id: 'arabic',
    label: 'Arabic address sphere',
    languages: ['ar'],
    countryCodes: ['SA', 'EG', 'IQ', 'JO', 'MA', 'AE', 'QA', 'BH', 'KW', 'OM', 'YE', 'SY', 'LB', 'PS', 'DZ', 'TN', 'LY', 'SD', 'MR', 'EH', 'KM', 'DJ', 'SO', 'TD'],
    commonAlgorithm: 'arabic-abjad-address-common',
    scriptByLanguage: { ar: 'arabic' },
  },
  {
    id: 'portuguese',
    label: 'Portuguese address sphere',
    languages: ['pt'],
    countryCodes: ['PT', 'BR', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL', 'MO', 'PT_AZO', 'PT_MAD'],
    commonAlgorithm: 'latin-portuguese-address-common',
    scriptByLanguage: { pt: 'latin' },
  },
  {
    id: 'russian',
    label: 'Russian address sphere',
    languages: ['ru'],
    countryCodes: ['RU', 'BY', 'KZ', 'KG', 'UZ', 'TJ', 'TM'],
    commonAlgorithm: 'cyrillic-russian-address-common',
    scriptByLanguage: { ru: 'cyrillic' },
  },
  {
    id: 'german',
    label: 'German address sphere',
    languages: ['de'],
    countryCodes: ['DE', 'AT', 'CH', 'LI', 'BE', 'LU'],
    commonAlgorithm: 'latin-german-address-common',
    scriptByLanguage: { de: 'latin' },
  },
  {
    id: 'chinese',
    label: 'Chinese address sphere',
    languages: ['zh-Hans', 'zh-Hant'],
    countryCodes: ['CN', 'SG', 'TW', 'HK', 'MO'],
    commonAlgorithm: 'sinitic-script-aware-address-common',
    scriptByLanguage: {
      'zh-Hans': 'han-simplified',
      'zh-Hant': 'han-traditional',
    },
    countryAlgorithms: {
      CN: 'hanyu-pinyin-mainland',
      SG: 'singapore-mandarin-plus-english-address',
      TW: 'taiwan-customary-plus-hanyu-pinyin-aliases',
      HK: 'hong-kong-cantonese-plus-historic-english',
      MO: 'macao-portuguese-cantonese-plus-english',
    },
  },
  {
    id: 'italian',
    label: 'Italian address sphere',
    languages: ['it'],
    countryCodes: ['IT', 'CH', 'SM', 'VA'],
    commonAlgorithm: 'latin-italian-address-common',
    scriptByLanguage: { it: 'latin' },
  },
  {
    id: 'swahili',
    label: 'Swahili address sphere',
    languages: ['sw'],
    countryCodes: ['TZ', 'KE', 'UG', 'CD', 'RW'],
    commonAlgorithm: 'latin-swahili-address-common',
    scriptByLanguage: { sw: 'latin' },
  },
  {
    id: 'malay-indonesian',
    label: 'Malay and Indonesian address sphere',
    languages: ['ms', 'id'],
    countryCodes: ['MY', 'BN', 'ID', 'SG'],
    commonAlgorithm: 'malay-indonesian-latin-address-common',
    scriptByLanguage: { ms: 'latin', id: 'latin' },
  },
  {
    id: 'persian',
    label: 'Persian, Dari, and Tajik address sphere',
    languages: ['fa', 'tg'],
    countryCodes: ['IR', 'AF', 'TJ'],
    commonAlgorithm: 'persian-dari-tajik-address-common',
    scriptByLanguage: { fa: 'arabic', tg: 'cyrillic' },
  },
  {
    id: 'dutch',
    label: 'Dutch address sphere',
    languages: ['nl'],
    countryCodes: ['NL', 'BE', 'SR', 'BQ', 'AW', 'CW', 'SX'],
    commonAlgorithm: 'latin-dutch-address-common',
    scriptByLanguage: { nl: 'latin' },
  },
  {
    id: 'romansh',
    label: 'Romansh address sphere',
    languages: ['rm'],
    countryCodes: ['CH'],
    commonAlgorithm: 'latin-romansh-address-common',
    scriptByLanguage: { rm: 'latin' },
  },
  {
    id: 'south-slavic',
    label: 'South Slavic address sphere',
    languages: ['bs', 'hr', 'sr', 'cnr', 'mk', 'sl'],
    countryCodes: ['BA', 'HR', 'RS', 'ME', 'MK', 'SI'],
    commonAlgorithm: 'south-slavic-address-common',
    scriptByLanguage: {
      bs: 'latin',
      hr: 'latin',
      sr: 'cyrillic',
      cnr: 'latin',
      mk: 'cyrillic',
      sl: 'latin',
    },
  },
  {
    id: 'nordic',
    label: 'Nordic address sphere',
    languages: ['sv', 'no', 'da', 'is', 'fo'],
    countryCodes: ['SE', 'NO', 'DK', 'IS', 'FO', 'FI', 'AX', 'SJ_SVA', 'SJ_JAN'],
    commonAlgorithm: 'nordic-latin-address-common',
    scriptByLanguage: { sv: 'latin', no: 'latin', da: 'latin', is: 'latin', fo: 'latin' },
  },
  {
    id: 'turkic',
    label: 'Turkic address sphere',
    languages: ['tr', 'az', 'kk', 'ky', 'tk', 'uz'],
    countryCodes: ['TR', 'AZ', 'KZ', 'KG', 'TM', 'UZ'],
    commonAlgorithm: 'turkic-address-common',
    scriptByLanguage: {
      tr: 'latin',
      az: 'latin',
      kk: 'cyrillic',
      ky: 'cyrillic',
      tk: 'latin',
      uz: 'latin',
    },
  },
];

const SPHERE_BY_ID = new Map(ADDRESS_LANGUAGE_SPHERES.map(sphere => [sphere.id, sphere]));

function normalizeCountryCode(countryCode?: string | null) {
  return String(countryCode || '').trim().toUpperCase().replace(/-/g, '_');
}

export function normalizeAddressLanguageForSphere(language?: string | null, countryCode?: string | null) {
  const raw = String(language || '').trim().replace('_', '-');
  const lower = raw.toLowerCase();
  const country = normalizeCountryCode(countryCode);

  if (!raw || lower === 'local') return '';
  if (lower === 'fa-af' || lower === 'prs' || lower === 'prs-af') return 'fa';
  if (lower === 'zh') return country === 'CN' || country === 'SG' ? 'zh-Hans' : 'zh-Hant';
  if (lower === 'zh-cn' || lower === 'zh-sg' || raw.startsWith('zh-Hans')) return 'zh-Hans';
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo' || raw.startsWith('zh-Hant')) return 'zh-Hant';

  return normalizeLanguageCode(raw);
}

export function getAddressLanguageSphereById(id: AddressLanguageSphereId) {
  return SPHERE_BY_ID.get(id) || null;
}

export function getAddressLanguageSphereForLanguage(language?: string | null, countryCode?: string | null) {
  const normalized = normalizeAddressLanguageForSphere(language, countryCode);
  if (!normalized) return null;
  return ADDRESS_LANGUAGE_SPHERES.find(sphere => sphere.languages.includes(normalized)) || null;
}

export function getAddressLanguageSpheresForCountry(countryCode: string) {
  const country = normalizeCountryCode(countryCode);
  return ADDRESS_LANGUAGE_SPHERES.filter(sphere => sphere.countryCodes.includes(country));
}

function scriptFor(language: string, sphere: AddressLanguageSphereProfile | null) {
  return sphere?.scriptByLanguage[language];
}

function sharedAcrossCountries(sphere: AddressLanguageSphereProfile | null) {
  return Boolean(sphere && sphere.countryCodes.length > 1);
}

function countryAlgorithmFor(sphere: AddressLanguageSphereProfile | null, countryCode?: string | null) {
  if (!sphere?.countryAlgorithms) return undefined;
  return sphere.countryAlgorithms[normalizeCountryCode(countryCode)] || undefined;
}

function commonAlgorithmFor(
  mode: CommonAddressLanguageMode,
  sourceSphere: AddressLanguageSphereProfile | null,
  targetSphere: AddressLanguageSphereProfile | null,
) {
  if (mode === 'from-english') return targetSphere?.commonAlgorithm || 'english-domestic-international-common';
  return sourceSphere?.commonAlgorithm || targetSphere?.commonAlgorithm || 'english-domestic-international-common';
}

export function resolveCommonAddressLanguageAlgorithm(options: {
  countryCode?: string;
  sourceLanguage?: string;
  targetLanguage: string;
}): CommonAddressLanguageAlgorithmResult | null {
  const sourceLanguage = normalizeAddressLanguageForSphere(options.sourceLanguage, options.countryCode);
  const targetLanguage = normalizeAddressLanguageForSphere(options.targetLanguage, options.countryCode);
  if (!targetLanguage) return null;

  const sourceSphere = getAddressLanguageSphereForLanguage(sourceLanguage, options.countryCode);
  const targetSphere = getAddressLanguageSphereForLanguage(targetLanguage, options.countryCode);
  if (!sourceSphere && !targetSphere) return null;

  let mode: CommonAddressLanguageMode;
  if (sourceLanguage && sourceLanguage === targetLanguage) {
    mode = 'identity';
  } else if (targetLanguage === 'en') {
    mode = 'to-english';
  } else if (sourceLanguage === 'en') {
    mode = 'from-english';
  } else if (sourceSphere && targetSphere && sourceSphere.id === targetSphere.id) {
    if (sourceSphere.id === 'chinese' && sourceLanguage !== targetLanguage) {
      mode = 'script-conversion';
    } else {
      const sourceScript = scriptFor(sourceLanguage, sourceSphere);
      const targetScript = scriptFor(targetLanguage, targetSphere);
      mode = sourceScript && targetScript && sourceScript === targetScript
        ? 'direct-same-sphere'
        : 'english-pivot';
    }
  } else {
    mode = 'english-pivot';
  }

  const commonAlgorithm = commonAlgorithmFor(mode, sourceSphere, targetSphere);
  const primarySphere = targetLanguage === 'en' ? sourceSphere : targetSphere || sourceSphere;

  return {
    mode,
    sourceLanguage,
    targetLanguage,
    sourceSphereId: sourceSphere?.id,
    targetSphereId: targetSphere?.id,
    commonAlgorithm,
    countryAlgorithm: countryAlgorithmFor(primarySphere || null, options.countryCode),
    countrySpecificOrderRequired: true,
    sharedAcrossCountries: sharedAcrossCountries(primarySphere || sourceSphere || targetSphere),
  };
}

export function verifySharedAddressAlgorithmForLanguage(
  language: string,
  countryCodes: readonly string[],
): SharedAddressAlgorithmVerification {
  const normalized = normalizeAddressLanguageForSphere(language);
  const sphere = getAddressLanguageSphereForLanguage(normalized);
  const countries = countryCodes.map(normalizeCountryCode);
  if (!sphere) {
    return {
      language: normalized,
      sphereId: null,
      commonAlgorithm: null,
      shared: false,
      supportedCountries: [],
      missingCountries: countries,
    };
  }

  const supportedCountries = countries.filter(country => sphere.countryCodes.includes(country));
  const missingCountries = countries.filter(country => !sphere.countryCodes.includes(country));

  return {
    language: normalized,
    sphereId: sphere.id,
    commonAlgorithm: sphere.commonAlgorithm,
    shared: supportedCountries.length > 1 && missingCountries.length === 0,
    supportedCountries,
    missingCountries,
  };
}
