export const LAOS_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-laos-postal-source-readiness-v0.1';

export type LaosPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type LaosPostalSourceReadinessSource = {
  sourceId: 'laos-postal-service-postcode-page' | 'lao-postal-law-post-code-definition';
  scope: 'postal-operator-postcode-page' | 'postal-law-post-code-definition';
  authorityStatus: 'recorded';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only';
  version: null | 'Law No. 45/NA (2013)';
  retrievedAt: '2026-07-23';
  updateCadence: 'unknown';
  rawRecordsBundled: false;
};

export type LaosPostalSourceReadiness = {
  schemaId: typeof LAOS_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'LA';
  countryName: 'Laos';
  evaluatedAt: string;
  postalFormat: {
    nationalPattern: null;
    authorityVerified: false;
    fixedLegacyPatternRejected: true;
  };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: LaosPostalSourceReadinessSource[];
  gates: LaosPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type LaosPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildLaosPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): LaosPostalSourceReadiness {
  return {
    schemaId: LAOS_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'LA',
    countryName: 'Laos',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: {
      nationalPattern: null,
      authorityVerified: false,
      fixedLegacyPatternRejected: true,
    },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      {
        sourceId: 'laos-postal-service-postcode-page',
        scope: 'postal-operator-postcode-page',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'lao-postal-law-post-code-definition',
        scope: 'postal-law-post-code-definition',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: 'Law No. 45/NA (2013)',
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
    ],
    gates: [
      {
        id: 'no-personal-or-raw-third-party-data',
        label: 'The published pack remains metadata and synthetic fixtures only',
        status: 'passed',
        evidence: [
          'containsPersonalData=false',
          'containsRawThirdPartyData=false',
          'rawRecordsBundled=false for every source',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-operator-postcode-page-recorded',
        label: 'The official Lao postal-service postcode page is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'laos-postal-service-postcode-page',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-law-role-recorded',
        label: 'The postal law records the ministry role in defining post codes',
        status: 'passed',
        evidence: [
          'lao-postal-law-post-code-definition',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-format-authority-evidence',
        label: 'An authority-published national postal-code format is evidenced',
        status: 'blocked',
        evidence: [
          'nationalPattern=null',
          'authorityVerified=false',
          'fixedLegacyPatternRejected=true',
        ],
        blocksRealPostalLookup: true,
      },
      {
        id: 'postal-code-mapping-evidence',
        label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced',
        status: 'blocked',
        evidence: ['postalMappingEvidence=false for every source'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'redistribution-rights',
        label: 'Redistribution rights for any derived postal mapping are verified',
        status: 'blocked',
        evidence: ['redistributionStatus=metadata-only for every source'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The postal mapping has a version, retrieval date, and update cadence',
        status: 'blocked',
        evidence: [
          'laos-postal-service-postcode-page version=null',
          'updateCadence=unknown for every source',
        ],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'An authority-published national postal-code format and format-change policy.',
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage.',
      'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.',
      'Publication date, retrieval date, update cadence, and correction path for the mapping.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert a national Laos postal-code regex.',
      'This pack does not assert an address-to-postcode match or delivery-point coverage.',
    ],
  };
}

export function validateLaosPostalSourceReadiness(
  readiness: LaosPostalSourceReadiness,
): LaosPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== LAOS_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'LA' || readiness.countryName !== 'Laos') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null) errors.push('national-pattern-not-null');
  if (readiness.postalFormat.authorityVerified !== false) errors.push('postal-format-authority-verified');
  if (readiness.postalFormat.fixedLegacyPatternRejected !== true) errors.push('legacy-pattern-not-rejected');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('laos-postal-service-postcode-page')) errors.push('postal-operator-source-missing');
  if (!sourceIds.has('lao-postal-law-post-code-definition')) errors.push('postal-law-source-missing');

  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }

  for (const gateId of [
    'postal-format-authority-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ]) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) {
      errors.push(`required-blocked-gate-missing:${gateId}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
