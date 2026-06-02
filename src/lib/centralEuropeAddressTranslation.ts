import { normalizeEnglishAddressBuildingName,normalizeEnglishAddressPart } from './addressEnglish';
import { chooseCommonAddressTranslationRoute,translateAddressFieldByRoute,type AddressFieldTranslator,type AddressTranslationRoute } from './addressTranslationRouteCore';
import { isAddressBuildingField,normalizeAddressTranslationCountryCode,normalizeAddressTranslationLanguage,type AddressTranslationProfile } from './addressTranslationRegion';

export type CentralEuropeAddressTopology =
  | 'latin-address'
  | 'latin-slavic'
  | 'latin-uralic';

export type CentralEuropeEnglishAlgorithm =
  | 'polish-poczta-polska-international-shipping'
  | 'czech-posta-address'
  | 'slovak-posta-address'
  | 'hungarian-magyar-posta-address'
  | 'slovenian-posta-slovenije-address'
  | 'croatian-hrvatska-posta-address';

export type CentralEuropeAddressTranslationRoute = AddressTranslationRoute<CentralEuropeAddressTopology, CentralEuropeEnglishAlgorithm>;

export type CentralEuropeAddressTranslationProfile = AddressTranslationProfile<CentralEuropeAddressTopology, CentralEuropeEnglishAlgorithm>;


const CENTRAL_EUROPE_ADDRESS_TRANSLATION_PROFILES: Record<string, CentralEuropeAddressTranslationProfile> = {
  PL: { countryCode: 'PL', nativeLanguages: ['pl'], defaultLanguage: 'pl', defaultTopology: 'latin-slavic', englishAlgorithm: 'polish-poczta-polska-international-shipping' },
  CZ: { countryCode: 'CZ', nativeLanguages: ['cs'], defaultLanguage: 'cs', defaultTopology: 'latin-slavic', englishAlgorithm: 'czech-posta-address' },
  SK: { countryCode: 'SK', nativeLanguages: ['sk'], defaultLanguage: 'sk', defaultTopology: 'latin-slavic', englishAlgorithm: 'slovak-posta-address' },
  HU: { countryCode: 'HU', nativeLanguages: ['hu'], defaultLanguage: 'hu', defaultTopology: 'latin-uralic', englishAlgorithm: 'hungarian-magyar-posta-address' },
  SI: { countryCode: 'SI', nativeLanguages: ['sl'], defaultLanguage: 'sl', defaultTopology: 'latin-slavic', englishAlgorithm: 'slovenian-posta-slovenije-address' },
  HR: { countryCode: 'HR', nativeLanguages: ['hr'], defaultLanguage: 'hr', defaultTopology: 'latin-slavic', englishAlgorithm: 'croatian-hrvatska-posta-address' },
};

const CENTRAL_EUROPE_TOPOLOGY_BY_LANGUAGE: Record<string, CentralEuropeAddressTopology> = {
  en: 'latin-address',
  pl: 'latin-slavic',
  cs: 'latin-slavic',
  sk: 'latin-slavic',
  sl: 'latin-slavic',
  hr: 'latin-slavic',
  hu: 'latin-uralic',
};

const COMMON_CENTRAL_EUROPE_ADDRESS_TERMS: Record<string, string> = {
  Imię: 'Name',
  Nazwa: 'Name',
  Jméno: 'Name',
  Meno: 'Name',
  Név: 'Name',
  Ime: 'Name',
  Ulica: 'Street',
  Ulice: 'Street',
  Ulicaa: 'Street',
  Utca: 'Street',
  Cesta: 'Road',
  Trg: 'Square',
  Tér: 'Square',
  Numer: 'Number',
  Číslo: 'Number',
  Cislo: 'Number',
  Házszám: 'House Number',
  Hazszam: 'House Number',
  Številka: 'Number',
  Stevilka: 'Number',
  Broj: 'Number',
  'Kod pocztowy': 'Postal Code',
  PSČ: 'Postal Code',
  PSC: 'Postal Code',
  Irányítószám: 'Postal Code',
  Iranyitoszam: 'Postal Code',
  'Poštna številka': 'Postal Code',
  'Postna stevilka': 'Postal Code',
  'Poštanski broj': 'Postal Code',
  'Postanski broj': 'Postal Code',
  Miasto: 'City',
  Město: 'City',
  Mesto: 'City',
  Város: 'City',
  Varos: 'City',
  Grad: 'City',
  Województwo: 'Region',
  Wojewodztwo: 'Region',
  Kraj: 'Region',
  Županija: 'County',
  Zupanija: 'County',
  Megye: 'County',
  Powiat: 'District',
  Okres: 'District',
  Kerület: 'District',
  Kerulet: 'District',
  Občina: 'Municipality',
  Obcina: 'Municipality',
  Općina: 'Municipality',
  Opcina: 'Municipality',
};

const CENTRAL_EUROPE_ENGLISH_ALIASES: Record<string, Record<string, string>> = {
  PL: {
    Polska: 'Poland',
    Warszawa: 'Warsaw',
    Kraków: 'Krakow',
    Krakow: 'Krakow',
    Łódź: 'Lodz',
    Lodz: 'Lodz',
    Wrocław: 'Wroclaw',
    Wroclaw: 'Wroclaw',
    Gdańsk: 'Gdansk',
    Gdansk: 'Gdansk',
    Poznań: 'Poznan',
    Poznan: 'Poznan',
  },
  CZ: {
    Česko: 'Czechia',
    Cesko: 'Czechia',
    'Česká republika': 'Czechia',
    'Ceska republika': 'Czechia',
    Praha: 'Prague',
    Brno: 'Brno',
    Ostrava: 'Ostrava',
    Plzeň: 'Pilsen',
    Plzen: 'Pilsen',
  },
  SK: {
    Slovensko: 'Slovakia',
    Bratislava: 'Bratislava',
    Košice: 'Kosice',
    Kosice: 'Kosice',
    Prešov: 'Presov',
    Presov: 'Presov',
    Žilina: 'Zilina',
    Zilina: 'Zilina',
  },
  HU: {
    Magyarország: 'Hungary',
    Magyarorszag: 'Hungary',
    Budapest: 'Budapest',
    Debrecen: 'Debrecen',
    Szeged: 'Szeged',
    Miskolc: 'Miskolc',
    Pécs: 'Pecs',
    Pecs: 'Pecs',
  },
  SI: {
    Slovenija: 'Slovenia',
    Ljubljana: 'Ljubljana',
    Maribor: 'Maribor',
    Koper: 'Koper',
    Celje: 'Celje',
  },
  HR: {
    Hrvatska: 'Croatia',
    Zagreb: 'Zagreb',
    Split: 'Split',
    Rijeka: 'Rijeka',
    Dubrovnik: 'Dubrovnik',
    Osijek: 'Osijek',
  },
};


function countryCodeOf(countryCode: string) {
  return (countryCode || '').trim().toUpperCase().replace(/-/g, '_');
}

export function getCentralEuropeAddressTranslationProfile(countryCode: string) {
  return CENTRAL_EUROPE_ADDRESS_TRANSLATION_PROFILES[countryCodeOf(countryCode)] || null;
}

function normalizeCentralEuropeAddressLanguage(
  language: string | undefined | null,
  profile: CentralEuropeAddressTranslationProfile,
) {
  return normalizeAddressTranslationLanguage(language, profile);
}

function isAllowedLanguage(language: string, profile: CentralEuropeAddressTranslationProfile) {
  return language === 'en' || profile.nativeLanguages.includes(language);
}

function topologyForLanguage(language: string, profile: CentralEuropeAddressTranslationProfile) {
  return CENTRAL_EUROPE_TOPOLOGY_BY_LANGUAGE[language] || profile.defaultTopology;
}

export function chooseCentralEuropeAddressTranslationRoute(options: {
  countryCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
}): CentralEuropeAddressTranslationRoute | null {
  const profile = getCentralEuropeAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const sourceLanguage = normalizeCentralEuropeAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeCentralEuropeAddressLanguage(options.targetLanguage, profile);
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

function normalizeCentralEuropeEnglish(text: string, countryCode: string, fieldKey: string) {
  const code = countryCodeOf(countryCode);
  const aliases = CENTRAL_EUROPE_ENGLISH_ALIASES[code] || {};
  if (aliases[text]) return aliases[text];
  if (COMMON_CENTRAL_EUROPE_ADDRESS_TERMS[text]) return COMMON_CENTRAL_EUROPE_ADDRESS_TERMS[text];

  if (shouldUseBuildingEnglish(fieldKey)) {
    const building = normalizeEnglishAddressBuildingName(text, code);
    if (building) return building;
  }

  return normalizeEnglishAddressPart(text, code);
}

export async function translateCentralEuropeAddressField(options: {
  countryCode: string;
  fieldKey: string;
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translator?: AddressFieldTranslator;
}): Promise<{ text: string; route: CentralEuropeAddressTranslationRoute } | null> {
  const profile = getCentralEuropeAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const text = String(options.text ?? '').trim();
  if (!text) return null;

  const route = chooseCentralEuropeAddressTranslationRoute(options);
  if (!route) return null;

  const sourceLanguage = normalizeCentralEuropeAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeCentralEuropeAddressLanguage(options.targetLanguage, profile);

  return translateAddressFieldByRoute({
    text,
    route,
    fieldKey: options.fieldKey,
    sourceLanguage,
    targetLanguage,
    normalizeEnglish: value => normalizeCentralEuropeEnglish(value, profile.countryCode, options.fieldKey),
    translator: options.translator,
  });
}
