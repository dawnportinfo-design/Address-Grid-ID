export const PANAMA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-panama-postal-source-readiness-v0.1';

export type PanamaPostalSourceReadinessSource = {
  sourceId:
    | 'panama-national-postcode-system'
    | 'correos-panama-postal-services'
    | 'panama-miambiente-admin-boundaries'
    | 'pa-postcode-mapping-required';
  scope:
    | 'official-national-postcode-system-interface'
    | 'postal-operator-service-reference'
    | 'official-administrative-boundaries-geoportal'
    | 'postcode-mapping-rights-and-update-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawRecordsBundled: false;
};

export type PanamaPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type PanamaPostalSourceReadiness = {
  schemaId: typeof PANAMA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'PA';
  countryName: 'Panama';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: PanamaPostalSourceReadinessSource[];
  gates: PanamaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type PanamaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildPanamaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): PanamaPostalSourceReadiness {
  return {
    schemaId: PANAMA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'PA',
    countryName: 'Panama',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      {
        sourceId: 'panama-national-postcode-system',
        scope: 'official-national-postcode-system-interface',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: 'announced 2026-05-07',
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'correos-panama-postal-services',
        scope: 'postal-operator-service-reference',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'provider-released',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'panama-miambiente-admin-boundaries',
        scope: 'official-administrative-boundaries-geoportal',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: '2018 administrative-boundary item',
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'pa-postcode-mapping-required',
        scope: 'postcode-mapping-rights-and-update-evidence',
        authorityStatus: 'unresolved',
        postalMappingEvidence: false,
        redistributionStatus: 'not-bundled',
        version: null,
        retrievedAt: null,
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
    ],
    gates: [
      {
        id: 'no-personal-or-raw-third-party-data',
        label: 'The published pack remains metadata and synthetic fixtures only',
        status: 'passed',
        evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'],
        blocksRealPostalLookup: false,
      },
      {
        id: 'official-postcode-system-recorded',
        label: 'The Panama national postcode system is cataloged as metadata only',
        status: 'passed',
        evidence: ['panama-national-postcode-system', 'postalMappingEvidence=false', 'redistributionStatus=metadata-only'],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-operator-and-administrative-geo-sources-recorded',
        label: 'Postal operator and official administrative-boundary references are cataloged as metadata only',
        status: 'passed',
        evidence: ['correos-panama-postal-services', 'panama-miambiente-admin-boundaries', 'postalMappingEvidence=false for both sources'],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-format-authority-evidence',
        label: 'A stable authority-published national postcode format is evidenced for offline reuse',
        status: 'blocked',
        evidence: ['pa-postcode-mapping-required authorityStatus=unresolved', 'nationalPattern=null'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'postal-code-mapping-evidence',
        label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced for offline reuse',
        status: 'blocked',
        evidence: ['postalMappingEvidence=false for every source'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'redistribution-rights',
        label: 'Redistribution rights for any derived postal mapping are verified',
        status: 'blocked',
        evidence: ['pa-postcode-mapping-required redistributionStatus=not-bundled'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The postal mapping has a version, retrieval date, update cadence, and correction path',
        status: 'blocked',
        evidence: ['pa-postcode-mapping-required version=null', 'pa-postcode-mapping-required retrievedAt=null', 'pa-postcode-mapping-required updateCadence=unknown'],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'An authority-published specification for the Panama postcode format that is stable and permitted for offline reuse.',
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage and correction policy.',
      'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.',
      'Publication date, retrieval date, update cadence, and correction path for the mapping.',
    ],
    nonClaims: [
      'This pack does not query or provide a real postcode lookup.',
      'This pack does not assert a national postcode format.',
      'This pack does not store or infer a household, building, point, or address-to-postcode match.',
      'This pack does not assert delivery-point or carrier deliverability coverage.',
    ],
  };
}

export function validatePanamaPostalSourceReadiness(readiness: PanamaPostalSourceReadiness): PanamaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== PANAMA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'PA' || readiness.countryName !== 'Panama') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false) errors.push('postal-format-boundary-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['panama-national-postcode-system', 'correos-panama-postal-services', 'panama-miambiente-admin-boundaries', 'pa-postcode-mapping-required']) {
    if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  }
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-format-authority-evidence', 'postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
