export const TANZANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-tanzania-postal-source-readiness-v0.1';

export type TanzaniaPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type TanzaniaPostalSourceReadinessSource = {
  sourceId: 'tcra-tanzania-postcode' | 'tcra-tanzania-postcode-list-publication';
  scope: 'national-postcode-policy-and-service' | 'postcode-list-publication-notice';
  authorityStatus: 'recorded';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only';
  version: null;
  retrievedAt: '2026-07-23';
  updateCadence: 'unknown';
  rawRecordsBundled: false;
};

export type TanzaniaPostalSourceReadiness = {
  schemaId: typeof TANZANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'TZ';
  countryName: 'Tanzania';
  evaluatedAt: string;
  postalFormat: {
    pattern: '^\\d{5}$';
    authorityVerified: true;
    verifiedFormatOnly: true;
  };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: TanzaniaPostalSourceReadinessSource[];
  gates: TanzaniaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type TanzaniaPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildTanzaniaPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): TanzaniaPostalSourceReadiness {
  return {
    schemaId: TANZANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'TZ',
    countryName: 'Tanzania',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: {
      pattern: '^\\d{5}$',
      authorityVerified: true,
      verifiedFormatOnly: true,
    },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      {
        sourceId: 'tcra-tanzania-postcode',
        scope: 'national-postcode-policy-and-service',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'tcra-tanzania-postcode-list-publication',
        scope: 'postcode-list-publication-notice',
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
        id: 'postal-format-authority-evidence',
        label: 'The TCRA national five-digit numeric postcode format is recorded as format-only authority evidence',
        status: 'passed',
        evidence: [
          'tcra-tanzania-postcode',
          'postalFormat.pattern=^\\d{5}$',
          'authorityVerified=true',
          'verifiedFormatOnly=true',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postcode-list-publication-recorded',
        label: 'The TCRA postcode-list publication notice is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'tcra-tanzania-postcode-list-publication',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-code-mapping-evidence',
        label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced',
        status: 'blocked',
        evidence: ['postalMappingEvidence=false for every source', 'A national format is not a mapping.'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'redistribution-rights',
        label: 'Redistribution rights for any postcode mapping, list, or derived output are verified',
        status: 'blocked',
        evidence: ['redistributionStatus=metadata-only for every source'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The usable postcode mapping has a version, retrieval date, update cadence, and correction path',
        status: 'blocked',
        evidence: ['version=null for every source', 'updateCadence=unknown for every source'],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage and documented corrections.',
      'Field-level reuse, attribution, and redistribution terms for any mapping, list, map, search result, or derived output.',
      'Publication date, retrieval date, update cadence, coverage limits, and correction path for the mapping and publication list.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack records only the national five-digit format, not a postcode-to-locality match.',
      'This pack does not assert operational coverage or delivery-point coverage.',
    ],
  };
}

export function validateTanzaniaPostalSourceReadiness(
  readiness: TanzaniaPostalSourceReadiness,
): TanzaniaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== TANZANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'TZ' || readiness.countryName !== 'Tanzania') errors.push('country-mismatch');
  if (readiness.postalFormat.pattern !== '^\\d{5}$') errors.push('postal-format-pattern-mismatch');
  if (readiness.postalFormat.authorityVerified !== true) errors.push('postal-format-not-authority-verified');
  if (readiness.postalFormat.verifiedFormatOnly !== true) errors.push('postal-format-boundary-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('tcra-tanzania-postcode')) errors.push('postcode-service-source-missing');
  if (!sourceIds.has('tcra-tanzania-postcode-list-publication')) errors.push('postcode-publication-source-missing');

  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }

  const formatGate = gateById.get('postal-format-authority-evidence');
  if (!formatGate || formatGate.status !== 'passed' || formatGate.blocksRealPostalLookup !== false) {
    errors.push('postal-format-authority-gate-missing');
  }

  for (const gateId of [
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
