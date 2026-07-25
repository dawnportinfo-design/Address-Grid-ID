export const JORDAN_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-jordan-postal-source-readiness-v0.1';

export type JordanPostalSourceReadinessSource = {
  sourceId: 'jordan-open-government-data-license-v1' | 'jordan-post-offices-open-data-catalog-2025' | 'upu-jordan-designated-operator' | 'jo-current-postcode-format-coverage-and-correction-required';
  scope: 'government-open-data-reuse-license' | 'postal-office-dataset-catalog-and-safety-boundary' | 'upu-designated-postal-operator-reference' | 'current-postcode-format-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'rejected-unsafe-fields';
  rawRecordsBundled: false;
};

export type JordanPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type JordanPostalSourceReadiness = {
  schemaId: typeof JORDAN_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'JO';
  countryName: 'Jordan';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false; unverifiedFormatInferenceRejected: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: JordanPostalSourceReadinessSource[];
  gates: JordanPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type JordanPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type JordanPostalSourceIngestionPlan = {
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
const UNSAFE_SOURCE_FIELD = /(^|_)(address|street|house|building|premise|recipient|phone|email|latitude|longitude|coordinate|geometry|property)(_|$)/;

export function validateJordanPostalSourceIngestionPlan(plan: JordanPostalSourceIngestionPlan): string[] {
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

export function buildJordanPostalSourceReadiness(input: { evaluatedAt?: string } = {}): JordanPostalSourceReadiness {
  return {
    schemaId: JORDAN_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'JO',
    countryName: 'Jordan',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false, unverifiedFormatInferenceRejected: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'jordan-open-government-data-license-v1', scope: 'government-open-data-reuse-license', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'Jordan Open Government Data License issue v1.0', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'jordan-post-offices-open-data-catalog-2025', scope: 'postal-office-dataset-catalog-and-safety-boundary', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'catalog last updated 2025-07-16', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'rejected-unsafe-fields', rawRecordsBundled: false },
      { sourceId: 'upu-jordan-designated-operator', scope: 'upu-designated-postal-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'UPU postal entities status list dated 2024-03-15', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'jo-current-postcode-format-coverage-and-correction-required', scope: 'current-postcode-format-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'government-open-data-license-recorded', label: 'Jordan’s open-government license permits use, reuse, and redistribution of platform data subject to its terms', status: 'passed', evidence: ['jordan-open-government-data-license-v1', 'license=Jordan Open Government Data License v1.0', 'field-level safety remains independently required'], blocksRealPostalLookup: false },
      { id: 'postal-office-dataset-safety-boundary-recorded', label: 'Jordan Post’s open-data catalog is recorded without acquiring its address-bearing office records', status: 'passed', evidence: ['jordan-post-offices-open-data-catalog-2025', 'rawAcquisitionStatus=rejected-unsafe-fields', 'rawRecordsBundled=false'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires safe schema, rights, version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'unsafe address, location, and property fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'An authority-published national postcode format is recorded independently of an address-bearing office dataset', status: 'blocked', evidence: ['nationalPattern=null', 'formatAuthorityEvidence=false', 'unverifiedFormatInferenceRejected=true', 'no pattern inferred from postal-office records'], blocksRealPostalLookup: true },
      { id: 'safe-postcode-only-source', label: 'An official, explicitly reusable postcode-only or postcode-to-safe-administrative-key source is available', status: 'blocked', evidence: ['Jordan Post catalog records address and property fields alongside postal codes', 'unsafe source fields prevent acquisition under AGID publication boundary', 'no safe filtered official feed or schema contract recorded'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode rows or office records acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['catalog last updated 2025-07-16', 'no safe mapping version recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a Jordan Post or government-published postcode-only artifact, or a documented safe field-level export contract, with explicit license, version, coverage, and correction metadata; never ingest address, office-location, property, or query fields.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers and reject address, street, building, recipient, precise-point, geometry, property, and query-result fields.', 'Record mapping coverage, current version, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert a national Jordan postcode regex.', 'This pack does not download, store, or redistribute Jordan Post office, address, property, postal-mapping, boundary, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateJordanPostalSourceReadiness(readiness: JordanPostalSourceReadiness): JordanPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== JORDAN_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'JO' || readiness.countryName !== 'Jordan') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false || readiness.postalFormat.unverifiedFormatInferenceRejected !== true) errors.push('postal-format-not-safely-unresolved');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['jordan-open-government-data-license-v1', 'jordan-post-offices-open-data-catalog-2025', 'upu-jordan-designated-operator', 'jo-current-postcode-format-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['government-open-data-license-recorded', 'postal-office-dataset-safety-boundary-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-authority-evidence', 'safe-postcode-only-source', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
