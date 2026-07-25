export const TURKMENISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-turkmenistan-postal-source-readiness-v0.1';

export type TurkmenistanPostalSourceReadinessSource = {
  sourceId: 'turkmenistan-postal-communication-law-2021' | 'turkmenistan-government-turkmenpochta-operator-reference' | 'turkmenpost-official-service-surface' | 'turkmenistan-2024-administrative-division-resolution' | 'tm-current-postcode-mapping-rights-coverage-and-correction-required';
  scope: 'postal-law-and-privacy-boundary' | 'government-postal-operator-reference' | 'official-postal-service-surface' | 'administrative-division-authority-reference' | 'current-postcode-format-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'terms-not-verified';
  rawRecordsBundled: false;
};

export type TurkmenistanPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type TurkmenistanPostalSourceReadiness = {
  schemaId: typeof TURKMENISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'TM';
  countryName: 'Turkmenistan';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false; unverifiedFormatInferenceRejected: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: TurkmenistanPostalSourceReadinessSource[];
  gates: TurkmenistanPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type TurkmenistanPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type TurkmenistanPostalSourceIngestionPlan = {
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

export function validateTurkmenistanPostalSourceIngestionPlan(plan: TurkmenistanPostalSourceIngestionPlan): string[] {
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

export function buildTurkmenistanPostalSourceReadiness(input: { evaluatedAt?: string } = {}): TurkmenistanPostalSourceReadiness {
  return {
    schemaId: TURKMENISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'TM',
    countryName: 'Turkmenistan',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false, unverifiedFormatInferenceRejected: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'turkmenistan-postal-communication-law-2021', scope: 'postal-law-and-privacy-boundary', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'Law on Postal Communication published 2021-11-18', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'turkmenistan-government-turkmenpochta-operator-reference', scope: 'government-postal-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'government reference published 2021-10-09', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'turkmenpost-official-service-surface', scope: 'official-postal-service-surface', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; publication version not recorded', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'turkmenistan-2024-administrative-division-resolution', scope: 'administrative-division-authority-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'resolution published 2024-09-30', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'terms-not-verified', rawRecordsBundled: false },
      { sourceId: 'tm-current-postcode-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-format-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-law-and-privacy-boundary-recorded', label: 'Postal law records a national operator role and protects postal-address and user data', status: 'passed', evidence: ['turkmenistan-postal-communication-law-2021', 'postal address and user data are not acquired', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'postal-operator-surfaces-recorded', label: 'Government and Turkmenpost service references are recorded as metadata only', status: 'passed', evidence: ['turkmenistan-government-turkmenpochta-operator-reference', 'turkmenpost-official-service-surface', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires safe schema, rights, version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'unsafe location and personal fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'An authority-published national postcode format is recorded independently of a personal-address or tracking service', status: 'blocked', evidence: ['nationalPattern=null', 'formatAuthorityEvidence=false', 'unverifiedFormatInferenceRejected=true', 'no format is inferred from unrelated interfaces or examples'], blocksRealPostalLookup: true },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit, verified reuse terms', status: 'blocked', evidence: ['no official mapping license or terms recorded', 'official postal surfaces are metadata-only', 'tm-current-postcode-mapping-rights-coverage-and-correction-required unresolved'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-reuse-rights', label: 'Administrative keys or boundaries have explicit reusable terms independent of personal or cadastral data', status: 'blocked', evidence: ['administrative-division resolution records authority, not data reuse terms', 'land-cadastre sources may contain restricted parcel or owner information', 'no administrative data acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode rows, service results, or geographic records acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['no current mapping version recorded', 'correction-path-not-recorded', 'service publication version not recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current Turkmenpost or authority-designated mapping artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, and attribution wording.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers and reject address, street, building, recipient, precise-point, geometry, cadastral, owner, and query-result fields.', 'Record mapping coverage, current version, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert a national Turkmenistan postal-code regex.', 'This pack does not download, store, or redistribute Turkmenpost, government, cadastral, postal-mapping, boundary, address, tracking, or user records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateTurkmenistanPostalSourceReadiness(readiness: TurkmenistanPostalSourceReadiness): TurkmenistanPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== TURKMENISTAN_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'TM' || readiness.countryName !== 'Turkmenistan') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false || readiness.postalFormat.unverifiedFormatInferenceRejected !== true) errors.push('postal-format-not-safely-unresolved');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['turkmenistan-postal-communication-law-2021', 'turkmenistan-government-turkmenpochta-operator-reference', 'turkmenpost-official-service-surface', 'turkmenistan-2024-administrative-division-resolution', 'tm-current-postcode-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-law-and-privacy-boundary-recorded', 'postal-operator-surfaces-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-authority-evidence', 'postal-mapping-reuse-rights', 'administrative-geodata-reuse-rights', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
