import {
  buildPostalZoneDesignerWorkspace,
  listPostalZoneDesignerCountries,
} from './postalZoneDesigner';
import {
  getOfficialPostalSourcesForCountry,
} from './officialPostalSourceCatalog';
import {
  buildGuatemalaPostalSourceReadiness,
  validateGuatemalaPostalSourceReadiness,
} from './guatemalaPostalSourceReadiness';

export const POSTAL_COUNTRY_BUILD_QUEUE_SCHEMA_ID = 'agid-postal-country-build-queue-v0.1';

export type PostalCountryBuildQueueItem = {
  position: number;
  countryCode: string;
  countryName: string;
  postalPattern: string | null;
  phase:
    | 'source-readiness-gated'
    | 'country-specific-source-discovery-required'
    | 'country-specific-source-review-required';
  sourceProfile: {
    countrySpecificPostalSourceCount: number;
    globalLicensedFallbackAvailable: boolean;
  };
  publicationBoundary: {
    containsPersonalData: false;
    containsRawThirdPartyData: false;
    realPostalLookupEnabled: false;
    deliveryClaimEnabled: false;
  };
  nextSmallestImprovement: string;
};

export type PostalCountryBuildQueue = {
  schemaId: typeof POSTAL_COUNTRY_BUILD_QUEUE_SCHEMA_ID;
  generatedAt: string;
  selectionRule: string[];
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  items: PostalCountryBuildQueueItem[];
};

export type PostalCountryBuildQueueValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_GENERATED_AT = '2026-07-23T02:52:01.274Z';

function formatReuseRank(pattern: string | null) {
  if (pattern === '^\\d{5}$') return 0;
  if (pattern) return 1;
  return 2;
}

function compareQueueItems(
  left: { code: string; pattern: string | null },
  right: { code: string; pattern: string | null },
) {
  if (left.code === 'GT') return -1;
  if (right.code === 'GT') return 1;
  const formatRank = formatReuseRank(left.pattern) - formatReuseRank(right.pattern);
  if (formatRank) return formatRank;
  return left.code.localeCompare(right.code);
}

export function buildPostalCountryBuildQueue(input: {
  generatedAt?: string;
} = {}): PostalCountryBuildQueue {
  const items = listPostalZoneDesignerCountries('B')
    .map(country => {
      const workspace = buildPostalZoneDesignerWorkspace({
        countryCode: country.code,
        now: input.generatedAt || DEFAULT_GENERATED_AT,
      });
      return {
        code: country.code,
        name: country.name,
        pattern: workspace.profile.existingPostalPattern || workspace.profile.addressFormat.postalCode.regex || null,
      };
    })
    .sort(compareQueueItems)
    .map((country, index): PostalCountryBuildQueueItem => {
      const sources = getOfficialPostalSourcesForCountry(country.code);
      const countrySpecificPostalSourceCount = sources.filter(source => !source.countryCodes.includes('*')).length;
      const isGuatemala = country.code === 'GT';
      return {
        position: index + 1,
        countryCode: country.code,
        countryName: country.name,
        postalPattern: country.pattern,
        phase: isGuatemala
          ? 'source-readiness-gated'
          : countrySpecificPostalSourceCount > 0
            ? 'country-specific-source-review-required'
            : 'country-specific-source-discovery-required',
        sourceProfile: {
          countrySpecificPostalSourceCount,
          globalLicensedFallbackAvailable: sources.some(source => source.id === 'upu-universal-postcode-database'),
        },
        publicationBoundary: {
          containsPersonalData: false,
          containsRawThirdPartyData: false,
          realPostalLookupEnabled: false,
          deliveryClaimEnabled: false,
        },
        nextSmallestImprovement: isGuatemala
          ? 'Record a Guatemala postal authority or designated publisher with scope, rights, version, and correction path.'
          : countrySpecificPostalSourceCount > 0
            ? 'Review country-specific source scope, license, version, and redistribution before any derived publication.'
            : 'Create a metadata-only country source catalog and preserve the real postal lookup block.',
      };
    });

  return {
    schemaId: POSTAL_COUNTRY_BUILD_QUEUE_SCHEMA_ID,
    generatedAt: input.generatedAt || DEFAULT_GENERATED_AT,
    selectionRule: [
      'Guatemala is first by explicit implementation decision.',
      'Remaining Class B countries are ordered by reusable five-digit format checks, other recorded formats, unverified formats, then ISO country code.',
      'Recorded format checks do not imply shared postal geography, authority, or deliverability.',
      'Every queue item remains metadata-only until its country-specific release gates pass.',
    ],
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    items,
  };
}

export function validatePostalCountryBuildQueue(queue: PostalCountryBuildQueue): PostalCountryBuildQueueValidation {
  const errors: string[] = [];
  const countries = new Map(listPostalZoneDesignerCountries('B').map(country => [country.code, country]));
  const codes = new Set<string>();

  if (queue.schemaId !== POSTAL_COUNTRY_BUILD_QUEUE_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (queue.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (queue.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (queue.items[0]?.countryCode !== 'GT') errors.push('guatemala-not-first');

  for (const [index, item] of queue.items.entries()) {
    if (codes.has(item.countryCode)) errors.push(`duplicate-country:${item.countryCode}`);
    codes.add(item.countryCode);
    if (item.position !== index + 1) errors.push(`position-mismatch:${item.countryCode}`);
    if (!countries.has(item.countryCode)) errors.push(`not-class-b-country:${item.countryCode}`);
    if (
      item.postalPattern === null &&
      item.sourceProfile.countrySpecificPostalSourceCount === 0 &&
      item.phase !== 'country-specific-source-discovery-required'
    ) {
      errors.push(`unverified-postal-pattern-phase-mismatch:${item.countryCode}`);
    }
    if (item.sourceProfile.globalLicensedFallbackAvailable !== true) errors.push(`global-fallback-missing:${item.countryCode}`);
    if (item.countryCode !== 'GT' && item.sourceProfile.countrySpecificPostalSourceCount > 0 && item.phase !== 'country-specific-source-review-required') {
      errors.push(`country-specific-source-review-phase-missing:${item.countryCode}`);
    }
    if (item.countryCode !== 'GT' && item.sourceProfile.countrySpecificPostalSourceCount === 0 && item.phase !== 'country-specific-source-discovery-required') {
      errors.push(`country-specific-source-discovery-phase-missing:${item.countryCode}`);
    }
    if (item.publicationBoundary.containsPersonalData !== false) errors.push(`personal-data-boundary:${item.countryCode}`);
    if (item.publicationBoundary.containsRawThirdPartyData !== false) errors.push(`raw-third-party-boundary:${item.countryCode}`);
    if (item.publicationBoundary.realPostalLookupEnabled !== false) errors.push(`lookup-enabled:${item.countryCode}`);
    if (item.publicationBoundary.deliveryClaimEnabled !== false) errors.push(`delivery-claim-enabled:${item.countryCode}`);
  }

  const guatemala = queue.items.find(item => item.countryCode === 'GT');
  if (guatemala?.phase !== 'source-readiness-gated') errors.push('guatemala-readiness-phase-missing');
  if (!guatemala || guatemala.postalPattern !== '^\\d{5}$') errors.push('guatemala-five-digit-format-missing');
  if (!validateGuatemalaPostalSourceReadiness(buildGuatemalaPostalSourceReadiness()).valid) {
    errors.push('guatemala-source-readiness-invalid');
  }

  return { valid: errors.length === 0, errors };
}
