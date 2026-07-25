export const HONDURAS_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-honduras-postal-source-readiness-v0.1';

export type HondurasPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type HondurasPostalSourceReadinessSource = {
  sourceId:
    | 'honducor-transparency-portal'
    | 'hn-ine-dee-2024'
    | 'hn-sen-geoportal'
    | 'hn-postcode-mapping-required';
  scope:
    | 'postal-operator-transparency-profile'
    | 'administrative-division-statistics'
    | 'official-statistical-geoportal'
    | 'postcode-format-mapping-rights-and-update-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawRecordsBundled: false;
};

export type HondurasPostalSourceReadiness = {
  schemaId: typeof HONDURAS_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'HN';
  countryName: 'Honduras';
  evaluatedAt: string;
  postalFormat: {
    nationalPattern: null;
    formatAuthorityEvidence: false;
  };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: HondurasPostalSourceReadinessSource[];
  gates: HondurasPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type HondurasPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildHondurasPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): HondurasPostalSourceReadiness {
  return {
    schemaId: HONDURAS_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'HN',
    countryName: 'Honduras',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: {
      nationalPattern: null,
      formatAuthorityEvidence: false,
    },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      {
        sourceId: 'honducor-transparency-portal',
        scope: 'postal-operator-transparency-profile',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'hn-ine-dee-2024',
        scope: 'administrative-division-statistics',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: 'DEE 2024',
        retrievedAt: '2026-07-23',
        updateCadence: 'provider-released',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'hn-sen-geoportal',
        scope: 'official-statistical-geoportal',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: null,
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'hn-postcode-mapping-required',
        scope: 'postcode-format-mapping-rights-and-update-evidence',
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
        evidence: [
          'containsPersonalData=false',
          'containsRawThirdPartyData=false',
          'rawRecordsBundled=false for every source',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-operator-source-recorded',
        label: 'The Honduras postal operator transparency profile is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'honducor-transparency-portal',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'administrative-and-geoportal-sources-recorded',
        label: 'Official administrative and geoportal references are cataloged as metadata only',
        status: 'passed',
        evidence: [
          'hn-ine-dee-2024',
          'hn-sen-geoportal',
          'postalMappingEvidence=false for both sources',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-format-authority-evidence',
        label: 'An authority-published national postcode format is evidenced',
        status: 'blocked',
        evidence: [
          'hn-postcode-mapping-required authorityStatus=unresolved',
          'nationalPattern=null',
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
        evidence: ['hn-postcode-mapping-required redistributionStatus=not-bundled'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The postal mapping has a version, retrieval date, update cadence, and correction path',
        status: 'blocked',
        evidence: [
          'hn-postcode-mapping-required version=null',
          'hn-postcode-mapping-required retrievedAt=null',
          'hn-postcode-mapping-required updateCadence=unknown',
        ],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'A Honduras postal authority or authority-designated publisher for postcode format and mapping scope.',
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage and correction policy.',
      'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.',
      'Publication date, retrieval date, update cadence, and correction path for the mapping.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert a national postcode format.',
      'This pack does not assert an address-to-postcode match.',
      'This pack does not assert delivery-point or carrier deliverability coverage.',
    ],
  };
}

export function validateHondurasPostalSourceReadiness(
  readiness: HondurasPostalSourceReadiness,
): HondurasPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== HONDURAS_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'HN' || readiness.countryName !== 'Honduras') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false) {
    errors.push('postal-format-boundary-missing');
  }
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');

  for (const sourceId of [
    'honducor-transparency-portal',
    'hn-ine-dee-2024',
    'hn-sen-geoportal',
    'hn-postcode-mapping-required',
  ]) {
    if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  }
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
