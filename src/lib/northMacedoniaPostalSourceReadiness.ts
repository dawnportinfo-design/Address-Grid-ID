export const NORTH_MACEDONIA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-north-macedonia-postal-source-readiness-v0.1';

export type NorthMacedoniaPostalSourceReadinessSource = {
  sourceId: 'north-macedonia-postal-agency-universal-service-provider' | 'north-macedonia-post-office-location-search' | 'north-macedonia-makstat-territorial-units' | 'north-macedonia-cadastre-admin-boundary-and-address-catalog' | 'mk-current-postcode-format-mapping-rights-coverage-and-correction-required';
  scope: 'postal-regulator-and-operator-reference' | 'official-postal-office-search-surface' | 'attributed-statistical-administrative-summary' | 'administrative-boundary-and-address-catalog' | 'current-postcode-format-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'source-contains-excluded-fields' | 'terms-not-verified';
  rawRecordsBundled: false;
};

export type NorthMacedoniaPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type NorthMacedoniaPostalSourceReadiness = {
  schemaId: typeof NORTH_MACEDONIA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'MK';
  countryName: 'North Macedonia';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false; unverifiedFormatInferenceRejected: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: NorthMacedoniaPostalSourceReadinessSource[];
  gates: NorthMacedoniaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type NorthMacedoniaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type NorthMacedoniaPostalSourceIngestionPlan = {
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
const UNSAFE_SOURCE_FIELD = /(^|_)(address|street|house|building|premise|recipient|phone|email|work_time|working_hours|latitude|longitude|coordinate|geometry|property|parcel|cadastral)(_|$)/;

export function validateNorthMacedoniaPostalSourceIngestionPlan(plan: NorthMacedoniaPostalSourceIngestionPlan): string[] {
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

export function buildNorthMacedoniaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): NorthMacedoniaPostalSourceReadiness {
  return {
    schemaId: NORTH_MACEDONIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'MK',
    countryName: 'North Macedonia',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false, unverifiedFormatInferenceRejected: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'north-macedonia-postal-agency-universal-service-provider', scope: 'postal-regulator-and-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'Postal Agency publication dated 2022-02-02', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'north-macedonia-post-office-location-search', scope: 'official-postal-office-search-surface', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; publication version not recorded', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'source-contains-excluded-fields', rawRecordsBundled: false },
      { sourceId: 'north-macedonia-makstat-territorial-units', scope: 'attributed-statistical-administrative-summary', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'table PD093M16; latest update 2023-06-02', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'north-macedonia-cadastre-admin-boundary-and-address-catalog', scope: 'administrative-boundary-and-address-catalog', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; dataset release version and reuse terms not recorded', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'terms-not-verified', rawRecordsBundled: false },
      { sourceId: 'mk-current-postcode-format-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-format-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-regulator-and-operator-recorded', label: 'The Postal Agency and national universal-service operator are recorded as authority metadata only', status: 'passed', evidence: ['north-macedonia-postal-agency-universal-service-provider', 'operator reference is not a postcode mapping', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'attributed-statistical-territorial-summary-recorded', label: 'The State Statistical Office territorial-units summary records free reuse with mandatory source attribution', status: 'passed', evidence: ['north-macedonia-makstat-territorial-units', 'free of charge with source attribution', 'aggregate statistical summary is not a postcode mapping'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires a safe schema, rights, version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'address, office, contact, parcel, coordinate, and geometry fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'An authority-published national postcode format is recorded independently of an office search surface', status: 'blocked', evidence: ['nationalPattern=null', 'formatAuthorityEvidence=false', 'unverifiedFormatInferenceRejected=true', 'Post office search is not queried'], blocksRealPostalLookup: true },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit, verified reuse terms', status: 'blocked', evidence: ['no safe postcode-only mapping license or terms recorded', 'postal office search is not a bulk redistribution grant', 'mk-current-postcode-format-mapping-rights-coverage-and-correction-required unresolved'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-rights-and-safe-schema', label: 'Administrative keys or boundaries have explicit reusable terms and a schema independent of street, house, parcel, and location fields', status: 'blocked', evidence: ['cadastre catalog includes street and house-number products', 'cadastre release terms and safe source schema are not verified', 'no administrative records or geometries acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no search results, postcode rows, or geographic records acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['office-search publication version not recorded', 'no current mapping version recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current Postal Agency or authority-designated postcode-only artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, and attribution wording.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers and reject office address, street, house, building, recipient, telephone, work-time, precise-point, geometry, parcel, property, and query-result fields.', 'Record mapping coverage, current version, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not query, store, or redistribute North Macedonia Post office-search results.', 'This pack does not assert a national North Macedonia postal-code regex.', 'This pack does not download, store, or redistribute postal office, postcode, address, contact, property, parcel, boundary, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateNorthMacedoniaPostalSourceReadiness(readiness: NorthMacedoniaPostalSourceReadiness): NorthMacedoniaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== NORTH_MACEDONIA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'MK' || readiness.countryName !== 'North Macedonia') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false || readiness.postalFormat.unverifiedFormatInferenceRejected !== true) errors.push('postal-format-not-safely-unresolved');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['north-macedonia-postal-agency-universal-service-provider', 'north-macedonia-post-office-location-search', 'north-macedonia-makstat-territorial-units', 'north-macedonia-cadastre-admin-boundary-and-address-catalog', 'mk-current-postcode-format-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-regulator-and-operator-recorded', 'attributed-statistical-territorial-summary-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-authority-evidence', 'postal-mapping-reuse-rights', 'administrative-geodata-rights-and-safe-schema', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
