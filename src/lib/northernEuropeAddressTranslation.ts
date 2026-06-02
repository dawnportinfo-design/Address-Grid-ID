import { normalizeEnglishAddressBuildingName,normalizeEnglishAddressPart } from './addressEnglish';
import { chooseCommonAddressTranslationRoute,translateAddressFieldByRoute,type AddressFieldTranslator,type AddressTranslationRoute } from './addressTranslationRouteCore';
import { isAddressBuildingField,normalizeAddressTranslationCountryCode,normalizeAddressTranslationLanguage,type AddressTranslationProfile } from './addressTranslationRegion';

export type NorthernEuropeAddressTopology =
  | 'latin-address'
  | 'latin-north-germanic'
  | 'latin-finnic'
  | 'latin-baltic'
  | 'latin-inuit';

export type NorthernEuropeEnglishAlgorithm =
  | 'swedish-posten-international-shipping'
  | 'norwegian-posten-address'
  | 'danish-postnord-address'
  | 'finnish-swedish-posti-address'
  | 'latvian-pasts-address'
  | 'estonian-eesti-post-address'
  | 'lithuanian-post-address'
  | 'icelandic-posturinn-address'
  | 'aland-swedish-finnish-address'
  | 'greenland-kalaallisut-danish-address'
  | 'faroe-faroese-danish-address'
  | 'norwegian-svalbard-address'
  | 'norwegian-jan-mayen-address';

export type NorthernEuropeAddressTranslationRoute = AddressTranslationRoute<NorthernEuropeAddressTopology, NorthernEuropeEnglishAlgorithm>;

export type NorthernEuropeAddressTranslationProfile = AddressTranslationProfile<NorthernEuropeAddressTopology, NorthernEuropeEnglishAlgorithm>;


const NORTHERN_EUROPE_ADDRESS_TRANSLATION_PROFILES: Record<string, NorthernEuropeAddressTranslationProfile> = {
  SE: { countryCode: 'SE', nativeLanguages: ['sv'], defaultLanguage: 'sv', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'swedish-posten-international-shipping' },
  NO: { countryCode: 'NO', nativeLanguages: ['no'], defaultLanguage: 'no', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'norwegian-posten-address' },
  DK: { countryCode: 'DK', nativeLanguages: ['da'], defaultLanguage: 'da', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'danish-postnord-address' },
  FI: { countryCode: 'FI', nativeLanguages: ['fi', 'sv'], defaultLanguage: 'fi', defaultTopology: 'latin-finnic', englishAlgorithm: 'finnish-swedish-posti-address' },
  LV: { countryCode: 'LV', nativeLanguages: ['lv'], defaultLanguage: 'lv', defaultTopology: 'latin-baltic', englishAlgorithm: 'latvian-pasts-address' },
  EE: { countryCode: 'EE', nativeLanguages: ['et'], defaultLanguage: 'et', defaultTopology: 'latin-finnic', englishAlgorithm: 'estonian-eesti-post-address' },
  LT: { countryCode: 'LT', nativeLanguages: ['lt'], defaultLanguage: 'lt', defaultTopology: 'latin-baltic', englishAlgorithm: 'lithuanian-post-address' },
  IS: { countryCode: 'IS', nativeLanguages: ['is'], defaultLanguage: 'is', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'icelandic-posturinn-address' },
  AX: { countryCode: 'AX', nativeLanguages: ['sv', 'fi'], defaultLanguage: 'sv', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'aland-swedish-finnish-address' },
  GL: { countryCode: 'GL', nativeLanguages: ['kl', 'da'], defaultLanguage: 'kl', defaultTopology: 'latin-inuit', englishAlgorithm: 'greenland-kalaallisut-danish-address' },
  FO: { countryCode: 'FO', nativeLanguages: ['fo', 'da'], defaultLanguage: 'fo', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'faroe-faroese-danish-address' },
  SJ_SVA: { countryCode: 'SJ_SVA', nativeLanguages: ['no'], defaultLanguage: 'no', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'norwegian-svalbard-address' },
  SJ_JAN: { countryCode: 'SJ_JAN', nativeLanguages: ['no'], defaultLanguage: 'no', defaultTopology: 'latin-north-germanic', englishAlgorithm: 'norwegian-jan-mayen-address' },
};

const NORTHERN_EUROPE_TOPOLOGY_BY_LANGUAGE: Record<string, NorthernEuropeAddressTopology> = {
  en: 'latin-address',
  sv: 'latin-north-germanic',
  no: 'latin-north-germanic',
  da: 'latin-north-germanic',
  fo: 'latin-north-germanic',
  is: 'latin-north-germanic',
  fi: 'latin-finnic',
  et: 'latin-finnic',
  lv: 'latin-baltic',
  lt: 'latin-baltic',
  kl: 'latin-inuit',
};

const COMMON_NORTHERN_EUROPE_ADDRESS_TERMS: Record<string, string> = {
  Namn: 'Name',
  Navn: 'Name',
  Nimi: 'Name',
  Nimiq: 'Name',
  Nimið: 'Name',
  Gata: 'Street',
  Gate: 'Street',
  Gade: 'Street',
  Gøta: 'Street',
  Gota: 'Street',
  Katu: 'Street',
  Iela: 'Street',
  Tänav: 'Street',
  Tanav: 'Street',
  Gatvė: 'Street',
  Gatve: 'Street',
  Vegur: 'Street',
  Aqqut: 'Road',
  Aqqusinersuaq: 'Main Road',
  Väg: 'Road',
  Vag: 'Road',
  Vei: 'Road',
  Vej: 'Road',
  Tie: 'Road',
  Husnummer: 'House Number',
  Husnr: 'House Number',
  Nummer: 'Number',
  Númer: 'Number',
  Numero: 'Number',
  Numurs: 'Number',
  Numeris: 'Number',
  Postnummer: 'Postal Code',
  Postnr: 'Postal Code',
  Postinumero: 'Postal Code',
  Pastaindekss: 'Postal Code',
  Postiindeks: 'Postal Code',
  'Pašto kodas': 'Postal Code',
  'Pasto kodas': 'Postal Code',
  Póstnúmer: 'Postal Code',
  Postnúmer: 'Postal Code',
  By: 'City',
  Sted: 'Town',
  Kaupunki: 'City',
  Pilsēta: 'City',
  Pilseta: 'City',
  Linn: 'City',
  Miestas: 'City',
  Bær: 'Town',
  Baer: 'Town',
  Kommuna: 'Municipality',
  Kommune: 'Municipality',
  Kommun: 'Municipality',
  Kunta: 'Municipality',
  Novads: 'Municipality',
  Vald: 'Municipality',
  Savivaldybė: 'Municipality',
  Savivaldybe: 'Municipality',
};

const NORTHERN_EUROPE_ENGLISH_ALIASES: Record<string, Record<string, string>> = {
  SE: {
    Sverige: 'Sweden',
    Stockholm: 'Stockholm',
    Göteborg: 'Gothenburg',
    Goteborg: 'Gothenburg',
    Malmö: 'Malmo',
    Malmo: 'Malmo',
    Uppsala: 'Uppsala',
  },
  NO: {
    Norge: 'Norway',
    Oslo: 'Oslo',
    Bergen: 'Bergen',
    Trondheim: 'Trondheim',
    Tromsø: 'Tromso',
    Tromso: 'Tromso',
  },
  DK: {
    Danmark: 'Denmark',
    København: 'Copenhagen',
    Kobenhavn: 'Copenhagen',
    Aarhus: 'Aarhus',
    Århus: 'Aarhus',
    Odense: 'Odense',
  },
  FI: {
    Suomi: 'Finland',
    Finland: 'Finland',
    Helsinki: 'Helsinki',
    Helsingfors: 'Helsinki',
    Turku: 'Turku',
    Åbo: 'Turku',
    Tampere: 'Tampere',
  },
  LV: {
    Latvija: 'Latvia',
    Rīga: 'Riga',
    Riga: 'Riga',
    Daugavpils: 'Daugavpils',
    Liepāja: 'Liepaja',
    Liepaja: 'Liepaja',
  },
  EE: {
    Eesti: 'Estonia',
    Tallinn: 'Tallinn',
    Tartu: 'Tartu',
    Narva: 'Narva',
  },
  LT: {
    Lietuva: 'Lithuania',
    Vilnius: 'Vilnius',
    Kaunas: 'Kaunas',
    Klaipėda: 'Klaipeda',
    Klaipeda: 'Klaipeda',
  },
  IS: {
    Ísland: 'Iceland',
    Island: 'Iceland',
    Reykjavík: 'Reykjavik',
    Reykjavik: 'Reykjavik',
    Akureyri: 'Akureyri',
  },
  AX: {
    Åland: 'Aland Islands',
    Aland: 'Aland Islands',
    Mariehamn: 'Mariehamn',
  },
  GL: {
    'Kalaallit Nunaat': 'Greenland',
    Grønland: 'Greenland',
    Gronland: 'Greenland',
    Nuuk: 'Nuuk',
    Godthåb: 'Nuuk',
    Godthab: 'Nuuk',
    Ilulissat: 'Ilulissat',
  },
  FO: {
    Føroyar: 'Faroe Islands',
    Færøerne: 'Faroe Islands',
    Faeroerne: 'Faroe Islands',
    Tórshavn: 'Torshavn',
    Torshavn: 'Torshavn',
  },
  SJ_SVA: {
    Svalbard: 'Svalbard',
    Longyearbyen: 'Longyearbyen',
  },
  SJ_JAN: {
    'Jan Mayen': 'Jan Mayen',
  },
};


function countryCodeOf(countryCode: string) {
  return (countryCode || '').trim().toUpperCase().replace(/-/g, '_');
}

export function getNorthernEuropeAddressTranslationProfile(countryCode: string) {
  return NORTHERN_EUROPE_ADDRESS_TRANSLATION_PROFILES[countryCodeOf(countryCode)] || null;
}

function normalizeNorthernEuropeAddressLanguage(
  language: string | undefined | null,
  profile: NorthernEuropeAddressTranslationProfile,
) {
  return normalizeAddressTranslationLanguage(language, profile);
}

function isAllowedLanguage(language: string, profile: NorthernEuropeAddressTranslationProfile) {
  return language === 'en' || profile.nativeLanguages.includes(language);
}

function topologyForLanguage(language: string, profile: NorthernEuropeAddressTranslationProfile) {
  return NORTHERN_EUROPE_TOPOLOGY_BY_LANGUAGE[language] || profile.defaultTopology;
}

export function chooseNorthernEuropeAddressTranslationRoute(options: {
  countryCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
}): NorthernEuropeAddressTranslationRoute | null {
  const profile = getNorthernEuropeAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const sourceLanguage = normalizeNorthernEuropeAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeNorthernEuropeAddressLanguage(options.targetLanguage, profile);
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

function normalizeNorthernEuropeEnglish(text: string, countryCode: string, fieldKey: string) {
  const code = countryCodeOf(countryCode);
  const aliases = NORTHERN_EUROPE_ENGLISH_ALIASES[code] || {};
  if (aliases[text]) return aliases[text];
  if (COMMON_NORTHERN_EUROPE_ADDRESS_TERMS[text]) return COMMON_NORTHERN_EUROPE_ADDRESS_TERMS[text];

  if (shouldUseBuildingEnglish(fieldKey)) {
    const building = normalizeEnglishAddressBuildingName(text, code);
    if (building) return building;
  }

  return normalizeEnglishAddressPart(text, code);
}

export async function translateNorthernEuropeAddressField(options: {
  countryCode: string;
  fieldKey: string;
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translator?: AddressFieldTranslator;
}): Promise<{ text: string; route: NorthernEuropeAddressTranslationRoute } | null> {
  const profile = getNorthernEuropeAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const text = String(options.text ?? '').trim();
  if (!text) return null;

  const route = chooseNorthernEuropeAddressTranslationRoute(options);
  if (!route) return null;

  const sourceLanguage = normalizeNorthernEuropeAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeNorthernEuropeAddressLanguage(options.targetLanguage, profile);

  return translateAddressFieldByRoute({
    text,
    route,
    fieldKey: options.fieldKey,
    sourceLanguage,
    targetLanguage,
    normalizeEnglish: value => normalizeNorthernEuropeEnglish(value, profile.countryCode, options.fieldKey),
    translator: options.translator,
  });
}
