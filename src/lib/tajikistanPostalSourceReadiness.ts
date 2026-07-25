export const TAJIKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-tajikistan-postal-source-readiness-v0.1';

export type TajikistanPostalSourceReadinessSource = {
  sourceId: 'tajik-post-postcode-list' | 'upu-tajikistan-designated-operator' | 'tajstat-regions-2024-open-license' | 'tj-current-postcode-mapping-rights-coverage-and-correction-required';
  scope: 'official-postcode-format-and-list-reference' | 'upu-designated-postal-operator-reference' | 'administrative-structure-open-license-reference' | 'current-postcode-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted';
  rawRecordsBundled: false;
};

export type TajikistanPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type TajikistanPostalSourceReadiness = {
  schemaId: typeof TAJIKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'TJ';
  countryName: 'Tajikistan';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{6}$'; formatAuthorityEvidence: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: TajikistanPostalSourceReadinessSource[];
  gates: TajikistanPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type TajikistanPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type TajikistanPostalSourceIngestionPlan = {
  rawSnapshotStorage: 'external-nonpublic';
  rawRecordsBundled: false;
  allowMappingIngestion: boolean;
  mappingReuseTermsVerified: boolean;
  mappingVersion: string | null;
  coverageEvidenceRecorded: boolean;
  correctionPathRecorded: boolean;
  proposedColumns: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';
const UNSAFE_SOURCE_FIELD = /(^|_)(address|street|house|building|premise|recipient|phone|email|latitude|longitude|coordinate|geometry)(_|$)/;

export function validateTajikistanPostalSourceIngestionPlan(plan: TajikistanPostalSourceIngestionPlan): string[] {
  const errors: string[] = [];
  if (plan.rawSnapshotStorage !== 'external-nonpublic') errors.push('raw-snapshot-storage-not-external');
  if (plan.rawRecordsBundled !== false) errors.push('raw-records-must-not-be-bundled');
  for (const column of plan.proposedColumns.map(column => column.trim().toLowerCase())) if (UNSAFE_SOURCE_FIELD.test(column)) errors.push(`unsafe-column:${column}`);
  if (plan.allowMappingIngestion && !plan.mappingReuseTermsVerified) errors.push('mapping-reuse-terms-not-verified');
  if (plan.allowMappingIngestion && !plan.mappingVersion) errors.push('mapping-version-not-recorded');
  if (plan.allowMappingIngestion && !plan.coverageEvidenceRecorded) errors.push('mapping-coverage-not-recorded');
  if (plan.allowMappingIngestion && !plan.correctionPathRecorded) errors.push('mapping-correction-path-not-recorded');
  return errors;
}

export function buildTajikistanPostalSourceReadiness(input: { evaluatedAt?: string } = {}): TajikistanPostalSourceReadiness {
  return {
    schemaId: TAJIKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'TJ',
    countryName: 'Tajikistan',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{6}$', formatAuthorityEvidence: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'tajik-post-postcode-list', scope: 'official-postcode-format-and-list-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; publication version not recorded', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'upu-tajikistan-designated-operator', scope: 'upu-designated-postal-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'UPU postal entities status list dated 2024-03-15', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'tajstat-regions-2024-open-license', scope: 'administrative-structure-open-license-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'Regions in the Republic of Tajikistan 2024, published 2024-11-06', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'tj-current-postcode-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'Tajik Post publishes a six-digit postcode list for offline format validation only', status: 'passed', evidence: ['tajik-post-postcode-list', 'nationalPattern=^[0-9]{6}$', 'formatAuthorityEvidence=true', 'no postcode row retained'], blocksRealPostalLookup: false },
      { id: 'designated-operator-recorded', label: 'UPU records Unitary State Enterprise TAJIK POST as the designated operator', status: 'passed', evidence: ['upu-tajikistan-designated-operator', 'operator=Unitary State Enterprise TAJIK POST', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'administrative-structure-license-recorded', label: 'Tajstat publishes administrative-structure material under CC BY 4.0', status: 'passed', evidence: ['tajstat-regions-2024-open-license', 'license=CC BY 4.0', 'no administrative key, boundary, or geography record acquired'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires safe schema, rights, version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'unsafe location and personal fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit, verified reuse terms', status: 'blocked', evidence: ['Tajik Post list displays no bulk mapping reuse grant', 'no official mapping license or terms recorded', 'tj-current-postcode-mapping-rights-coverage-and-correction-required unresolved'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-coverage-and-schema', label: 'Reusable administrative keys or boundaries have an inspected schema and coverage evidence independent of postal data', status: 'blocked', evidence: ['Tajstat publication is an administrative-structure reference, not a postal mapping', 'no administrative key or boundary schema acquired', 'coverage-not-validated-for-postal-use'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode rows, postal zones, or geographic records acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['Tajik Post list publication version not recorded', 'no current mapping version recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current Tajik Post or authority-designated mapping artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, and attribution wording.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers and reject address, street, building, recipient, precise-point, geometry, and query-result fields.', 'Record mapping coverage, current version, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert that the Tajik Post list is licensed for bulk redistribution or derived mappings.', 'This pack does not download, store, or redistribute Tajik Post, UPU, Tajstat, postal-mapping, boundary, or address records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateTajikistanPostalSourceReadiness(readiness: TajikistanPostalSourceReadiness): TajikistanPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== TAJIKISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'TJ' || readiness.countryName !== 'Tajikistan') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{6}$' || readiness.postalFormat.formatAuthorityEvidence !== true) errors.push('postal-format-evidence-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['tajik-post-postcode-list', 'upu-tajikistan-designated-operator', 'tajstat-regions-2024-open-license', 'tj-current-postcode-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-format-authority-evidence', 'designated-operator-recorded', 'administrative-structure-license-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-mapping-reuse-rights', 'administrative-geodata-coverage-and-schema', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
