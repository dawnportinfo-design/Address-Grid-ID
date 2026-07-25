export const NEPAL_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-nepal-postal-source-readiness-v0.1';

export type NepalPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type NepalPostalSourceReadinessSource = {
  sourceId:
    | 'nepal-post-national-postal-codes'
    | 'pokhara-postal-directorate-postal-code-2025'
    | 'parbat-district-post-new-postal-code-notice';
  scope:
    | 'national-postal-code-publication'
    | 'regional-postal-code-publication'
    | 'postal-code-change-notice';
  authorityStatus: 'recorded';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only';
  version: null;
  retrievedAt: '2026-07-23';
  updateCadence: 'unknown';
  rawRecordsBundled: false;
};

export type NepalPostalSourceReadiness = {
  schemaId: typeof NEPAL_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'NP';
  countryName: 'Nepal';
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
  sources: NepalPostalSourceReadinessSource[];
  gates: NepalPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type NepalPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildNepalPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): NepalPostalSourceReadiness {
  return {
    schemaId: NEPAL_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'NP',
    countryName: 'Nepal',
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
        sourceId: 'nepal-post-national-postal-codes',
        scope: 'national-postal-code-publication',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'pokhara-postal-directorate-postal-code-2025',
        scope: 'regional-postal-code-publication',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'parbat-district-post-new-postal-code-notice',
        scope: 'postal-code-change-notice',
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
        id: 'national-postal-code-publication-recorded',
        label: 'The Department of Postal Service national postal-codes publication is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'nepal-post-national-postal-codes',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-code-update-and-change-surfaces-recorded',
        label: 'Official regional and change-notice postal-code publication surfaces are cataloged as metadata only',
        status: 'passed',
        evidence: [
          'pokhara-postal-directorate-postal-code-2025',
          'parbat-district-post-new-postal-code-notice',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-format-authority-evidence',
        label: 'An authority-published national postal-code format specification is evidenced',
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
        label: 'Redistribution rights for any postal-code mapping or linked publication are verified',
        status: 'blocked',
        evidence: ['redistributionStatus=metadata-only for every source'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The usable postal mapping has a version, retrieval date, update cadence, and correction path',
        status: 'blocked',
        evidence: ['version=null for every source', 'updateCadence=unknown for every source'],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'An authority-published national postal-code format specification, scope statement, and format-change policy.',
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage and documented corrections.',
      'Field-level reuse, attribution, and redistribution terms for any mapping, linked publication, or derived output.',
      'Publication date, retrieval date, update cadence, conflict-sensitive coverage limits, and correction path for the mapping and change notices.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert a national Nepal postal-code regex.',
      'This pack does not assert an address-to-postcode match, operational coverage, or delivery-point coverage.',
    ],
  };
}

export function validateNepalPostalSourceReadiness(
  readiness: NepalPostalSourceReadiness,
): NepalPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== NEPAL_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'NP' || readiness.countryName !== 'Nepal') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null) errors.push('national-pattern-not-null');
  if (readiness.postalFormat.authorityVerified !== false) errors.push('postal-format-authority-verified');
  if (readiness.postalFormat.fixedLegacyPatternRejected !== true) errors.push('legacy-pattern-not-rejected');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('nepal-post-national-postal-codes')) errors.push('national-publication-source-missing');
  if (!sourceIds.has('pokhara-postal-directorate-postal-code-2025')) errors.push('regional-publication-source-missing');
  if (!sourceIds.has('parbat-district-post-new-postal-code-notice')) errors.push('change-notice-source-missing');

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
