export const POSTAL_CODE_API_VERSION = 'agid-postal-code-api-v1';

export type PostalCodeApiCohort =
  | 'mature-system'
  | 'restricted-source'
  | 'neutrality-gated';

export type PostalCodeApiPublicationStatus =
  | 'format-only'
  | 'metadata-only'
  | 'withheld';

export type PostalCodeApiValidationStatus =
  | 'valid-format'
  | 'invalid-format'
  | 'metadata-only'
  | 'guarded'
  | 'unsupported';

export type PostalCodeApiValidationLevel =
  | 'syntax-only'
  | 'not-performed';

export type PostalCodeApiProfile = {
  jurisdictionId: string;
  cohort: PostalCodeApiCohort;
  publicationStatus: PostalCodeApiPublicationStatus;
  formatLookupCode?: string;
  parentAuthorityReviewRequired: boolean;
  sourceReviewRequired: boolean;
  neutralityReviewRequired: boolean;
};

export type PostalCodeApiValidationResult = {
  modelVersion: string;
  jurisdictionId: string;
  cohort: PostalCodeApiCohort | 'unknown';
  publicationStatus: PostalCodeApiPublicationStatus | 'withheld';
  status: PostalCodeApiValidationStatus;
  validationLevel: PostalCodeApiValidationLevel;
  formatMatched: boolean | null;
  lookupPerformed: false;
  deliveryConfirmed: false;
  storesPostalCode: false;
  warnings: string[];
};

export type PostalCodeApiSyntheticTestVector = {
  id: string;
  jurisdictionId: string;
  postalCode: string;
  expectedStatus: PostalCodeApiValidationStatus;
  expectedFormatMatched: boolean | null;
  containsAddressData: false;
};

const MATURE_SYSTEMS: PostalCodeApiProfile[] = [
  'PT', 'GR', 'DE', 'FI', 'LT', 'LV', 'IS', 'CY', 'GI', 'AX', 'IM', 'JE', 'FK', 'AD', 'MC', 'SM', 'VA',
].map(jurisdictionId => ({
  jurisdictionId,
  cohort: 'mature-system' as const,
  publicationStatus: 'format-only' as const,
  formatLookupCode: jurisdictionId,
  parentAuthorityReviewRequired: false,
  sourceReviewRequired: true,
  neutralityReviewRequired: false,
}));

const PARENT_AUTHORITY_REVIEW: PostalCodeApiProfile[] = ['CL-EA', 'CL-JF'].map(jurisdictionId => ({
  jurisdictionId,
  cohort: 'mature-system' as const,
  publicationStatus: 'metadata-only' as const,
  parentAuthorityReviewRequired: true,
  sourceReviewRequired: true,
  neutralityReviewRequired: false,
}));

const RESTRICTED_SOURCE_SYSTEMS: PostalCodeApiProfile[] = ['CN', 'IQ', 'IR', 'RU', 'UA', 'BY'].map(jurisdictionId => ({
  jurisdictionId,
  cohort: 'restricted-source' as const,
  publicationStatus: 'format-only' as const,
  formatLookupCode: jurisdictionId,
  parentAuthorityReviewRequired: false,
  sourceReviewRequired: true,
  neutralityReviewRequired: false,
}));

const NEUTRALITY_GATED_JURISDICTIONS: PostalCodeApiProfile[] = [
  'EH', 'SLND', 'CRIM', 'DONB', 'PMR', 'TRNC', 'XD', 'XU', 'XK',
].map(jurisdictionId => ({
  jurisdictionId,
  cohort: 'neutrality-gated' as const,
  publicationStatus: 'withheld' as const,
  parentAuthorityReviewRequired: true,
  sourceReviewRequired: true,
  neutralityReviewRequired: true,
}));

export const POSTAL_CODE_API_PROFILES: readonly PostalCodeApiProfile[] = [
  ...MATURE_SYSTEMS,
  ...PARENT_AUTHORITY_REVIEW,
  ...RESTRICTED_SOURCE_SYSTEMS,
  ...NEUTRALITY_GATED_JURISDICTIONS,
];

export const POSTAL_CODE_API_SYNTHETIC_TEST_VECTORS: readonly PostalCodeApiSyntheticTestVector[] = [
  {
    id: 'postal-api-pt-format-only',
    jurisdictionId: 'PT',
    postalCode: '0000-000',
    expectedStatus: 'valid-format',
    expectedFormatMatched: true,
    containsAddressData: false,
  },
  {
    id: 'postal-api-cn-restricted-source',
    jurisdictionId: 'CN',
    postalCode: '000000',
    expectedStatus: 'valid-format',
    expectedFormatMatched: true,
    containsAddressData: false,
  },
  {
    id: 'postal-api-cl-ea-parent-review',
    jurisdictionId: 'CL-EA',
    postalCode: '0000000',
    expectedStatus: 'metadata-only',
    expectedFormatMatched: null,
    containsAddressData: false,
  },
  {
    id: 'postal-api-eh-neutrality-gate',
    jurisdictionId: 'EH',
    postalCode: '00000',
    expectedStatus: 'guarded',
    expectedFormatMatched: null,
    containsAddressData: false,
  },
];

function normalizeJurisdictionId(value: unknown) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toUpperCase()
    .replace(/_/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
}

function normalizePostalCode(value: unknown) {
  return typeof value === 'string'
    ? value.normalize('NFKC').trim().toUpperCase().replace(/\s+/g, ' ')
    : '';
}

function resultFor(
  profile: PostalCodeApiProfile | undefined,
  jurisdictionId: string,
  status: PostalCodeApiValidationStatus,
  formatMatched: boolean | null,
  warnings: string[],
): PostalCodeApiValidationResult {
  return {
    modelVersion: POSTAL_CODE_API_VERSION,
    jurisdictionId,
    cohort: profile?.cohort ?? 'unknown',
    publicationStatus: profile?.publicationStatus ?? 'withheld',
    status,
    validationLevel: formatMatched === null ? 'not-performed' : 'syntax-only',
    formatMatched,
    lookupPerformed: false,
    deliveryConfirmed: false,
    storesPostalCode: false,
    warnings,
  };
}

export function getPostalCodeApiProfile(jurisdictionId: unknown) {
  const normalized = normalizeJurisdictionId(jurisdictionId);
  return POSTAL_CODE_API_PROFILES.find(profile => profile.jurisdictionId === normalized);
}

export function listPostalCodeApiProfiles() {
  return POSTAL_CODE_API_PROFILES.map(profile => ({ ...profile }));
}

export function getPostalCodeApiCapabilities() {
  const cohorts = (['mature-system', 'restricted-source', 'neutrality-gated'] as const).map(cohort => ({
    cohort,
    jurisdictionIds: POSTAL_CODE_API_PROFILES
      .filter(profile => profile.cohort === cohort)
      .map(profile => profile.jurisdictionId),
  }));

  return {
    modelVersion: POSTAL_CODE_API_VERSION,
    accepts: ['postal-code-format-validation-v1'],
    endpoints: {
      capabilities: '/api/v1/postal-codes/capabilities',
      validate: '/api/v1/postal-codes/validate',
    },
    inputBoundary: {
      acceptedFields: ['jurisdictionId', 'postalCode'],
      rawAddressAccepted: false,
      recipientAccepted: false,
      externalLookupEnabled: false,
    },
    outputBoundary: {
      echoesPostalCode: false,
      officialDataReplicated: false,
      deliveryConfirmation: false,
      sourceRecordStorage: false,
    },
    cohorts,
    syntheticTestVectors: {
      count: POSTAL_CODE_API_SYNTHETIC_TEST_VECTORS.length,
      containsAddressData: false,
    },
    nonClaims: [
      'A format match does not establish postal-code existence, locality membership, service coverage, or deliverability.',
      'The API does not reproduce official postal datasets or call external postal services.',
      'Restricted-source jurisdictions expose format-only results and remain subject to source and update review.',
      'Neutrality-gated jurisdictions are withheld until neutral boundary, non-recognition, source-scope, and publication gates pass.',
    ],
  };
}

export function validatePostalCodeApiFormat(input: {
  jurisdictionId: unknown;
  postalCode: unknown;
  formatRegex?: string | null;
}): PostalCodeApiValidationResult {
  const jurisdictionId = normalizeJurisdictionId(input.jurisdictionId);
  const postalCode = normalizePostalCode(input.postalCode);
  const profile = getPostalCodeApiProfile(jurisdictionId);

  if (!profile) {
    return resultFor(undefined, jurisdictionId || 'UNKNOWN', 'unsupported', null, [
      'unsupported-postal-jurisdiction',
      'No source lookup was attempted.',
    ]);
  }

  if (profile.publicationStatus === 'withheld') {
    return resultFor(profile, jurisdictionId, 'guarded', null, [
      'neutrality-and-source-review-required',
      'No format, locality, boundary, source, or delivery assertion is released for this jurisdiction.',
    ]);
  }

  if (profile.publicationStatus === 'metadata-only' || !profile.formatLookupCode) {
    return resultFor(profile, jurisdictionId, 'metadata-only', null, [
      'parent-authority-and-publication-review-required',
      'No parent jurisdiction postal format has been inherited.',
    ]);
  }

  if (!postalCode || postalCode.length > 16) {
    return resultFor(profile, jurisdictionId, 'invalid-format', false, [
      'postal-code-must-be-a-non-empty-value-of-at-most-16-characters',
      'Only a format check was attempted.',
    ]);
  }

  let expression: RegExp | null = null;
  try {
    expression = input.formatRegex ? new RegExp(input.formatRegex, 'u') : null;
  } catch {
    return resultFor(profile, jurisdictionId, 'metadata-only', null, [
      'local-format-metadata-is-invalid-or-unavailable',
      'No external fallback was attempted.',
    ]);
  }

  if (!expression) {
    return resultFor(profile, jurisdictionId, 'metadata-only', null, [
      'local-format-metadata-is-unavailable',
      'No external fallback was attempted.',
    ]);
  }

  // Full-string matching prevents a permissive local pattern from validating a substring.
  const match = postalCode.match(expression);
  const formatMatched = Boolean(match && match[0] === postalCode);
  const cohortWarning = profile.cohort === 'restricted-source'
    ? 'restricted-source-jurisdiction-format-only'
    : 'mature-system-format-only';

  return resultFor(profile, jurisdictionId, formatMatched ? 'valid-format' : 'invalid-format', formatMatched, [
    cohortWarning,
    'Syntax-only result; no postal dataset, locality match, or delivery service was queried.',
  ]);
}
