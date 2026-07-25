import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { classifyAddressCoveragePolicy, hasAddressPostalCodeMetadata, type AddressCoverageFormatLike } from '../src/lib/addressCoveragePolicy';
import type { AddressVerificationField, AddressVerificationTargetCountryPolicy } from '../src/lib/addressVerificationEngine';

const ADDRESS_FORMAT_ROOT = join(process.cwd(), 'src', 'data', 'address_formats');
const OUTPUT_PATH = join(process.cwd(), 'src', 'lib', 'generatedAddressVerificationCountryPolicies.ts');

function walkJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walkJsonFiles(path) : path.endsWith('.json') ? [path] : [];
  });
}

function clean(value: unknown) {
  return String(value ?? '').normalize('NFKC').replace(/[\u3000\s]+/g, ' ').trim();
}

function normalizeCountryCode(value: unknown) {
  const code = clean(value).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  return code === 'UK' ? 'GB' : code;
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function fieldFromKey(key: string): AddressVerificationField | null {
  const fields: Record<string, AddressVerificationField> = {
    country: 'country', countryCode: 'country_code', country_code: 'country_code',
    postcode: 'postcode', postalCode: 'postcode', zip: 'postcode',
    state: 'state', province: 'state', region: 'state', city: 'city', locality: 'city', municipality: 'city',
    district: 'district', county: 'district', subdistrict: 'subdistrict', suburb: 'suburb',
    street: 'road', road: 'road', houseNumber: 'house_number', house_number: 'house_number',
    building: 'building', organization: 'building', poi: 'poi', plusCode: 'plus_code', plus_code: 'plus_code',
  };
  return fields[key] || null;
}

function requiredFields(formats: AddressCoverageFormatLike[]) {
  const hasPostalCode = formats.some(format => hasAddressPostalCodeMetadata(format));
  const fromFormats = formats.flatMap(format => [
    ...(format as { native?: { fields?: Array<{ key: string; required?: boolean }> } }).native?.fields || [],
    ...(format as { english?: { fields?: Array<{ key: string; required?: boolean }> } }).english?.fields || [],
  ]).filter(field => field.required).map(field => fieldFromKey(field.key)).filter(Boolean) as AddressVerificationField[];
  return [...new Set<AddressVerificationField>([
    'country_code',
    ...(hasPostalCode ? ['postcode' as const] : []),
    ...fromFormats,
  ])];
}

const policyRank = {
  'postal-reliable-api': 4,
  'no-postal-strong-geo': 3,
  'postal-weak-api': 2,
  'no-postal-weak-geo': 1,
} as const;

function policyFor(countryCode: string, formats: Array<{ file: string; format: AddressCoverageFormatLike }>) {
  const coverage = formats
    .map(item => classifyAddressCoveragePolicy(item.format).id)
    .sort((left, right) => policyRank[left] - policyRank[right] || left.localeCompare(right))[0]!;
  const multipleVariants = formats.length > 1;
  const hasPostalCode = formats.some(item => hasAddressPostalCodeMetadata(item.format));
  const sharedRegex = [...new Set(formats.map(item => clean(item.format.postalCode?.regex)).filter(Boolean))];
  const sharedFormat = [...new Set(formats.map(item => clean(item.format.postalCode?.format)).filter(Boolean))];
  const lookupSources = unique(formats.flatMap(item => [
    item.format.postalCode?.source,
    item.format.postalCode?.api,
    ...(item.format.openSourceIds || []),
    ...(item.format.addressRules?.openSourceIds || []),
  ]));
  const postalMode: AddressVerificationTargetCountryPolicy['postalMode'] = multipleVariants
    ? 'manual'
    : hasPostalCode
      ? 'format-and-lookup'
      : coverage === 'no-postal-strong-geo'
        ? 'geo-only'
        : 'manual';
  return {
    countryCode,
    enabled: true,
    label: formats.map(item => clean(item.format.name)).find(Boolean) || countryCode,
    postalMode,
    postcodeRegex: multipleVariants || sharedRegex.length !== 1 ? undefined : sharedRegex[0],
    postcodeFormat: multipleVariants || sharedFormat.length !== 1 ? undefined : sharedFormat[0],
    requiredFields: requiredFields(formats.map(item => item.format)),
    lookupSources,
    notes: [
      `Generated from ${formats.length} AGID country-format metadata record(s) using ${coverage}.`,
      multipleVariants
        ? 'Multiple format variants require scope review; automatic postal lookup is intentionally disabled.'
        : hasPostalCode
          ? 'Postal format is not a delivery or address verification result; trusted matched evidence remains required.'
          : 'No normal postal code is assumed; geographic or manual evidence is required.',
      'Official source rights, version, freshness, correction path, and aggregate evaluation remain separate release gates.',
    ],
  } satisfies AddressVerificationTargetCountryPolicy;
}

const grouped = new Map<string, Array<{ file: string; format: AddressCoverageFormatLike }>>();
for (const file of walkJsonFiles(ADDRESS_FORMAT_ROOT)) {
  try {
    const format = JSON.parse(readFileSync(file, 'utf8')) as AddressCoverageFormatLike;
    const countryCode = normalizeCountryCode(format.countryCode);
    if (!countryCode) continue;
    const group = grouped.get(countryCode) || [];
    group.push({ file: relative(ADDRESS_FORMAT_ROOT, file).replace(/\\/g, '/'), format });
    grouped.set(countryCode, group);
  } catch {
    // Malformed source metadata is ignored here and remains visible to the format validation suite.
  }
}

const policies = Object.fromEntries([...grouped.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([countryCode, formats]) => [countryCode, policyFor(countryCode, formats)]));
const output = `// Generated by scripts/generate-address-verification-country-policies.ts. Do not edit manually.\n` +
  `import type { AddressVerificationTargetCountryPolicy } from './addressVerificationEngine';\n\n` +
  `export const GENERATED_ADDRESS_VERIFICATION_TARGET_POLICIES: Record<string, AddressVerificationTargetCountryPolicy> = ${JSON.stringify(policies, null, 2)};\n`;

writeFileSync(OUTPUT_PATH, output);
console.log(JSON.stringify({ outputPath: OUTPUT_PATH, countryCount: Object.keys(policies).length }, null, 2));
