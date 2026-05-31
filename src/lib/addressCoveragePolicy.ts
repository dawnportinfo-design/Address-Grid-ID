export const ADDRESS_COVERAGE_POLICY_IDS = [
  'postal-reliable-api',
  'postal-weak-api',
  'no-postal-strong-geo',
  'no-postal-weak-geo',
] as const;

export type AddressCoveragePolicyId = typeof ADDRESS_COVERAGE_POLICY_IDS[number];

export type AddressCoveragePolicy = {
  id: AddressCoveragePolicyId;
  label:
    | 'Postal Code Available + Reliable API'
    | 'Postal Code Available + Weak API'
    | 'No Postal Code + Strong Geo OSS'
    | 'No Postal Code + Weak Geo OSS';
  validationMode: 'strong-postal' | 'format-and-candidates' | 'geo-verified' | 'manual-required';
  autofillMode: 'postal-code' | 'candidate-only' | 'geo-fields' | 'manual';
  reason: string;
};

export type AddressCoverageFormatLike = {
  countryCode?: string;
  name?: string;
  postalCode?: {
    regex?: string | null;
    source?: string | null;
    api?: string | null;
    format?: string | null;
  };
  openSourceIds?: string[];
  addressRules?: {
    openSourceIds?: string[];
    postalCode?: {
      label?: string;
      required?: boolean;
      usage?: string;
    } | null;
  };
};

type AddressCoverageSignals = {
  sources?: string[];
  referenceConfidence?: number;
};

export type AddressCoverageSummary = {
  total: number;
  byPolicy: Record<AddressCoveragePolicyId, {
    count: number;
    countryCodes: string[];
  }>;
};

export const ADDRESS_COVERAGE_POLICIES: Record<AddressCoveragePolicyId, AddressCoveragePolicy> = {
  'postal-reliable-api': {
    id: 'postal-reliable-api',
    label: 'Postal Code Available + Reliable API',
    validationMode: 'strong-postal',
    autofillMode: 'postal-code',
    reason: 'Use the postal-code API or reliable machine-readable source for autofill and strong verification.',
  },
  'postal-weak-api': {
    id: 'postal-weak-api',
    label: 'Postal Code Available + Weak API',
    validationMode: 'format-and-candidates',
    autofillMode: 'candidate-only',
    reason: 'Postal source is limited; use format validation and candidates, but keep manual input as the source of truth.',
  },
  'no-postal-strong-geo': {
    id: 'no-postal-strong-geo',
    label: 'No Postal Code + Strong Geo OSS',
    validationMode: 'geo-verified',
    autofillMode: 'geo-fields',
    reason: 'Use AGID, coordinates, administrative hierarchy, and open geographic features for Geo Verified display.',
  },
  'no-postal-weak-geo': {
    id: 'no-postal-weak-geo',
    label: 'No Postal Code + Weak Geo OSS',
    validationMode: 'manual-required',
    autofillMode: 'manual',
    reason: 'Use AGID and coordinates as the primary identifier and require manual confirmation.',
  },
};

const RELIABLE_POSTAL_PATTERNS = [
  /japan-post/i,
  /zipcloud/i,
  /usps/i,
  /u\.s\. census/i,
  /census geocoder/i,
  /libaddressinput/i,
  /openplz/i,
  /postcodes-io/i,
  /data\.gouv/i,
  /la poste/i,
  /viacep/i,
  /brasilapi/i,
  /correos/i,
  /auspost/i,
  /canada-post|canada post/i,
  /official/i,
  /government/i,
  /national-address-api/i,
  /splonline|saudi post/i,
  /one ?map/i,
  /postalservice\.gov/i,
  /postakodu\.ptt/i,
];

const WEAK_POSTAL_PATTERNS = [
  /geonames-postal/i,
  /zippopotam/i,
  /datahub/i,
  /postal-codes-json/i,
  /zauberware/i,
  /spotzi/i,
  /postalcodes\.info/i,
  /regional table/i,
  /local postal operator guidance/i,
  /territory postal format metadata/i,
  /no free postal oss/i,
  /\bnone\b/i,
  /\bnothing\b/i,
];

const NO_POSTAL_PATTERNS =
  /\b(no postal code|no postal codes|no postcode|none|without postal|postal code not used|not used|not separately standardized|n\/a|nothing)\b|なし|無|ない/i;

const STRONG_GEO_PATTERNS = [
  /landsd/i,
  /csdi/i,
  /tgos/i,
  /gsi-japan/i,
  /jageocoder/i,
  /geolonia/i,
  /one-map|onemap/i,
  /namria/i,
  /jupem/i,
  /survey/i,
  /cadastre/i,
  /geoportal/i,
  /geodata/i,
  /government/i,
  /official/i,
  /national/i,
  /openaddresses/i,
  /overture/i,
  /geoboundaries/i,
  /natural-earth/i,
  /osm-[a-z-]+/i,
  /hot-osm/i,
];

const WEAK_GEO_OVERRIDE_PATTERNS = [
  /special\/disputed territory/i,
  /special\/disputed/i,
  /disputed territory/i,
  /bir tawil/i,
  /uninhabited/i,
  /no permanent postal addressing/i,
  /parent postal operator when available/i,
];

const clean = (value: unknown) => String(value ?? '').normalize('NFKC').trim();

function sourceMatches(values: string[], patterns: RegExp[]) {
  return values.some(value => patterns.some(pattern => pattern.test(value)));
}

export function collectAddressCoverageSources(
  format: AddressCoverageFormatLike | null | undefined,
  signals: AddressCoverageSignals = {},
) {
  return Array.from(new Set([
    format?.countryCode,
    format?.name,
    format?.postalCode?.source,
    format?.postalCode?.api,
    format?.postalCode?.format,
    format?.addressRules?.postalCode?.label,
    format?.addressRules?.postalCode?.usage,
    ...(format?.openSourceIds || []),
    ...(format?.addressRules?.openSourceIds || []),
    ...(signals.sources || []),
  ].map(clean).filter(Boolean)));
}

export function hasAddressPostalCodeMetadata(format: AddressCoverageFormatLike | null | undefined) {
  if (!format) return false;
  const postalCode = format.postalCode;
  const rule = format.addressRules?.postalCode;
  if (rule === null) return false;

  const descriptor = [
    postalCode?.source,
    postalCode?.api,
    postalCode?.format,
    rule?.label,
    rule?.usage,
  ].map(clean).join(' ');

  if (descriptor && NO_POSTAL_PATTERNS.test(descriptor)) return false;
  if (postalCode?.regex) return true;
  if (postalCode?.api) return true;
  if (rule?.required) return true;
  if (postalCode?.format && clean(postalCode.format).length > 0) return true;
  return false;
}

function hasReliablePostalSource(format: AddressCoverageFormatLike, sources: string[], signals: AddressCoverageSignals) {
  if ((signals.referenceConfidence || 0) >= 0.85) return true;
  const primaryPostalSources = [
    format.postalCode?.source,
    format.postalCode?.api,
    format.postalCode?.format,
  ].map(clean).filter(Boolean);
  const primaryLooksWeak = sourceMatches(primaryPostalSources, WEAK_POSTAL_PATTERNS);
  return !primaryLooksWeak && sourceMatches([...primaryPostalSources, ...sources], RELIABLE_POSTAL_PATTERNS);
}

function hasStrongGeoSource(format: AddressCoverageFormatLike, sources: string[], signals: AddressCoverageSignals) {
  if ((signals.referenceConfidence || 0) >= 0.75) return true;
  const descriptor = [
    format.countryCode,
    format.name,
    format.postalCode?.source,
  ].map(clean).join(' ');
  if (sourceMatches([descriptor], WEAK_GEO_OVERRIDE_PATTERNS)) return false;
  return sourceMatches(sources, STRONG_GEO_PATTERNS);
}

export function classifyAddressCoveragePolicy(
  format: AddressCoverageFormatLike | null | undefined,
  signals: AddressCoverageSignals = {},
): AddressCoveragePolicy {
  const sources = collectAddressCoverageSources(format, signals);
  const hasPostalCode = hasAddressPostalCodeMetadata(format);

  if (hasPostalCode) {
    return hasReliablePostalSource(format || {}, sources, signals)
      ? ADDRESS_COVERAGE_POLICIES['postal-reliable-api']
      : ADDRESS_COVERAGE_POLICIES['postal-weak-api'];
  }

  return hasStrongGeoSource(format || {}, sources, signals)
    ? ADDRESS_COVERAGE_POLICIES['no-postal-strong-geo']
    : ADDRESS_COVERAGE_POLICIES['no-postal-weak-geo'];
}

export function summarizeAddressCoveragePolicies(formats: AddressCoverageFormatLike[]): AddressCoverageSummary {
  const byPolicy = Object.fromEntries(ADDRESS_COVERAGE_POLICY_IDS.map(id => [
    id,
    { count: 0, countryCodes: [] as string[] },
  ])) as AddressCoverageSummary['byPolicy'];

  for (const format of formats) {
    const policy = classifyAddressCoveragePolicy(format);
    const bucket = byPolicy[policy.id];
    bucket.count += 1;
    if (format.countryCode) bucket.countryCodes.push(format.countryCode);
  }

  for (const bucket of Object.values(byPolicy)) {
    bucket.countryCodes = Array.from(new Set(bucket.countryCodes)).sort();
  }

  return {
    total: formats.length,
    byPolicy,
  };
}
