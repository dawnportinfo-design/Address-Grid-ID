import type { CanonicalAddressParts } from './addressIntelligence';
import { normalizeEnglishAddressPart } from './addressEnglish';

type AddressFieldRule = {
  key: string;
  label?: string;
  required?: boolean;
};

type LanguageAddressFormat = {
  addressFormat: string;
  fields?: AddressFieldRule[];
};

type OpenAddressFormat = {
  countryCode?: string;
  name?: string;
  native?: LanguageAddressFormat;
  english?: LanguageAddressFormat;
  postalCode?: {
    regex?: string | null;
    source?: string;
  };
};

export type AddressValidationResult = {
  status: 'verified' | 'partial';
  score: number;
  postalCodeValid: boolean | null;
  missingRequiredFields: string[];
  warnings: string[];
  checkedWith: string[];
  displays: {
    native?: string;
    english?: string;
  };
};

type AddressValidationOptions = {
  referenceMatches?: Array<{
    source: string;
    confidence: number;
  }>;
};

const clean = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/[\u3000\s]+/g, ' ').trim();

function valueForField(address: CanonicalAddressParts, field: string) {
  const key = field === 'street' ? 'road' : field === 'houseNumber' ? 'house_number' : field;
  return clean(address[key as keyof CanonicalAddressParts]);
}

function templateValues(address: CanonicalAddressParts, english = false) {
  const countryCode = clean(address.country_code).toUpperCase();
  const value = (raw: unknown) => english ? normalizeEnglishAddressPart(raw, countryCode) : clean(raw);

  return {
    country: value(address.country),
    countryCode,
    state: value(address.state),
    city: value(address.city),
    district: value(address.district),
    subdistrict: value(address.subdistrict || address.suburb),
    suburb: value(address.suburb),
    street: value(address.road),
    houseNumber: value(address.house_number),
    organization: value(address.building || address.poi),
    postcode: clean(address.postcode),
  };
}

function renderTemplate(format: string | undefined, address: CanonicalAddressParts, english = false) {
  if (!format) return undefined;
  const values = templateValues(address, english);
  const rendered = format.replace(/{{(\w+)}}/g, (_, key: keyof typeof values) => values[key] || '');
  return rendered
    .split('\n')
    .map(line => line
      .replace(/[ \t]+/g, ' ')
      .replace(/\s+,/g, ',')
      .replace(/^[,，、]\s*/g, '')
      .replace(/,\s*$/g, '')
      .trim()
    )
    .filter(Boolean)
    .join('\n');
}

function requiredMissing(format: OpenAddressFormat | null | undefined, address: CanonicalAddressParts) {
  const fields = format?.native?.fields || [];
  return fields
    .filter(field => field.required)
    .map(field => field.key)
    .filter(key => !valueForField(address, key));
}

function validatePostcode(format: OpenAddressFormat | null | undefined, address: CanonicalAddressParts) {
  const postcode = clean(address.postcode);
  const regex = format?.postalCode?.regex;
  if (!postcode || !regex) return null;
  return new RegExp(regex).test(postcode);
}

export function validateAddressWithOpenSourceRules(
  address: CanonicalAddressParts,
  format?: OpenAddressFormat | null,
  sources: string[] = [],
  options: AddressValidationOptions = {}
): AddressValidationResult {
  const missingRequiredFields = requiredMissing(format, address);
  const postalCodeValid = validatePostcode(format, address);
  const warnings: string[] = [];

  if (missingRequiredFields.length) {
    warnings.push(`Missing required fields: ${missingRequiredFields.join(', ')}`);
  }

  if (postalCodeValid === false) {
    warnings.push('Invalid postcode format for the selected country');
  }

  const checkedWith = Array.from(new Set([
    ...sources.filter(Boolean),
    ...(options.referenceMatches || []).map(match => match.source),
    format?.name,
    format?.postalCode?.source,
    'open-address-format-rules',
  ].filter(Boolean) as string[]));

  const filledCoreFields = ['country_code', 'postcode', 'state', 'city', 'road', 'house_number']
    .filter(key => clean(address[key as keyof CanonicalAddressParts])).length;
  const fieldScore = filledCoreFields / 6;
  const penalty = missingRequiredFields.length * 0.18 + (postalCodeValid === false ? 0.2 : 0);
  const referenceBoost = Math.max(0, ...(options.referenceMatches || []).map(match => match.confidence));
  const baseScore = fieldScore - penalty + Math.min(checkedWith.length, 3) * 0.03;
  const score = Math.max(0, Math.min(0.99, Math.round(Math.max(baseScore, referenceBoost) * 100) / 100));

  return {
    status: missingRequiredFields.length === 0 && postalCodeValid !== false ? 'verified' : 'partial',
    score,
    postalCodeValid,
    missingRequiredFields,
    warnings,
    checkedWith,
    displays: {
      native: renderTemplate(format?.native?.addressFormat, address),
      english: renderTemplate(format?.english?.addressFormat, address, true),
    },
  };
}
