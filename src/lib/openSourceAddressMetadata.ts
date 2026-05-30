import enTerritories from 'cldr-localenames-modern/main/en/territories.json';
import jaTerritories from 'cldr-localenames-modern/main/ja/territories.json';
import frTerritories from 'cldr-localenames-modern/main/fr/territories.json';
import esTerritories from 'cldr-localenames-modern/main/es/territories.json';
import type { AddressFormat, AddressField } from '../data/address_formats';

type LibaddressinputMetadata = {
  fmt?: string;
  lfmt?: string;
  require?: string;
  zip?: string;
  zipex?: string;
  name?: string;
  sub_keys?: string;
  sub_names?: string;
  sub_lnames?: string;
};

type ConvertOptions = {
  countryCode: string;
  metadata: LibaddressinputMetadata;
  englishMetadata?: LibaddressinputMetadata;
  locale?: string;
};

const FIELD_MAP: Record<string, { key: string; label: string }> = {
  N: { key: 'name', label: 'Name' },
  O: { key: 'organization', label: 'Organization' },
  A: { key: 'street', label: 'Street address' },
  D: { key: 'subdistrict', label: 'Dependent locality' },
  C: { key: 'city', label: 'City' },
  S: { key: 'state', label: 'State / Province' },
  Z: { key: 'postcode', label: 'Postal code' },
  X: { key: 'sortingCode', label: 'Sorting code' },
};

const TEMPLATE_MAP: Record<string, string> = {
  N: '{{name}}',
  O: '{{organization}}',
  A: '{{houseNumber}} {{street}}',
  D: '{{subdistrict}}',
  C: '{{city}}',
  S: '{{state}}',
  Z: '{{postcode}}',
  X: '{{sortingCode}}',
};

const TERRITORY_DATA: Record<string, any> = {
  en: enTerritories,
  ja: jaTerritories,
  fr: frTerritories,
  es: esTerritories,
};

function titleCaseAscii(value: string) {
  return value.toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase());
}

function normalizeCountryName(countryCode: string, metadata: LibaddressinputMetadata) {
  const fromCldr = getTerritoryDisplayName(countryCode, 'en');
  if (fromCldr !== countryCode.toUpperCase()) return fromCldr;
  return metadata.name ? titleCaseAscii(metadata.name) : countryCode.toUpperCase();
}

function fieldPlaceholders(format = '') {
  return Array.from(format.matchAll(/%([A-Z])/g)).map(match => match[1]);
}

function convertFormatTemplate(format = '') {
  return format
    .replace(/%n/g, '\n')
    .replace(/%([A-Z])/g, (_, field: string) => TEMPLATE_MAP[field] || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/,?\s*{{name}}\n/g, '')
    .trim();
}

function fieldsFromMetadata(metadata: LibaddressinputMetadata): AddressField[] {
  const required = new Set((metadata.require || '').split(''));
  const ordered = Array.from(new Set(fieldPlaceholders(metadata.fmt)));

  return ordered
    .map(field => FIELD_MAP[field])
    .filter(Boolean)
    .map(field => ({
      key: field.key,
      label: field.label,
      required: required.has(Object.entries(FIELD_MAP).find(([, mapped]) => mapped.key === field.key)?.[0] || ''),
    }));
}

function anchoredRegex(regex?: string) {
  if (!regex) return null;
  const starts = regex.startsWith('^') ? regex : `^${regex}`;
  return starts.endsWith('$') ? starts : `${starts}$`;
}

export function getTerritoryDisplayName(countryCode: string, locale = 'en') {
  const normalizedLocale = locale.toLowerCase().split('-')[0];
  const territories = TERRITORY_DATA[normalizedLocale]?.main?.[normalizedLocale]?.localeDisplayNames?.territories;
  const code = countryCode.toUpperCase();
  if (code === 'ZZ') return code;
  return territories?.[code] || TERRITORY_DATA.en.main.en.localeDisplayNames.territories[code] || code;
}

export function resolveAddressFormatMetadataPath(countryCode: string, knownRelativeJsonPaths: string[]) {
  const code = countryCode.toUpperCase();
  const exact = knownRelativeJsonPaths.find(relativePath => {
    const fileName = relativePath.replace(/\\/g, '/').split('/').pop() || '';
    return fileName.toUpperCase() === `${code}.JSON`;
  });
  return exact || `${code}.json`;
}

export function convertLibaddressinputMetadata({
  countryCode,
  metadata,
  englishMetadata,
  locale = 'en',
}: ConvertOptions): AddressFormat {
  const code = countryCode.toUpperCase();
  const nativeFormat = metadata.lfmt || metadata.fmt || '';
  const englishFormat = englishMetadata?.fmt || metadata.fmt || '';

  return {
    countryCode: code,
    name: normalizeCountryName(code, metadata),
    nativeName: getTerritoryDisplayName(code, locale),
    native: {
      name: getTerritoryDisplayName(code, locale),
      addressFormat: convertFormatTemplate(nativeFormat),
      ordering: nativeFormat.indexOf('%A') > nativeFormat.indexOf('%C') ? 'big-to-small' : 'small-to-big',
      fields: fieldsFromMetadata(metadata),
    },
    english: {
      name: getTerritoryDisplayName(code, 'en'),
      addressFormat: convertFormatTemplate(englishFormat),
      ordering: englishFormat.indexOf('%A') > englishFormat.indexOf('%C') ? 'big-to-small' : 'small-to-big',
      fields: fieldsFromMetadata(englishMetadata || metadata),
    },
    postalCode: {
      format: metadata.zipex || '',
      regex: anchoredRegex(metadata.zip),
      api: null,
      source: 'libaddressinput',
    },
  };
}
