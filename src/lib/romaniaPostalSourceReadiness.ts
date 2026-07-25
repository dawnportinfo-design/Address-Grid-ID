export const ROMANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-romania-postal-source-readiness-v0.1';

export type RomaniaPostalSourceReadinessSource = {
  sourceId: 'ancom-cnpr-universal-service-2025-2029' | 'data-gov-ro-romania-postal-codes-ogl-2016' | 'posta-romana-current-zip-code-search' | 'ancpi-administrative-boundaries-open-information-license' | 'ro-current-postcode-mapping-coverage-and-correction-required';
  scope: 'postal-regulator-and-operator-reference' | 'historical-postcode-format-and-license-catalog' | 'official-postal-code-search-surface' | 'current-administrative-boundaries-license-catalog' | 'current-postcode-mapping-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'historical-street-level-source' | 'search-results-not-acquired' | 'geometry-excluded';
  rawRecordsBundled: false;
};

export type RomaniaPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type RomaniaPostalSourceReadiness = {
  schemaId: typeof ROMANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'RO';
  countryName: 'Romania';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{6}$'; formatAuthorityEvidence: true; sourceFreshness: 'historical-format-evidence-only' };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: RomaniaPostalSourceReadinessSource[];
  gates: RomaniaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type RomaniaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type RomaniaPostalSourceIngestionPlan = {
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

export function validateRomaniaPostalSourceIngestionPlan(plan: RomaniaPostalSourceIngestionPlan): string[] {
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

export function buildRomaniaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): RomaniaPostalSourceReadiness {
  return {
    schemaId: ROMANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'RO',
    countryName: 'Romania',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{6}$', formatAuthorityEvidence: true, sourceFreshness: 'historical-format-evidence-only' },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'ancom-cnpr-universal-service-2025-2029', scope: 'postal-regulator-and-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'ANCOM Decision 810/2024 designation through 2029-12-31', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'data-gov-ro-romania-postal-codes-ogl-2016', scope: 'historical-postcode-format-and-license-catalog', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'last updated 2016-09-06; OGL-ROU-1.0', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'historical-street-level-source', rawRecordsBundled: false },
      { sourceId: 'posta-romana-current-zip-code-search', scope: 'official-postal-code-search-surface', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; publication version not recorded', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'search-results-not-acquired', rawRecordsBundled: false },
      { sourceId: 'ancpi-administrative-boundaries-open-information-license', scope: 'current-administrative-boundaries-license-catalog', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'administrative-boundaries application updated 2026-05-05', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'geometry-excluded', rawRecordsBundled: false },
      { sourceId: 'ro-current-postcode-mapping-coverage-and-correction-required', scope: 'current-postcode-mapping-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-regulator-and-operator-recorded', label: 'ANCOM and the current national universal-service provider are recorded as authority metadata only', status: 'passed', evidence: ['ancom-cnpr-universal-service-2025-2029', 'designation through 2029-12-31', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'national-postcode-format-authority-recorded', label: 'A government-open-data catalog records the numeric six-digit national format', status: 'passed', evidence: ['data-gov-ro-romania-postal-codes-ogl-2016', 'nationalPattern=^[0-9]{6}$', 'format evidence is historical only'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires a safe schema, rights, current version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'street, number, office, contact, parcel, coordinate, and geometry fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'current-postcode-mapping-freshness', label: 'The licensed postcode mapping is current enough for operational use', status: 'blocked', evidence: ['OGL catalog last updated 2016-09-06', 'historical-format-evidence-only', 'mappingCurrent=false'], blocksRealPostalLookup: true },
      { id: 'safe-current-postcode-mapping-schema', label: 'A current postcode mapping has a postcode-only or safe administrative-key schema independent of streets and numbers', status: 'blocked', evidence: ['historical catalog is detailed to street level', 'current search returns street and number fields', 'no safe current mapping extract acquired'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-safe-extract', label: 'Administrative keys have an approved non-geometry extract under explicit current reuse terms', status: 'blocked', evidence: ['ANCPI application records an open-information license for administrative boundaries', 'boundary geometry is excluded from this pack', 'no key-only administrative extract acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been schema-checked and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode rows or search results acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['current search publication version not recorded', 'no current mapping version recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current Posta Romana or authority-designated postcode-only artifact with explicit reuse terms and no street, number, office, contact, or location fields; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, and attribution wording.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers, reject street, number, address, postal-unit, contact, precise-point, geometry, parcel, property, and query-result fields, and verify that the published version is current.', 'Record mapping coverage, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not query, store, or redistribute Posta Romana search results.', 'This pack does not treat the 2016 OGL postal-code catalog as a current postcode mapping.', 'This pack does not download, store, or redistribute postcode, street, number, address, office, contact, property, parcel, boundary, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateRomaniaPostalSourceReadiness(readiness: RomaniaPostalSourceReadiness): RomaniaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== ROMANIA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'RO' || readiness.countryName !== 'Romania') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{6}$' || readiness.postalFormat.formatAuthorityEvidence !== true || readiness.postalFormat.sourceFreshness !== 'historical-format-evidence-only') errors.push('postal-format-evidence-mismatch');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['ancom-cnpr-universal-service-2025-2029', 'data-gov-ro-romania-postal-codes-ogl-2016', 'posta-romana-current-zip-code-search', 'ancpi-administrative-boundaries-open-information-license', 'ro-current-postcode-mapping-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-regulator-and-operator-recorded', 'national-postcode-format-authority-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['current-postcode-mapping-freshness', 'safe-current-postcode-mapping-schema', 'administrative-geodata-safe-extract', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
