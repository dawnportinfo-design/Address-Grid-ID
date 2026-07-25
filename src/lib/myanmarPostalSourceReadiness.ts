export const MYANMAR_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-myanmar-postal-source-readiness-v0.1';

export type MyanmarPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type MyanmarPostalSourceReadinessSource = {
  sourceId: 'myanmar-post-postcode-search' | 'motc-myanmar-post-government-site-list';
  scope: 'postal-operator-postcode-search' | 'government-operator-website-listing';
  authorityStatus: 'recorded';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only';
  version: null;
  retrievedAt: '2026-07-23';
  updateCadence: 'unknown';
  rawRecordsBundled: false;
};

export type MyanmarPostalSourceReadiness = {
  schemaId: typeof MYANMAR_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'MM';
  countryName: 'Myanmar';
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
  sources: MyanmarPostalSourceReadinessSource[];
  gates: MyanmarPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type MyanmarPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildMyanmarPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): MyanmarPostalSourceReadiness {
  return {
    schemaId: MYANMAR_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'MM',
    countryName: 'Myanmar',
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
        sourceId: 'myanmar-post-postcode-search',
        scope: 'postal-operator-postcode-search',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'motc-myanmar-post-government-site-list',
        scope: 'government-operator-website-listing',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
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
        id: 'postal-operator-search-recorded',
        label: 'The official Myanmar Post postcode-search screen is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'myanmar-post-postcode-search',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'government-operator-relationship-recorded',
        label: 'The ministry government-site list records Myanmar Post as an official organization',
        status: 'passed',
        evidence: [
          'motc-myanmar-post-government-site-list',
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
        evidence: ['version=null for every source', 'updateCadence=unknown for every source'],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'An authority-published national postal-code format and format-change policy.',
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage.',
      'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.',
      'Publication date, retrieval date, update cadence, conflict-sensitive coverage limits, and correction path for the mapping.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert a national Myanmar postal-code regex.',
      'This pack does not assert an address-to-postcode match, operational coverage, or delivery-point coverage.',
    ],
  };
}

export function validateMyanmarPostalSourceReadiness(
  readiness: MyanmarPostalSourceReadiness,
): MyanmarPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== MYANMAR_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'MM' || readiness.countryName !== 'Myanmar') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null) errors.push('national-pattern-not-null');
  if (readiness.postalFormat.authorityVerified !== false) errors.push('postal-format-authority-verified');
  if (readiness.postalFormat.fixedLegacyPatternRejected !== true) errors.push('legacy-pattern-not-rejected');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('myanmar-post-postcode-search')) errors.push('postal-operator-source-missing');
  if (!sourceIds.has('motc-myanmar-post-government-site-list')) errors.push('government-operator-source-missing');

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
