export const MOLDOVA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-moldova-postal-source-readiness-v0.1';

export type MoldovaPostalSourceReadinessSource = {
  sourceId: 'posta-moldovei-office-map' | 'moldova-state-property-agency-posta-moldovei' | 'moldova-administrative-classifier-catalog' | 'moldova-spatial-data-reuse-framework' | 'md-current-postcode-format-mapping-rights-coverage-and-correction-required';
  scope: 'official-postal-office-search-surface' | 'government-postal-operator-reference' | 'administrative-key-catalog-and-terms' | 'spatial-data-reuse-governance-reference' | 'current-postcode-format-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'license-unspecified';
  rawRecordsBundled: false;
};

export type MoldovaPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type MoldovaPostalSourceReadiness = {
  schemaId: typeof MOLDOVA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'MD';
  countryName: 'Moldova';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false; unverifiedFormatInferenceRejected: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: MoldovaPostalSourceReadinessSource[];
  gates: MoldovaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type MoldovaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type MoldovaPostalSourceIngestionPlan = {
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

export function validateMoldovaPostalSourceIngestionPlan(plan: MoldovaPostalSourceIngestionPlan): string[] {
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

export function buildMoldovaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): MoldovaPostalSourceReadiness {
  return {
    schemaId: MOLDOVA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'MD',
    countryName: 'Moldova',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false, unverifiedFormatInferenceRejected: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'posta-moldovei-office-map', scope: 'official-postal-office-search-surface', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; publication version not recorded', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'moldova-state-property-agency-posta-moldovei', scope: 'government-postal-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'government company profile reports 2025 data', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'moldova-administrative-classifier-catalog', scope: 'administrative-key-catalog-and-terms', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'catalog marks license not specified', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'license-unspecified', rawRecordsBundled: false },
      { sourceId: 'moldova-spatial-data-reuse-framework', scope: 'spatial-data-reuse-governance-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'open-data and public-sector reuse methodology approved 2025', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'md-current-postcode-format-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-format-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-operator-and-search-surface-recorded', label: 'Posta Moldovei’s national-operator status and office-search surface are recorded as metadata only', status: 'passed', evidence: ['moldova-state-property-agency-posta-moldovei', 'posta-moldovei-office-map', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'public-sector-reuse-framework-recorded', label: 'Moldova’s open-data and public-sector reuse governance framework is recorded for future source-specific review', status: 'passed', evidence: ['moldova-spatial-data-reuse-framework', 'source-specific license remains required', 'no raw spatial data acquired'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires safe schema, rights, version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'unsafe address, location, and property fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'An authority-published national postcode format is recorded independently of an address-bearing office search', status: 'blocked', evidence: ['nationalPattern=null', 'formatAuthorityEvidence=false', 'unverifiedFormatInferenceRejected=true', 'Posta Moldovei search is not queried'], blocksRealPostalLookup: true },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit, verified reuse terms', status: 'blocked', evidence: ['official map copyright notice is not a bulk mapping license', 'no official mapping license or terms recorded', 'md-current-postcode-format-mapping-rights-coverage-and-correction-required unresolved'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-reuse-rights', label: 'Administrative keys or boundaries have explicit reusable terms independent of address datasets', status: 'blocked', evidence: ['moldova-administrative-classifier-catalog license is unspecified', 'reuse framework does not establish this catalog resource terms', 'no administrative records acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no search results, postcode rows, or geographic records acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['official map publication version not recorded', 'no current mapping version recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current Posta Moldovei or authority-designated postcode-only artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, and attribution wording.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers and reject address, street, building, recipient, precise-point, geometry, property, and query-result fields.', 'Record mapping coverage, current version, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not query, store, or redistribute Posta Moldovei office-search results.', 'This pack does not assert a national Moldova postal-code regex.', 'This pack does not download, store, or redistribute Posta Moldovei, government, postal-mapping, boundary, address, property, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateMoldovaPostalSourceReadiness(readiness: MoldovaPostalSourceReadiness): MoldovaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== MOLDOVA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'MD' || readiness.countryName !== 'Moldova') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false || readiness.postalFormat.unverifiedFormatInferenceRejected !== true) errors.push('postal-format-not-safely-unresolved');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['posta-moldovei-office-map', 'moldova-state-property-agency-posta-moldovei', 'moldova-administrative-classifier-catalog', 'moldova-spatial-data-reuse-framework', 'md-current-postcode-format-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-operator-and-search-surface-recorded', 'public-sector-reuse-framework-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-authority-evidence', 'postal-mapping-reuse-rights', 'administrative-geodata-reuse-rights', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
