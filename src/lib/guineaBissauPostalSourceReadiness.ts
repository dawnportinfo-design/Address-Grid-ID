export const GUINEA_BISSAU_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-guinea-bissau-postal-source-readiness-v0.1';

export type GuineaBissauPostalSourceReadinessSource = {
  sourceId: 'upu-guinea-bissau-addressing-unit' | 'itu-upu-guinea-bissau-post-office-list' | 'guinea-bissau-official-admin-division-reference' | 'gw-postcode-mapping-required';
  scope: 'official-addressing-format-reference' | 'international-postal-office-reference' | 'official-administrative-division-reference' | 'postcode-mapping-rights-and-update-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawRecordsBundled: false;
};

export type GuineaBissauPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type GuineaBissauPostalSourceReadiness = {
  schemaId: typeof GUINEA_BISSAU_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'GW';
  countryName: 'Guinea-Bissau';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{4}$'; formatAuthorityEvidence: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: GuineaBissauPostalSourceReadinessSource[];
  gates: GuineaBissauPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type GuineaBissauPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildGuineaBissauPostalSourceReadiness(input: { evaluatedAt?: string } = {}): GuineaBissauPostalSourceReadiness {
  return {
    schemaId: GUINEA_BISSAU_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'GW',
    countryName: 'Guinea-Bissau',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{4}$', formatAuthorityEvidence: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'upu-guinea-bissau-addressing-unit', scope: 'official-addressing-format-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: '03/2005', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawRecordsBundled: false },
      { sourceId: 'itu-upu-guinea-bissau-post-office-list', scope: 'international-postal-office-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: null, retrievedAt: '2026-07-23', updateCadence: 'unknown', rawRecordsBundled: false },
      { sourceId: 'guinea-bissau-official-admin-division-reference', scope: 'official-administrative-division-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: null, retrievedAt: '2026-07-23', updateCadence: 'unknown', rawRecordsBundled: false },
      { sourceId: 'gw-postcode-mapping-required', scope: 'postcode-mapping-rights-and-update-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'An authority-published national postcode format is evidenced for offline validation only', status: 'passed', evidence: ['upu-guinea-bissau-addressing-unit', 'nationalPattern=^[0-9]{4}$', 'formatAuthorityEvidence=true'], blocksRealPostalLookup: false },
      { id: 'postal-and-administrative-sources-recorded', label: 'International postal and official administrative references are cataloged as metadata only', status: 'passed', evidence: ['itu-upu-guinea-bissau-post-office-list', 'guinea-bissau-official-admin-division-reference', 'postalMappingEvidence=false for both sources'], blocksRealPostalLookup: false },
      { id: 'postal-code-mapping-evidence', label: 'A versioned postcode-to-locality or delivery-point mapping is evidenced for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source'], blocksRealPostalLookup: true },
      { id: 'redistribution-rights', label: 'Redistribution rights for any derived postal mapping are verified', status: 'blocked', evidence: ['gw-postcode-mapping-required redistributionStatus=not-bundled'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-update-cadence', label: 'The postal mapping has a version, retrieval date, update cadence, and correction path', status: 'blocked', evidence: ['gw-postcode-mapping-required version=null', 'gw-postcode-mapping-required retrievedAt=null', 'gw-postcode-mapping-required updateCadence=unknown'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['A current authority-designated postcode-to-locality or delivery-point mapping with geographic coverage and correction policy.', 'Field-level reuse, attribution, and redistribution terms for any mapping or derived output.', 'Publication date, retrieval date, update cadence, and correction path for the mapping.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert an address-to-postcode match.', 'This pack does not assert that the documented format is current beyond the cited authority publication.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateGuineaBissauPostalSourceReadiness(readiness: GuineaBissauPostalSourceReadiness): GuineaBissauPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== GUINEA_BISSAU_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'GW' || readiness.countryName !== 'Guinea-Bissau') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{4}$' || readiness.postalFormat.formatAuthorityEvidence !== true) errors.push('postal-format-evidence-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['upu-guinea-bissau-addressing-unit', 'itu-upu-guinea-bissau-post-office-list', 'guinea-bissau-official-admin-division-reference', 'gw-postcode-mapping-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  if (gateById.get('postal-format-authority-evidence')?.status !== 'passed') errors.push('postal-format-gate-not-passed');
  for (const gateId of ['postal-code-mapping-evidence', 'redistribution-rights', 'version-freshness-and-update-cadence']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
