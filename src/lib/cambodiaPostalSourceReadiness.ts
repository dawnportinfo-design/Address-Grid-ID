export const CAMBODIA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-cambodia-postal-source-readiness-v0.1';

export type CambodiaPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type CambodiaPostalSourceReadinessSource = {
  sourceId: 'cambodia-post-location' | 'mptc-cambodia-post-autonomous-unit';
  scope: 'postal-operator-location-page' | 'government-operator-relationship';
  authorityStatus: 'recorded';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only';
  version: null;
  retrievedAt: '2026-07-23';
  updateCadence: 'unknown';
  rawRecordsBundled: false;
};

export type CambodiaPostalSourceReadiness = {
  schemaId: typeof CAMBODIA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'KH';
  countryName: 'Cambodia';
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
  sources: CambodiaPostalSourceReadinessSource[];
  gates: CambodiaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type CambodiaPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildCambodiaPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): CambodiaPostalSourceReadiness {
  return {
    schemaId: CAMBODIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'KH',
    countryName: 'Cambodia',
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
        sourceId: 'cambodia-post-location',
        scope: 'postal-operator-location-page',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'mptc-cambodia-post-autonomous-unit',
        scope: 'government-operator-relationship',
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
        id: 'postal-operator-recorded',
        label: 'Cambodia Post is cataloged from its official location page as metadata only',
        status: 'passed',
        evidence: [
          'cambodia-post-location',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'government-operator-relationship-recorded',
        label: 'The ministry page records Cambodia Post as an autonomous unit',
        status: 'passed',
        evidence: [
          'mptc-cambodia-post-autonomous-unit',
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
      'Publication date, retrieval date, update cadence, and correction path for the mapping.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert a national Cambodia postal-code regex.',
      'This pack does not assert an address-to-postcode match or delivery-point coverage.',
    ],
  };
}

export function validateCambodiaPostalSourceReadiness(
  readiness: CambodiaPostalSourceReadiness,
): CambodiaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== CAMBODIA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'KH' || readiness.countryName !== 'Cambodia') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null) errors.push('national-pattern-not-null');
  if (readiness.postalFormat.authorityVerified !== false) errors.push('postal-format-authority-verified');
  if (readiness.postalFormat.fixedLegacyPatternRejected !== true) errors.push('legacy-pattern-not-rejected');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('cambodia-post-location')) errors.push('postal-operator-source-missing');
  if (!sourceIds.has('mptc-cambodia-post-autonomous-unit')) errors.push('government-operator-source-missing');

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
