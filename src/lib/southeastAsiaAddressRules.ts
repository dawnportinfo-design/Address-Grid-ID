export type SoutheastAsiaAddressCountryCode =
  | 'MM'
  | 'TH'
  | 'VN'
  | 'KH'
  | 'LA'
  | 'MY'
  | 'SG'
  | 'ID'
  | 'PH'
  | 'BN'
  | 'TL';

export type SoutheastAsiaAddressField =
  | 'postcode'
  | 'province'
  | 'provinceOrCity'
  | 'stateOrRegion'
  | 'state'
  | 'district'
  | 'subdistrict'
  | 'city'
  | 'cityOrRegency'
  | 'municipality'
  | 'commune'
  | 'village'
  | 'ward'
  | 'barangay'
  | 'mukim'
  | 'street'
  | 'houseNumber'
  | 'building'
  | 'unit'
  | 'name';

export type SoutheastAsiaAddressLanguage = {
  code: string;
  name: string;
};

export type SoutheastAsiaPostalCodeRule = {
  label: string;
  pattern: string;
  required: boolean;
  usage: 'required' | 'used' | 'partial';
};

export type SoutheastAsiaAddressRule = {
  countryCode: SoutheastAsiaAddressCountryCode;
  countryName: string;
  languages: SoutheastAsiaAddressLanguage[];
  nativeOrder: SoutheastAsiaAddressField[];
  englishOrder: SoutheastAsiaAddressField[];
  regionalHierarchy: SoutheastAsiaAddressField[];
  postalCode: SoutheastAsiaPostalCodeRule | null;
};

const fiveDigitRequired: SoutheastAsiaPostalCodeRule = {
  label: '5 digits required',
  pattern: '^\\d{5}$',
  required: true,
  usage: 'required',
};

const fiveDigitUsed: SoutheastAsiaPostalCodeRule = {
  label: '5 digits used',
  pattern: '^\\d{5}$',
  required: false,
  usage: 'used',
};

export const SOUTHEAST_ASIA_ADDRESS_RULES: Record<
  SoutheastAsiaAddressCountryCode,
  SoutheastAsiaAddressRule
> = {
  MM: {
    countryCode: 'MM',
    countryName: 'Myanmar',
    languages: [{ code: 'my', name: 'Burmese' }],
    nativeOrder: ['city', 'stateOrRegion', 'street', 'houseNumber', 'name'],
    englishOrder: ['city', 'stateOrRegion', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['stateOrRegion', 'city'],
    postalCode: {
      label: '5 digits partially maintained',
      pattern: '^\\d{5}$',
      required: false,
      usage: 'partial',
    },
  },
  TH: {
    countryCode: 'TH',
    countryName: 'Thailand',
    languages: [{ code: 'th', name: 'Thai' }],
    nativeOrder: ['postcode', 'province', 'district', 'subdistrict', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'province', 'district', 'subdistrict', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['province', 'district', 'subdistrict'],
    postalCode: fiveDigitRequired,
  },
  VN: {
    countryCode: 'VN',
    countryName: 'Vietnam',
    languages: [{ code: 'vi', name: 'Vietnamese' }],
    nativeOrder: ['postcode', 'provinceOrCity', 'district', 'ward', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'provinceOrCity', 'district', 'ward', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['provinceOrCity', 'district', 'ward'],
    postalCode: {
      label: '6 digits required',
      pattern: '^\\d{6}$',
      required: true,
      usage: 'required',
    },
  },
  KH: {
    countryCode: 'KH',
    countryName: 'Cambodia',
    languages: [{ code: 'km', name: 'Khmer' }],
    nativeOrder: ['postcode', 'province', 'district', 'commune', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'province', 'district', 'commune', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['province', 'district', 'commune'],
    postalCode: fiveDigitUsed,
  },
  LA: {
    countryCode: 'LA',
    countryName: 'Laos',
    languages: [{ code: 'lo', name: 'Lao' }],
    nativeOrder: ['postcode', 'province', 'district', 'village', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'province', 'district', 'village', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['province', 'district', 'village'],
    postalCode: fiveDigitUsed,
  },
  MY: {
    countryCode: 'MY',
    countryName: 'Malaysia',
    languages: [{ code: 'ms', name: 'Malay' }],
    nativeOrder: ['postcode', 'state', 'district', 'city', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'state', 'district', 'city', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['state', 'district'],
    postalCode: fiveDigitRequired,
  },
  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    languages: [
      { code: 'en', name: 'English' },
      { code: 'ms', name: 'Malay' },
      { code: 'zh', name: 'Chinese' },
    ],
    nativeOrder: ['name', 'building', 'street', 'unit', 'postcode'],
    englishOrder: ['postcode', 'street', 'building', 'unit', 'name'],
    regionalHierarchy: ['city'],
    postalCode: {
      label: '6 digits required',
      pattern: '^\\d{6}$',
      required: true,
      usage: 'required',
    },
  },
  ID: {
    countryCode: 'ID',
    countryName: 'Indonesia',
    languages: [{ code: 'id', name: 'Indonesian' }],
    nativeOrder: ['postcode', 'province', 'cityOrRegency', 'district', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'province', 'cityOrRegency', 'district', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['province', 'cityOrRegency', 'district'],
    postalCode: fiveDigitRequired,
  },
  PH: {
    countryCode: 'PH',
    countryName: 'Philippines',
    languages: [
      { code: 'fil', name: 'Filipino' },
      { code: 'en', name: 'English' },
    ],
    nativeOrder: ['postcode', 'province', 'city', 'barangay', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'province', 'city', 'barangay', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['province', 'city', 'barangay'],
    postalCode: {
      label: '4 digits used',
      pattern: '^\\d{4}$',
      required: false,
      usage: 'used',
    },
  },
  BN: {
    countryCode: 'BN',
    countryName: 'Brunei',
    languages: [{ code: 'ms', name: 'Malay' }],
    nativeOrder: ['postcode', 'district', 'mukim', 'street', 'houseNumber', 'name'],
    englishOrder: ['postcode', 'district', 'mukim', 'street', 'houseNumber', 'name'],
    regionalHierarchy: ['district', 'mukim'],
    postalCode: {
      label: '2 letters plus 4 digits required',
      pattern: '^[A-Z]{2}\\d{4}$',
      required: true,
      usage: 'required',
    },
  },
  TL: {
    countryCode: 'TL',
    countryName: 'Timor-Leste',
    languages: [
      { code: 'tet', name: 'Tetum' },
      { code: 'pt', name: 'Portuguese' },
    ],
    nativeOrder: ['municipality', 'village', 'street', 'name'],
    englishOrder: ['municipality', 'village', 'street', 'name'],
    regionalHierarchy: ['municipality', 'village'],
    postalCode: null,
  },
};

export const getSoutheastAsiaAddressRule = (countryCode: string) =>
  SOUTHEAST_ASIA_ADDRESS_RULES[countryCode.toUpperCase() as SoutheastAsiaAddressCountryCode];
