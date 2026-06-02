import { normalizeEnglishAddressBuildingName,normalizeEnglishAddressPart } from './addressEnglish';
import { chooseCommonAddressTranslationRoute,translateAddressFieldByRoute,type AddressFieldTranslator,type AddressTranslationRoute } from './addressTranslationRouteCore';
import { isAddressBuildingField,normalizeAddressTranslationCountryCode,normalizeAddressTranslationLanguage,type AddressTranslationProfile } from './addressTranslationRegion';

export type SouthernAfricaAddressTopology =
  | 'english-address'
  | 'latin-afrikaans'
  | 'latin-bantu'
  | 'latin-french'
  | 'latin-portuguese'
  | 'latin-creole'
  | 'arabic-abjad'
  | 'latin-address';

export type SouthernAfricaEnglishAlgorithm =
  | 'south-africa-multilingual-address'
  | 'southern-africa-english-domestic-international'
  | 'southern-africa-lusophone-international-shipping'
  | 'lesotho-english-sesotho-address'
  | 'eswatini-english-siswati-address'
  | 'mauritius-english-french-address'
  | 'comoros-french-arabic-address'
  | 'seychelles-english-french-creole-address';

export type SouthernAfricaAddressTranslationRoute = AddressTranslationRoute<SouthernAfricaAddressTopology, SouthernAfricaEnglishAlgorithm>;

export type SouthernAfricaAddressTranslationProfile = AddressTranslationProfile<SouthernAfricaAddressTopology, SouthernAfricaEnglishAlgorithm>;


const SOUTHERN_AFRICA_ADDRESS_TRANSLATION_PROFILES: Record<string, SouthernAfricaAddressTranslationProfile> = {
  ZA: { countryCode: 'ZA', nativeLanguages: ['en', 'af', 'zu', 'xh'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'south-africa-multilingual-address' },
  NA: { countryCode: 'NA', nativeLanguages: ['en', 'af', 'kj'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'southern-africa-english-domestic-international' },
  BW: { countryCode: 'BW', nativeLanguages: ['en', 'tn'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'southern-africa-english-domestic-international' },
  ZW: { countryCode: 'ZW', nativeLanguages: ['en', 'sn', 'nd'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'southern-africa-english-domestic-international' },
  MZ: { countryCode: 'MZ', nativeLanguages: ['pt'], defaultLanguage: 'pt', defaultTopology: 'latin-portuguese', englishAlgorithm: 'southern-africa-lusophone-international-shipping' },
  MW: { countryCode: 'MW', nativeLanguages: ['en', 'ny'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'southern-africa-english-domestic-international' },
  ZM: { countryCode: 'ZM', nativeLanguages: ['en', 'bem'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'southern-africa-english-domestic-international' },
  LS: { countryCode: 'LS', nativeLanguages: ['en', 'st'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'lesotho-english-sesotho-address' },
  SZ: { countryCode: 'SZ', nativeLanguages: ['en', 'ss'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'eswatini-english-siswati-address' },
  AO: { countryCode: 'AO', nativeLanguages: ['pt'], defaultLanguage: 'pt', defaultTopology: 'latin-portuguese', englishAlgorithm: 'southern-africa-lusophone-international-shipping' },
  MU: { countryCode: 'MU', nativeLanguages: ['en', 'fr'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'mauritius-english-french-address' },
  KM: { countryCode: 'KM', nativeLanguages: ['fr', 'ar'], defaultLanguage: 'fr', defaultTopology: 'latin-french', englishAlgorithm: 'comoros-french-arabic-address' },
  SC: { countryCode: 'SC', nativeLanguages: ['en', 'fr', 'crs'], defaultLanguage: 'en', defaultTopology: 'english-address', englishAlgorithm: 'seychelles-english-french-creole-address' },
};

const SOUTHERN_AFRICA_TOPOLOGY_BY_LANGUAGE: Record<string, SouthernAfricaAddressTopology> = {
  en: 'english-address',
  af: 'latin-afrikaans',
  zu: 'latin-bantu',
  xh: 'latin-bantu',
  kj: 'latin-bantu',
  tn: 'latin-bantu',
  sn: 'latin-bantu',
  nd: 'latin-bantu',
  ny: 'latin-bantu',
  bem: 'latin-bantu',
  st: 'latin-bantu',
  ss: 'latin-bantu',
  fr: 'latin-french',
  pt: 'latin-portuguese',
  crs: 'latin-creole',
  ar: 'arabic-abjad',
};

const COMMON_SOUTHERN_AFRICA_ADDRESS_TERMS: Record<string, string> = {
  Name: 'Name',
  Recipient: 'Recipient',
  Street: 'Street',
  City: 'City',
  State: 'State',
  Region: 'Region',
  Province: 'Province',
  District: 'District',
  Municipality: 'Municipality',
  Suburb: 'Suburb',
  Village: 'Village',
  Town: 'Town',
  Number: 'Number',
  'Postal Code': 'Postal Code',
  Naam: 'Name',
  Straat: 'Street',
  Weg: 'Road',
  Laan: 'Avenue',
  Gebou: 'Building',
  Voorstad: 'Suburb',
  Nom: 'Name',
  Destinataire: 'Recipient',
  Rue: 'Street',
  Avenue: 'Avenue',
  Ville: 'City',
  Commune: 'Municipality',
  Quartier: 'Quarter',
  'Code postal': 'Postal Code',
  Nome: 'Name',
  Destinatário: 'Recipient',
  Destinatario: 'Recipient',
  Rua: 'Street',
  Cidade: 'City',
  Província: 'Province',
  Provincia: 'Province',
  Município: 'Municipality',
  Municipio: 'Municipality',
  Bairro: 'Neighborhood',
  Localidade: 'Locality',
  'Código Postal': 'Postal Code',
  'Codigo Postal': 'Postal Code',
  الاسم: 'Name',
  اسم: 'Name',
  الشارع: 'Street',
  شارع: 'Street',
  المدينة: 'City',
  مدينة: 'City',
  المنطقة: 'Area',
  منطقة: 'Area',
};

const SOUTHERN_AFRICA_ENGLISH_ALIASES: Record<string, Record<string, string>> = {
  ZA: {
    'South Africa': 'South Africa',
    'Suid-Afrika': 'South Africa',
    Mzansi: 'South Africa',
    eGoli: 'Johannesburg',
    Egoli: 'Johannesburg',
    Jozi: 'Johannesburg',
    iKapa: 'Cape Town',
    Ikapa: 'Cape Town',
    Kaapstad: 'Cape Town',
    eThekwini: 'Durban',
    Ethekwini: 'Durban',
    Tshwane: 'Pretoria',
    Gqeberha: 'Port Elizabeth',
    'Wes-Kaap': 'Western Cape',
    'Oos-Kaap': 'Eastern Cape',
  },
  NA: {
    Namibië: 'Namibia',
    Namibia: 'Namibia',
    Windhoek: 'Windhoek',
    Swakopmund: 'Swakopmund',
  },
  BW: {
    Botswana: 'Botswana',
    Gaborone: 'Gaborone',
    Francistown: 'Francistown',
  },
  ZW: {
    Zimbabwe: 'Zimbabwe',
    Harare: 'Harare',
    Bulawayo: 'Bulawayo',
    Mutare: 'Mutare',
  },
  MZ: {
    Moçambique: 'Mozambique',
    Mocambique: 'Mozambique',
    Mozambique: 'Mozambique',
    Maputo: 'Maputo',
    Beira: 'Beira',
  },
  MW: {
    Malawi: 'Malawi',
    Lilongwe: 'Lilongwe',
    Blantyre: 'Blantyre',
  },
  ZM: {
    Zambia: 'Zambia',
    Lusaka: 'Lusaka',
    Ndola: 'Ndola',
  },
  LS: {
    Lesotho: 'Lesotho',
    Maseru: 'Maseru',
  },
  SZ: {
    Eswatini: 'Eswatini',
    Swaziland: 'Eswatini',
    Mbabane: 'Mbabane',
    Manzini: 'Manzini',
  },
  AO: {
    Angola: 'Angola',
    Luanda: 'Luanda',
    Benguela: 'Benguela',
    Huambo: 'Huambo',
  },
  MU: {
    Maurice: 'Mauritius',
    Moris: 'Mauritius',
    Mauritius: 'Mauritius',
    'Port Louis': 'Port Louis',
  },
  KM: {
    Comores: 'Comoros',
    Comoros: 'Comoros',
    'جزر القمر': 'Comoros',
    Moroni: 'Moroni',
    موروني: 'Moroni',
  },
  SC: {
    Seychelles: 'Seychelles',
    Sesel: 'Seychelles',
    Victoria: 'Victoria',
  },
};


function countryCodeOf(countryCode: string) {
  return normalizeAddressTranslationCountryCode(countryCode);
}

export function getSouthernAfricaAddressTranslationProfile(countryCode: string) {
  return SOUTHERN_AFRICA_ADDRESS_TRANSLATION_PROFILES[countryCodeOf(countryCode)] || null;
}

function normalizeSouthernAfricaAddressLanguage(
  language: string | undefined | null,
  profile: SouthernAfricaAddressTranslationProfile,
) {
  return normalizeAddressTranslationLanguage(language, profile);
}

function isAllowedLanguage(language: string, profile: SouthernAfricaAddressTranslationProfile) {
  return language === 'en' || profile.nativeLanguages.includes(language);
}

function topologyForLanguage(language: string, profile: SouthernAfricaAddressTranslationProfile) {
  return SOUTHERN_AFRICA_TOPOLOGY_BY_LANGUAGE[language] || profile.defaultTopology;
}

export function chooseSouthernAfricaAddressTranslationRoute(options: {
  countryCode: string;
  sourceLanguage?: string;
  targetLanguage: string;
}): SouthernAfricaAddressTranslationRoute | null {
  const profile = getSouthernAfricaAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const sourceLanguage = normalizeSouthernAfricaAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeSouthernAfricaAddressLanguage(options.targetLanguage, profile);
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

function normalizeSouthernAfricaEnglish(text: string, countryCode: string, fieldKey: string) {
  const code = countryCodeOf(countryCode);
  const aliases = SOUTHERN_AFRICA_ENGLISH_ALIASES[code] || {};
  if (aliases[text]) return aliases[text];
  if (COMMON_SOUTHERN_AFRICA_ADDRESS_TERMS[text]) return COMMON_SOUTHERN_AFRICA_ADDRESS_TERMS[text];

  if (shouldUseBuildingEnglish(fieldKey)) {
    const building = normalizeEnglishAddressBuildingName(text, code);
    if (building) return building;
  }

  return normalizeEnglishAddressPart(text, code);
}

export async function translateSouthernAfricaAddressField(options: {
  countryCode: string;
  fieldKey: string;
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  translator?: AddressFieldTranslator;
}): Promise<{ text: string; route: SouthernAfricaAddressTranslationRoute } | null> {
  const profile = getSouthernAfricaAddressTranslationProfile(options.countryCode);
  if (!profile) return null;

  const text = String(options.text ?? '').trim();
  if (!text) return null;

  const route = chooseSouthernAfricaAddressTranslationRoute(options);
  if (!route) return null;

  const sourceLanguage = normalizeSouthernAfricaAddressLanguage(options.sourceLanguage, profile);
  const targetLanguage = normalizeSouthernAfricaAddressLanguage(options.targetLanguage, profile);

  return translateAddressFieldByRoute({
    text,
    route,
    fieldKey: options.fieldKey,
    sourceLanguage,
    targetLanguage,
    normalizeEnglish: value => normalizeSouthernAfricaEnglish(value, profile.countryCode, options.fieldKey),
    translator: options.translator,
  });
}
