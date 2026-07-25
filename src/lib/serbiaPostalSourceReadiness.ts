export const SERBIA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-serbia-postal-source-readiness-v0.1';

export type SerbiaPostalSourceReadinessSource = {
  sourceId: 'serbia-ratel-universal-postal-service' | 'serbia-posta-proper-addressing-and-pak-locator' | 'serbia-open-data-portal-reuse-license' | 'serbia-rgz-administrative-units-register' | 'serbia-rgz-address-register-exclusion' | 'rs-current-postcode-format-mapping-rights-coverage-and-correction-required';
  scope: 'postal-regulator-and-operator-reference' | 'postal-addressing-and-pak-locator-reference' | 'open-data-reuse-governance-reference' | 'administrative-units-register-reference' | 'address-register-exclusion-reference' | 'current-postcode-format-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'terms-not-verified' | 'source-contains-excluded-fields';
  rawRecordsBundled: false;
};

export type SerbiaPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type SerbiaPostalSourceReadiness = {
  schemaId: typeof SERBIA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'RS';
  countryName: 'Serbia';
  evaluatedAt: string;
  postalFormat: { nationalPattern: null; formatAuthorityEvidence: false; unverifiedFormatInferenceRejected: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: SerbiaPostalSourceReadinessSource[];
  gates: SerbiaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type SerbiaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type SerbiaPostalSourceIngestionPlan = {
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
const UNSAFE_SOURCE_FIELD = /(^|_)(address|street|house|building|premise|recipient|phone|email|office|unit|number|opening_hours|work_time|latitude|longitude|coordinate|geometry|property|parcel|cadastral|postal_address_code|pak)(_|$)/;

export function validateSerbiaPostalSourceIngestionPlan(plan: SerbiaPostalSourceIngestionPlan): string[] {
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

export function buildSerbiaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): SerbiaPostalSourceReadiness {
  return {
    schemaId: SERBIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'RS',
    countryName: 'Serbia',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: null, formatAuthorityEvidence: false, unverifiedFormatInferenceRejected: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'serbia-ratel-universal-postal-service', scope: 'postal-regulator-and-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'RATEL universal-postal-service page retrieved 2026-07-23', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'serbia-posta-proper-addressing-and-pak-locator', scope: 'postal-addressing-and-pak-locator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'Pošta Srbije addressing and PAK locator pages retrieved 2026-07-23', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'source-contains-excluded-fields', rawRecordsBundled: false },
      { sourceId: 'serbia-open-data-portal-reuse-license', scope: 'open-data-reuse-governance-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'Serbian Open Data Portal terms retrieved 2026-07-23', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'serbia-rgz-administrative-units-register', scope: 'administrative-units-register-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'RGZ Administrative Units Register page retrieved 2026-07-23; resource-level reuse terms not recorded', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'terms-not-verified', rawRecordsBundled: false },
      { sourceId: 'serbia-rgz-address-register-exclusion', scope: 'address-register-exclusion-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'RGZ Address Register page retrieved 2026-07-23', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'source-contains-excluded-fields', rawRecordsBundled: false },
      { sourceId: 'rs-current-postcode-format-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-format-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-regulator-and-operator-recorded', label: 'The national postal regulator and universal-service context are recorded as metadata only', status: 'passed', evidence: ['serbia-ratel-universal-postal-service', 'postalMappingEvidence=false', 'no carrier operational data retained'], blocksRealPostalLookup: false },
      { id: 'addressing-and-pak-service-bounded', label: 'The operator addressing and PAK lookup surface is recorded without querying or retaining address-level results', status: 'passed', evidence: ['serbia-posta-proper-addressing-and-pak-locator', 'source-contains-excluded-fields', 'postalMappingEvidence=false', 'no lookup request sent'], blocksRealPostalLookup: false },
      { id: 'administrative-authority-and-reuse-framework-recorded', label: 'The open-data reuse framework and administrative register authority are recorded without acquiring data entries', status: 'passed', evidence: ['serbia-open-data-portal-reuse-license', 'serbia-rgz-administrative-units-register', 'serbia-rgz-address-register-exclusion', 'rawRecordsBundled=false'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires a safe schema, rights, current version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'address, PAK, office, contact, cadastral, coordinate, and geometry fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'A current official format definition authorizes a national postcode pattern claim', status: 'blocked', evidence: ['Posta Srbije addressing pages distinguish postal number and PAK but do not supply an independently verified national format definition', 'unverifiedFormatInferenceRejected=true', 'nationalPattern=null'], blocksRealPostalLookup: true },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit reuse terms suitable for a safe offline artifact', status: 'blocked', evidence: ['PAK locator is address-input based and was not queried', 'no current postcode mapping artifact acquired', 'postalMappingEvidence=false'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-rights-and-safe-schema', label: 'Administrative geographic keys have explicit resource-level reuse terms and a safe non-geometry schema', status: 'blocked', evidence: ['RGZ register includes geospatial data', 'resource-level terms for a key-only artifact not recorded', 'Address Register contains excluded street, house, parcel, and address-code fields', 'no key-only extract acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been schema-checked and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode or PAK rows acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and authority correction path', status: 'blocked', evidence: ['mapping-version-not-recorded', 'no mapping update cadence recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current authority-published national postcode format and postcode-only or safe administrative-key mapping artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, version, attribution wording, and coverage.', 'Do not query the PAK locator or use its address-level results. Before ingestion, accept only safe postcode and administrative-zone identifiers, reject address, street, number, postal-address-code, PAK, postal-unit, office, contact, precise-point, geometry, parcel, property, and cadastral fields, and verify that the publication is current.', 'Record the authority correction path, update cadence, and coverage validation before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode or PAK lookup.', 'This pack does not infer a Serbian national postcode pattern from the recorded addressing or PAK service.', 'This pack does not query, download, store, or redistribute PAK results, postcode mappings, administrative-register entries, Address Register records, addresses, offices, contacts, properties, parcels, boundaries, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateSerbiaPostalSourceReadiness(readiness: SerbiaPostalSourceReadiness): SerbiaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== SERBIA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'RS' || readiness.countryName !== 'Serbia') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== null || readiness.postalFormat.formatAuthorityEvidence !== false || readiness.postalFormat.unverifiedFormatInferenceRejected !== true) errors.push('postal-format-evidence-mismatch');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['serbia-ratel-universal-postal-service', 'serbia-posta-proper-addressing-and-pak-locator', 'serbia-open-data-portal-reuse-license', 'serbia-rgz-administrative-units-register', 'serbia-rgz-address-register-exclusion', 'rs-current-postcode-format-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-regulator-and-operator-recorded', 'addressing-and-pak-service-bounded', 'administrative-authority-and-reuse-framework-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-authority-evidence', 'postal-mapping-reuse-rights', 'administrative-geodata-rights-and-safe-schema', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
