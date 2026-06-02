import {
normalizeEnglishAddressBuildingName,
normalizeEnglishAddressPart,
renderDomesticEnglishPostalAddress,
renderEnglishPostalAddress,
} from './addressEnglish';
import type { CanonicalAddress } from './addressRendering';
import { getEnglishAddressCircle,type EnglishAddressCircle } from './languageTabs';

export type EnglishAddressMode = 'domestic' | 'international-shipping';

export type EnglishAddressModeProfile = {
  countryCode: string;
  circle: EnglishAddressCircle;
  domesticTab: 'en_domestic';
  internationalTab: 'en';
  normalizerId: 'english-address-normalizer-v1';
  buildingNormalizerId: 'english-building-name-normalizer-v1';
  domesticIncludesCountry: false;
  internationalIncludesCountry: true;
};

const BUILDING_FIELD_KEYS = new Set([
  'building',
  'organization',
  'company',
  'poi',
  'amenity',
  'shop',
  'office',
  'tourism',
]);

export function getEnglishAddressModeProfile(countryCode: string): EnglishAddressModeProfile {
  const country = countryCode.toUpperCase();

  return {
    countryCode: country,
    circle: getEnglishAddressCircle(country),
    domesticTab: 'en_domestic',
    internationalTab: 'en',
    normalizerId: 'english-address-normalizer-v1',
    buildingNormalizerId: 'english-building-name-normalizer-v1',
    domesticIncludesCountry: false,
    internationalIncludesCountry: true,
  };
}

export function normalizeEnglishAddressModeField(input: {
  countryCode: string;
  fieldKey: string;
  text: unknown;
  mode: EnglishAddressMode;
}) {
  const country = input.countryCode.toUpperCase();
  const text = String(input.text ?? '').trim();
  if (!text) return '';

  return BUILDING_FIELD_KEYS.has(input.fieldKey)
    ? normalizeEnglishAddressBuildingName(text, country)
    : normalizeEnglishAddressPart(text, country);
}

export function renderEnglishAddressMode(data: CanonicalAddress, mode: EnglishAddressMode) {
  return mode === 'domestic'
    ? renderDomesticEnglishPostalAddress(data)
    : renderEnglishPostalAddress(data, { includeCountry: true });
}
