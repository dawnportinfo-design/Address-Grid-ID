export const KENYA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-kenya-postal-source-readiness-v0.1';

export type KenyaPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type KenyaPostalSourceReadinessSource = {
  sourceId: 'posta-kenya';
  scope: 'postal-operator-post-office-locator';
  authorityStatus: 'recorded';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only';
  version: null;
  retrievedAt: '2026-07-23';
  updateCadence: 'unknown';
  rawRecordsBundled: false;
};

export type KenyaPostalSourceReadiness = {
  schemaId: typeof KENYA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'KE';
  countryName: 'Kenya';
  evaluatedAt: string;
  postalFormat: {
    pattern: '^\\d{5}$';
    verifiedFormatOnly: true;
  };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: KenyaPostalSourceReadinessSource[];
  gates: KenyaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type KenyaPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildKenyaPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): KenyaPostalSourceReadiness {
  return {
    schemaId: KENYA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'KE',
    countryName: 'Kenya',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: {
      pattern: '^\\d{5}$',
      verifiedFormatOnly: true,
    },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [{
      sourceId: 'posta-kenya',
      scope: 'postal-operator-post-office-locator',
      authorityStatus: 'recorded',
      postalMappingEvidence: false,
      redistributionStatus: 'metadata-only',
      version: null,
      retrievedAt: '2026-07-23',
      updateCadence: 'unknown',
      rawRecordsBundled: false,
    }],
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
        id: 'postal-operator-locator-recorded',
        label: 'The Kenya postal operator locator is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'posta-kenya',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-code-mapping-evidence',
        label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced',
        status: 'blocked',
        evidence: [
          'The five-digit format is not a mapping.',
          'posta-kenya postalMappingEvidence=false',
        ],
        blocksRealPostalLookup: true,
      },
      {
        id: 'redistribution-rights',
        label: 'Redistribution rights for any derived postal mapping are verified',
        status: 'blocked',
        evidence: ['posta-kenya redistributionStatus=metadata-only'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The postal mapping has a version, retrieval date, and update cadence',
        status: 'blocked',
        evidence: ['posta-kenya version=null', 'posta-kenya updateCadence=unknown'],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'A versioned Kenya postcode-to-locality or delivery-point mapping with geographic coverage.',
      'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.',
      'Publication date, retrieval date, update cadence, and correction path for the mapping.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert an address-to-postcode match.',
      'This pack does not assert delivery-point or carrier deliverability coverage.',
    ],
  };
}

export function validateKenyaPostalSourceReadiness(
  readiness: KenyaPostalSourceReadiness,
): KenyaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== KENYA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'KE' || readiness.countryName !== 'Kenya') errors.push('country-mismatch');
  if (readiness.postalFormat.pattern !== '^\\d{5}$' || readiness.postalFormat.verifiedFormatOnly !== true) {
    errors.push('postal-format-boundary-missing');
  }
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('posta-kenya')) errors.push('postal-operator-source-missing');

  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
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
