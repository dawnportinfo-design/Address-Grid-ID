export const GUATEMALA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-guatemala-postal-source-readiness-v0.1';

export type GuatemalaPostalSourceReadinessGate = {
  id: string;
  label: string;
  status: 'passed' | 'blocked';
  evidence: string[];
  blocksRealPostalLookup: boolean;
};

export type GuatemalaPostalSourceReadinessSource = {
  sourceId: 'gt-ine-censo-2018-lugares-poblados' | 'gt-postal-code-mapping-required' | 'upu-universal-postcode-database';
  scope: 'populated-place-metadata' | 'postal-code-mapping-and-delivery-points' | 'international-licensed-postcode-reference';
  authorityStatus: 'recorded' | 'unresolved' | 'international-licensed-candidate';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled' | 'license-review-required';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawRecordsBundled: false;
  documentation?: {
    sourceUrl: string;
    termsUrl: string;
    correctionUrl: string;
    correctionPathStatus: 'general-contact-only';
    reuseStatus: 'metadata-only-verified';
    verifiedAt: string;
  };
};

export type GuatemalaPostalSourceReadiness = {
  schemaId: typeof GUATEMALA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'GT';
  countryName: 'Guatemala';
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
  sources: GuatemalaPostalSourceReadinessSource[];
  gates: GuatemalaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type GuatemalaPostalSourceReadinessValidation = {
  valid: boolean;
  errors: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildGuatemalaPostalSourceReadiness(input: {
  evaluatedAt?: string;
} = {}): GuatemalaPostalSourceReadiness {
  return {
    schemaId: GUATEMALA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'GT',
    countryName: 'Guatemala',
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
    sources: [
      {
        sourceId: 'gt-ine-censo-2018-lugares-poblados',
        scope: 'populated-place-metadata',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'metadata-only',
        version: 'Censo 2018',
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawRecordsBundled: false,
        documentation: {
          sourceUrl: 'https://datos.ine.gob.gt/es/dataset/censo-2018-lugares-poblados',
          termsUrl: 'https://datos.ine.gob.gt/es/dataset/censo-2018-lugares-poblados',
          correctionUrl: 'https://www.ine.gob.gt/contactenos/',
          correctionPathStatus: 'general-contact-only',
          reuseStatus: 'metadata-only-verified',
          verifiedAt: '2026-07-24T00:00:00.000Z',
        },
      },
      {
        sourceId: 'gt-postal-code-mapping-required',
        scope: 'postal-code-mapping-and-delivery-points',
        authorityStatus: 'unresolved',
        postalMappingEvidence: false,
        redistributionStatus: 'not-bundled',
        version: null,
        retrievedAt: null,
        updateCadence: 'unknown',
        rawRecordsBundled: false,
      },
      {
        sourceId: 'upu-universal-postcode-database',
        scope: 'international-licensed-postcode-reference',
        authorityStatus: 'international-licensed-candidate',
        postalMappingEvidence: false,
        redistributionStatus: 'license-review-required',
        version: '2026.1 catalog metadata',
        retrievedAt: '2026-07-23',
        updateCadence: 'provider-released',
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
        id: 'country-specific-populated-place-source-recorded',
        label: 'A Guatemala populated-place source is cataloged as metadata only',
        status: 'passed',
        evidence: [
          'gt-ine-censo-2018-lugares-poblados',
          'postalMappingEvidence=false',
          'redistributionStatus=metadata-only',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'populated-place-metadata-reuse-terms-recorded',
        label: 'INE populated-place metadata reuse terms are recorded without importing source records',
        status: 'passed',
        evidence: [
          'gt-ine-censo-2018-lugares-poblados documentation.reuseStatus=metadata-only-verified',
          'The INE dataset page declares Creative Commons Attribution.',
          'postalMappingEvidence=false',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'populated-place-metadata-general-contact-recorded',
        label: 'The INE general contact route is recorded without treating it as a dataset-specific correction path',
        status: 'passed',
        evidence: [
          'https://www.ine.gob.gt/contactenos/',
          'correctionPathStatus=general-contact-only',
          'does-not-satisfy-postal-mapping-correction-path',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'licensed-international-postcode-candidate-recorded',
        label: 'A licensed international postcode reference is recorded as metadata only',
        status: 'passed',
        evidence: [
          'upu-universal-postcode-database',
          'redistributionStatus=license-review-required',
          'postalMappingEvidence=false',
        ],
        blocksRealPostalLookup: false,
      },
      {
        id: 'postal-authority-and-jurisdiction-evidence',
        label: 'A country-specific postal authority and publication scope are recorded',
        status: 'blocked',
        evidence: ['gt-postal-code-mapping-required authorityStatus=unresolved'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'postal-code-mapping-evidence',
        label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced',
        status: 'blocked',
        evidence: ['The five-digit format is not a mapping.', 'postalMappingEvidence=false for every source'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'redistribution-rights',
        label: 'Redistribution rights for any derived postal mapping are verified',
        status: 'blocked',
        evidence: ['gt-postal-code-mapping-required redistributionStatus=not-bundled'],
        blocksRealPostalLookup: true,
      },
      {
        id: 'version-freshness-and-update-cadence',
        label: 'The postal mapping has a version, retrieval date, and update cadence',
        status: 'blocked',
        evidence: ['gt-postal-code-mapping-required version=null', 'gt-postal-code-mapping-required updateCadence=unknown'],
        blocksRealPostalLookup: true,
      },
    ],
    nextRequiredEvidence: [
      'Country-specific postal authority or authority-designated publisher.',
      'Versioned postal-code mapping scope and geographic coverage.',
      'Field-level reuse, attribution, and redistribution terms.',
      'Publication date, retrieval date, update cadence, and correction path.',
      'A separate UPU contract and data-use review if the licensed international candidate is considered; it does not replace Guatemala authority evidence.',
    ],
    nonClaims: [
      'This pack does not provide a real postcode lookup.',
      'This pack does not assert an address-to-postcode match.',
      'This pack does not assert delivery-point or carrier deliverability coverage.',
    ],
  };
}

export function validateGuatemalaPostalSourceReadiness(
  readiness: GuatemalaPostalSourceReadiness,
): GuatemalaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));

  if (readiness.schemaId !== GUATEMALA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'GT' || readiness.countryName !== 'Guatemala') errors.push('country-mismatch');
  if (readiness.postalFormat.pattern !== '^\\d{5}$' || readiness.postalFormat.verifiedFormatOnly !== true) {
    errors.push('postal-format-boundary-missing');
  }
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  if (!sourceIds.has('gt-ine-censo-2018-lugares-poblados')) errors.push('ine-source-missing');
  if (!sourceIds.has('gt-postal-code-mapping-required')) errors.push('postal-mapping-source-slot-missing');
  if (!sourceIds.has('upu-universal-postcode-database')) errors.push('upu-licensed-candidate-missing');
  const ineSource = readiness.sources.find(source => source.sourceId === 'gt-ine-censo-2018-lugares-poblados');
  if (!ineSource?.documentation || ineSource.documentation.reuseStatus !== 'metadata-only-verified' ||
    !ineSource.documentation.sourceUrl.startsWith('https://datos.ine.gob.gt/') ||
    ineSource.documentation.correctionUrl !== 'https://www.ine.gob.gt/contactenos/' ||
    ineSource.documentation.correctionPathStatus !== 'general-contact-only') {
    errors.push('ine-metadata-reuse-documentation-missing');
  }

  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }

  const requiredBlockedGates = [
    'postal-authority-and-jurisdiction-evidence',
    'postal-code-mapping-evidence',
    'redistribution-rights',
    'version-freshness-and-update-cadence',
  ];
  for (const gateId of requiredBlockedGates) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) {
      errors.push(`required-blocked-gate-missing:${gateId}`);
    }
  }
  const reuseTermsGate = gateById.get('populated-place-metadata-reuse-terms-recorded');
  if (!reuseTermsGate || reuseTermsGate.status !== 'passed' || reuseTermsGate.blocksRealPostalLookup !== false) {
    errors.push('ine-metadata-reuse-terms-gate-missing');
  }
  const generalContactGate = gateById.get('populated-place-metadata-general-contact-recorded');
  if (!generalContactGate || generalContactGate.status !== 'passed' || generalContactGate.blocksRealPostalLookup !== false) {
    errors.push('ine-metadata-general-contact-gate-missing');
  }

  return { valid: errors.length === 0, errors };
}
