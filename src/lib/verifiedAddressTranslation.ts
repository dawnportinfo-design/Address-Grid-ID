import { getAddressFormat,type AddressFormat } from '../data/address_formats';
import { AddressRenderer,createCanonicalAddress,type CanonicalAddress } from './addressRendering';
import { analyzeAddress,type CanonicalAddressParts } from './addressIntelligence';
import { validateAddressWithOpenSourceRules,type AddressValidationResult } from './addressValidation';
import { countryName } from './addressEnglish';
import { INTERNATIONAL_SHIPPING_ENGLISH_TAB,isEnglishAddressCountry } from './languageTabs';

export type VerifiedAddressTranslationFormat = AddressFormat;

export type VerifiedAddressTranslationStageId = 'parse' | 'normalize' | 'verify' | 'render';

export type VerifiedAddressTranslationStage = {
  id: VerifiedAddressTranslationStageId;
  label: string;
  status: 'ok' | 'partial';
  sources: string[];
};

export type VerifiedAddressTranslationGraph = {
  country: {
    code: string;
    name: string;
  };
  postal: {
    code: string;
    valid: boolean | null;
  };
  admin: {
    level1: string;
    level2: string;
    level3: string;
  };
  locality: {
    primary: string;
    secondary: string;
  };
  deliveryObject: {
    building: string;
    poi: string;
    street: string;
    houseNumber: string;
  };
  geo: {
    lat: number | null;
    lon: number | null;
    plusCode: string;
    hasCoordinateOrCode: boolean;
    fieldCount: number;
  };
};

export type VerifiedAddressTranslationInput = {
  countryCode?: string;
  language?: string;
  details?: Record<string, unknown> | null;
  text?: string;
  format?: VerifiedAddressTranslationFormat | null;
  sources?: string[];
  referenceMatches?: Array<{
    source: string;
    confidence: number;
  }>;
};

export type VerifiedAddressTranslationSyncInput = Omit<VerifiedAddressTranslationInput, 'format'> & {
  format?: VerifiedAddressTranslationFormat | null;
};

export type VerifiedAddressTranslationResult = {
  canonical: CanonicalAddress;
  graph: VerifiedAddressTranslationGraph;
  validation: AddressValidationResult;
  renderings: {
    native: string;
    domesticEnglish?: string;
    internationalEnglish: string;
    shippingLabel: string;
  };
  orders: {
    native: string[];
    internationalEnglish: string[];
  };
  confidence: number;
  sources: string[];
  warnings: string[];
  pipeline: VerifiedAddressTranslationStage[];
};

function clean(value: unknown) {
  return String(value ?? '').normalize('NFKC').replace(/[\u3000\s]+/g, ' ').trim();
}

function cleanCode(value: unknown) {
  return clean(value).replace(/^country:/i, '').toUpperCase();
}

function numberOrNull(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstValue(...values: unknown[]) {
  for (const value of values) {
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function nestedCoordinate(details: Record<string, unknown>, key: 'lat' | 'lon' | 'lng') {
  const coordinates = details.coordinates;
  if (!coordinates || typeof coordinates !== 'object') return undefined;
  return (coordinates as Record<string, unknown>)[key];
}

function readLatitude(details: Record<string, unknown>) {
  return numberOrNull(
    details.lat ??
    details.latitude ??
    nestedCoordinate(details, 'lat')
  );
}

function readLongitude(details: Record<string, unknown>) {
  return numberOrNull(
    details.lon ??
    details.lng ??
    details.longitude ??
    nestedCoordinate(details, 'lon') ??
    nestedCoordinate(details, 'lng')
  );
}

function mergeDetailsWithAnalysis(
  details: Record<string, unknown>,
  parsed: CanonicalAddressParts,
  countryCode: string,
) {
  return {
    ...details,
    ...Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => clean(value)),
    ),
    country_code: countryCode || parsed.country_code || details.country_code,
  };
}

function defaultNativeLanguage(format: VerifiedAddressTranslationFormat | null | undefined, fallback?: string) {
  const preferred = clean(fallback);
  if (preferred) return preferred;
  return format?.addressRules?.languages?.[0]?.code || 'local';
}

function renderNativeAddress(
  language: string,
  canonical: CanonicalAddress,
  validation: AddressValidationResult,
) {
  if (validation.displays.native) return validation.displays.native;
  const rendered = AddressRenderer.render(language, canonical);
  return rendered || AddressRenderer.renderPartialAddress(language, canonical);
}

function buildSources(
  inputSources: string[],
  format: VerifiedAddressTranslationFormat | null,
  validation: AddressValidationResult,
) {
  return Array.from(new Set([
    ...inputSources,
    ...(format?.openSourceIds || []),
    ...(format?.addressRules?.openSourceIds || []),
    ...validation.checkedWith,
  ].map(clean).filter(Boolean)));
}

function buildGraph(canonical: CanonicalAddress, validation: AddressValidationResult): VerifiedAddressTranslationGraph {
  const lat = numberOrNull((canonical as unknown as Record<string, unknown>).lat);
  const lon = numberOrNull((canonical as unknown as Record<string, unknown>).lon);
  const plusCode = clean(canonical.plus_code);
  const geoFieldCount = [
    canonical.state,
    canonical.city,
    canonical.district,
    canonical.subdistrict,
    canonical.suburb,
    canonical.road,
    canonical.building,
    canonical.poi,
    plusCode,
  ].filter(value => clean(value)).length;
  const code = cleanCode(canonical.country_code);

  return {
    country: {
      code,
      name: firstValue(canonical.country, countryName(code, code)),
    },
    postal: {
      code: clean(canonical.postcode),
      valid: validation.postalCodeValid,
    },
    admin: {
      level1: clean(canonical.state),
      level2: clean(canonical.city || canonical.district),
      level3: clean(canonical.district && canonical.city ? canonical.district : canonical.subdistrict),
    },
    locality: {
      primary: clean(canonical.subdistrict || canonical.suburb || canonical.road),
      secondary: clean(canonical.road && (canonical.subdistrict || canonical.suburb) ? canonical.road : ''),
    },
    deliveryObject: {
      building: clean(canonical.building),
      poi: clean(canonical.poi),
      street: clean(canonical.road),
      houseNumber: clean(canonical.house_number),
    },
    geo: {
      lat,
      lon,
      plusCode,
      hasCoordinateOrCode: Boolean((lat !== null && lon !== null) || plusCode),
      fieldCount: geoFieldCount,
    },
  };
}

function stage(
  id: VerifiedAddressTranslationStageId,
  label: string,
  status: VerifiedAddressTranslationStage['status'],
  sources: string[],
): VerifiedAddressTranslationStage {
  return { id, label, status, sources: Array.from(new Set(sources.filter(Boolean))) };
}

function buildPipeline({
  analysisSources,
  validation,
  renderSources,
}: {
  analysisSources: string[];
  validation: AddressValidationResult;
  renderSources: string[];
}) {
  return [
    stage('parse', 'Address text and API fields were parsed into address components.', 'ok', analysisSources),
    stage('normalize', 'Components were normalized into one canonical address graph.', 'ok', ['canonical-address-graph']),
    stage('verify', 'Postal, open-source, and geography evidence were evaluated.', validation.status === 'verified' ? 'ok' : 'partial', validation.checkedWith),
    stage('render', 'Country-specific native and international English displays were regenerated.', 'ok', renderSources),
  ];
}

export function executeVerifiedAddressTranslationSync(
  input: VerifiedAddressTranslationSyncInput,
): VerifiedAddressTranslationResult {
  const details = input.details && typeof input.details === 'object' ? input.details : {};
  const displayName = firstValue(input.text, details.display_name, details.name, details.formatted);
  const analysis = analyzeAddress({
    apiAddress: details,
    displayName,
    sources: input.sources || [],
  });
  const code = cleanCode(input.countryCode || details.country_code || analysis.canonical.country_code);
  const format = input.format ?? null;
  const mergedDetails = mergeDetailsWithAnalysis(details, analysis.canonical, code);
  const canonical = createCanonicalAddress(mergedDetails);
  const canonicalWithGeo = canonical as CanonicalAddress & { lat?: number; lon?: number };
  const lat = readLatitude(details);
  const lon = readLongitude(details);

  if (code && !canonical.country_code) canonical.country_code = code;
  canonical.country_code = cleanCode(canonical.country_code || code);
  if (lat !== null) canonicalWithGeo.lat = lat;
  if (lon !== null) canonicalWithGeo.lon = lon;
  if (!canonical.country && canonical.country_code) {
    canonical.country = countryName(canonical.country_code, canonical.country_code);
  }

  const validation = validateAddressWithOpenSourceRules(
    canonical,
    format,
    input.sources || [],
    { referenceMatches: input.referenceMatches || [] },
  );
  const nativeLanguage = defaultNativeLanguage(format, input.language);
  const native = renderNativeAddress(nativeLanguage, canonical, validation);
  const domesticEnglish = isEnglishAddressCountry(canonical.country_code)
    ? AddressRenderer.render('en_domestic', canonical)
    : undefined;
  const internationalEnglish = AddressRenderer.render(INTERNATIONAL_SHIPPING_ENGLISH_TAB, canonical)
    || validation.displays.english
    || AddressRenderer.renderPartialAddress(INTERNATIONAL_SHIPPING_ENGLISH_TAB, canonical);
  const shippingLabel = AddressRenderer.renderInternationalShippingEnglish(canonical);
  const sources = buildSources(input.sources || [], format, validation);
  const graph = buildGraph(canonical, validation);
  const confidence = Math.max(
    validation.score,
    analysis.confidence,
    Math.min(0.99, graph.geo.hasCoordinateOrCode ? validation.score + 0.05 : validation.score),
  );

  return {
    canonical,
    graph,
    validation,
    renderings: {
      native,
      domesticEnglish,
      internationalEnglish,
      shippingLabel,
    },
    orders: {
      native: format?.addressRules?.nativeOrder || [],
      internationalEnglish: format?.addressRules?.englishOrder || [],
    },
    confidence: Math.round(confidence * 100) / 100,
    sources,
    warnings: validation.warnings,
    pipeline: buildPipeline({
      analysisSources: analysis.sources,
      validation,
      renderSources: ['country-address-rules', 'address-renderer', 'international-shipping-english'],
    }),
  };
}

export async function executeVerifiedAddressTranslation(
  input: VerifiedAddressTranslationInput,
): Promise<VerifiedAddressTranslationResult> {
  const details = input.details && typeof input.details === 'object' ? input.details : {};
  const analysis = analyzeAddress({
    apiAddress: details,
    displayName: firstValue(input.text, details.display_name, details.name, details.formatted),
    sources: input.sources || [],
  });
  const code = cleanCode(input.countryCode || details.country_code || analysis.canonical.country_code);
  const format = input.format !== undefined
    ? input.format
    : (code ? await getAddressFormat(code) : null);

  return executeVerifiedAddressTranslationSync({
    ...input,
    format,
  });
}
