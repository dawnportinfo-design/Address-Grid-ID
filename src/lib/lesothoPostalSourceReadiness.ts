export const LESOTHO_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-lesotho-postal-source-readiness-v0.1';

export type LesothoPostalSourceReadinessSource = {
  sourceId: 'lesotho-postal-services-government-reference' | 'lesotho-communications-authority-postal-report' | 'un-salb-lesotho-admin-boundaries' | 'ls-postcode-mapping-required';
  scope: 'government-postal-service-reference' | 'postal-sector-regulatory-report' | 'validated-administrative-boundaries-reference' | 'postcode-mapping-rights-and-update-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawRecordsBundled: false;
};

export type LesothoPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type LesothoPostalSourceReadiness = {
  schemaId: typeof LESOTHO_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'LS';
  countryName: 'Lesotho';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: LesothoPostalSourceReadinessSource[];
  gates: LesothoPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type LesothoPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildLesothoPostalSourceReadiness(input: { evaluatedAt?: string } = {}): LesothoPostalSourceReadiness {
  return {
    schemaId: LESOTHO_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'LS',
    countryName: 'Lesotho',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'lesotho-postal-services-government-reference', scope: 'government-postal-service-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: null, retrievedAt: '2026-07-23', updateCadence: 'unknown', rawRecordsBundled: false },
      { sourceId: 'lesotho-communications-authority-postal-report', scope: 'postal-sector-regulatory-report', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: '2023-24 annual report', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawRecordsBundled: false },
      { sourceId: 'un-salb-lesotho-admin-boundaries', scope: 'validated-administrative-boundaries-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'validated 2024-06-24', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawRecordsBundled: false },
      { sourceId: 'ls-postcode-mapping-required', scope: 'postcode-mapping-rights-and-update-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-service-and-regulatory-sources-recorded', label: 'Lesotho postal-service and regulatory references are cataloged as metadata only', status: 'passed', evidence: ['lesotho-postal-services-government-reference', 'lesotho-communications-authority-postal-report', 'postalMappingEvidence=false for both sources'], blocksRealPostalLookup: false },
      { id: 'validated-administrative-boundaries-recorded', label: 'Validated administrative-boundary reference is cataloged as metadata only', status: 'passed', evidence: ['un-salb-lesotho-admin-boundaries', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'An authority-published national postcode format is evidenced for offline reuse', status: 'blocked', evidence: ['ls-postcode-mapping-required authorityStatus=unresolved', 'nationalPattern=null'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-evidence', label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source'], blocksRealPostalLookup: true },
      { id: 'redistribution-rights', label: 'Redistribution rights for any derived postal mapping are verified', status: 'blocked', evidence: ['ls-postcode-mapping-required redistributionStatus=not-bundled'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-update-cadence', label: 'The postal mapping has a version, retrieval date, update cadence, and correction path', status: 'blocked', evidence: ['ls-postcode-mapping-required version=null', 'ls-postcode-mapping-required retrievedAt=null', 'ls-postcode-mapping-required updateCadence=unknown'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: [
      'A Lesotho postal authority or authority-designated publisher that documents the national postcode format for offline reuse.',
      'A versioned postcode-to-locality or delivery-point mapping with geographic coverage and correction policy.',
      'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.',
      'Publication date, retrieval date, update cadence, and correction path for the mapping.',
    ],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert a national postcode format.', 'This pack does not assert an address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateLesothoPostalSourceReadiness(readiness: LesothoPostalSourceReadiness): LesothoPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== LESOTHO_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'LS' || readiness.countryName !== 'Lesotho') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false) errors.push('postal-format-boundary-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['lesotho-postal-services-government-reference', 'lesotho-communications-authority-postal-report', 'un-salb-lesotho-admin-boundaries', 'ls-postcode-mapping-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
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
