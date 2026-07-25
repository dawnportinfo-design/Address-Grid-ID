export const ALBANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-albania-postal-source-readiness-v0.1';

export type AlbaniaPostalSourceReadinessSource = {
  sourceId: 'albania-akep-universal-postal-service-authorization-2025' | 'albania-asig-geoportal-terms' | 'albania-asig-administrative-boundary-metadata' | 'albania-instat-administrative-divisions-classification' | 'al-current-postcode-format-mapping-rights-coverage-and-correction-required';
  scope: 'postal-regulator-and-operator-reference' | 'geospatial-reuse-terms-reference' | 'administrative-boundary-metadata-reference' | 'administrative-classification-reference' | 'current-postcode-format-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'terms-restrict-commercial-reuse' | 'geometry-excluded' | 'terms-not-verified';
  rawRecordsBundled: false;
};

export type AlbaniaPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type AlbaniaPostalSourceReadiness = {
  schemaId: typeof ALBANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'AL';
  countryName: 'Albania';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false; unverifiedFormatInferenceRejected: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: AlbaniaPostalSourceReadinessSource[];
  gates: AlbaniaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type AlbaniaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type AlbaniaPostalSourceIngestionPlan = {
  rawSnapshotStorage: 'external-nonpublic';
  rawRecordsBundled: false;
  allowMappingIngestion: boolean;
  mappingReuseTermsVerified: boolean;
  mappingVersion: string | null;
  mappingCurrent: boolean;
  coverageEvidenceRecorded: boolean;
  correctionPathRecorded: boolean;
  proposedColumns: string[];
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';
const UNSAFE_SOURCE_FIELD = /(^|_)(address|street|house|building|premise|recipient|phone|email|office|unit|number|opening_hours|work_time|latitude|longitude|coordinate|geometry|property|parcel|cadastral)(_|$)/;

export function validateAlbaniaPostalSourceIngestionPlan(plan: AlbaniaPostalSourceIngestionPlan): string[] {
  const errors: string[] = [];
  if (plan.rawSnapshotStorage !== 'external-nonpublic') errors.push('raw-snapshot-storage-not-external');
  if (plan.rawRecordsBundled !== false) errors.push('raw-records-must-not-be-bundled');
  for (const column of plan.proposedColumns.map(column => column.trim().toLowerCase())) if (UNSAFE_SOURCE_FIELD.test(column)) errors.push(`unsafe-column:${column}`);
  if (plan.allowMappingIngestion && !plan.mappingReuseTermsVerified) errors.push('mapping-reuse-terms-not-verified');
  if (plan.allowMappingIngestion && !plan.mappingVersion) errors.push('mapping-version-not-recorded');
  if (plan.allowMappingIngestion && !plan.mappingCurrent) errors.push('mapping-not-current');
  if (plan.allowMappingIngestion && !plan.coverageEvidenceRecorded) errors.push('mapping-coverage-not-recorded');
  if (plan.allowMappingIngestion && !plan.correctionPathRecorded) errors.push('mapping-correction-path-not-recorded');
  return errors;
}

export function buildAlbaniaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): AlbaniaPostalSourceReadiness {
  return {
    schemaId: ALBANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'AL',
    countryName: 'Albania',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false, unverifiedFormatInferenceRejected: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'albania-akep-universal-postal-service-authorization-2025', scope: 'postal-regulator-and-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'AKEP Decision 17; five-year authorization starting 2025-07-07', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'albania-asig-geoportal-terms', scope: 'geospatial-reuse-terms-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'National Geoportal terms; non-profit and non-commercial use only', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'terms-restrict-commercial-reuse', rawRecordsBundled: false },
      { sourceId: 'albania-asig-administrative-boundary-metadata', scope: 'administrative-boundary-metadata-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'administrative-territorial boundaries updated map; DCM 360 dated 2019-05-29', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'geometry-excluded', rawRecordsBundled: false },
      { sourceId: 'albania-instat-administrative-divisions-classification', scope: 'administrative-classification-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'INSTAT administrative-divisions classification; version identifier 3488', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'terms-not-verified', rawRecordsBundled: false },
      { sourceId: 'al-current-postcode-format-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-format-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-regulator-and-operator-recorded', label: 'The postal regulator and current universal-service operator authorization are recorded as metadata only', status: 'passed', evidence: ['albania-akep-universal-postal-service-authorization-2025', 'postalMappingEvidence=false', 'no carrier operational data retained'], blocksRealPostalLookup: false },
      { id: 'administrative-sources-and-terms-recorded', label: 'Official administrative classification and geospatial terms are recorded without acquiring restricted data', status: 'passed', evidence: ['albania-asig-geoportal-terms', 'albania-asig-administrative-boundary-metadata', 'albania-instat-administrative-divisions-classification', 'rawRecordsBundled=false'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires a safe schema, rights, current version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'address, office, contact, cadastral, coordinate, and geometry fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'A current official format definition authorizes a national postcode pattern claim', status: 'blocked', evidence: ['no current official national format definition acquired', 'unverifiedFormatInferenceRejected=true', 'nationalPattern=null'], blocksRealPostalLookup: true },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit reuse terms suitable for a safe offline artifact', status: 'blocked', evidence: ['no current mapping artifact acquired', 'ASIG terms restrict general use to non-profit and non-commercial purposes', 'postalMappingEvidence=false'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-rights-and-safe-schema', label: 'Administrative geographic keys have explicit resource-level reuse terms and a safe non-geometry schema', status: 'blocked', evidence: ['ASIG boundary artifact is geospatial and geometry is excluded', 'INSTAT classification reuse terms not verified', 'no key-only extract acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been schema-checked and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode rows acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and authority correction path', status: 'blocked', evidence: ['mapping-version-not-recorded', 'no postal mapping update cadence recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current authority-published postcode format and postcode-only or safe administrative-key mapping artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, version, attribution wording, and coverage.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers, reject address, street, number, postal-unit, office, contact, precise-point, geometry, parcel, property, and cadastral fields, and verify that the publication is current.', 'Record the authority correction path, update cadence, and coverage validation before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not infer an Albanian national postcode pattern from scattered examples or administrative sources.', 'This pack does not download, store, or redistribute postcode mappings, ASIG administrative boundaries, INSTAT classification values, addresses, offices, contacts, properties, parcels, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateAlbaniaPostalSourceReadiness(readiness: AlbaniaPostalSourceReadiness): AlbaniaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== ALBANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'AL' || readiness.countryName !== 'Albania') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false || readiness.postalFormat.unverifiedFormatInferenceRejected !== true) errors.push('postal-format-evidence-mismatch');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['albania-akep-universal-postal-service-authorization-2025', 'albania-asig-geoportal-terms', 'albania-asig-administrative-boundary-metadata', 'albania-instat-administrative-divisions-classification', 'al-current-postcode-format-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-regulator-and-operator-recorded', 'administrative-sources-and-terms-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-authority-evidence', 'postal-mapping-reuse-rights', 'administrative-geodata-rights-and-safe-schema', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
