export const URUGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-uruguay-postal-source-readiness-v0.1';

export type UruguayPostalSourceReadinessSource = {
  sourceId: 'correo-uruguayo-postcode-search-status' | 'correo-uruguayo-postcode-open-data-catalog' | 'ursec-postal-services-reference' | 'uy-current-postcode-mapping-coverage-and-correction-required';
  scope: 'official-postcode-service-status' | 'official-open-data-postcode-catalog' | 'official-postal-regulator-reference' | 'current-postcode-mapping-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'licensed-metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'one-off-publication' | 'provider-released' | 'unknown';
  rawAcquisitionStatus: 'not-attempted' | 'rejected-as-stale';
  rawRecordsBundled: false;
};

export type UruguayPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type UruguayPostalSourceReadiness = {
  schemaId: typeof URUGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'UY';
  countryName: 'Uruguay';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{5}$'; formatAuthorityEvidence: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: UruguayPostalSourceReadinessSource[];
  gates: UruguayPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type UruguayPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type UruguayPostalSourceIngestionPlan = {
  catalogResourceReleaseDate: '2023-08-16';
  operationalServiceUpdatedAt: '2026-05-04';
  rawSnapshotStorage: 'external-nonpublic';
  rawRecordsBundled: false;
  allowIngestion: boolean;
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function validateUruguayPostalSourceIngestionPlan(plan: UruguayPostalSourceIngestionPlan): string[] {
  const errors: string[] = [];
  if (plan.rawSnapshotStorage !== 'external-nonpublic') errors.push('raw-snapshot-storage-not-external');
  if (plan.rawRecordsBundled !== false) errors.push('raw-records-must-not-be-bundled');
  if (plan.catalogResourceReleaseDate < plan.operationalServiceUpdatedAt && plan.allowIngestion) errors.push('stale-resource-ingestion-not-allowed');
  return errors;
}

export function buildUruguayPostalSourceReadiness(input: { evaluatedAt?: string } = {}): UruguayPostalSourceReadiness {
  return {
    schemaId: URUGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'UY',
    countryName: 'Uruguay',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{5}$', formatAuthorityEvidence: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'correo-uruguayo-postcode-search-status', scope: 'official-postcode-service-status', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'service page last updated 2026-05-04', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'correo-uruguayo-postcode-open-data-catalog', scope: 'official-open-data-postcode-catalog', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'licensed-metadata-only', version: 'version 1.0; catalog last updated 2023-08-16', retrievedAt: '2026-07-23', updateCadence: 'one-off-publication', rawAcquisitionStatus: 'rejected-as-stale', rawRecordsBundled: false },
      { sourceId: 'ursec-postal-services-reference', scope: 'official-postal-regulator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: null, retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'uy-current-postcode-mapping-coverage-and-correction-required', scope: 'current-postcode-mapping-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'Correo Uruguayo and its official open-data catalog document a five-digit national postcode format for offline validation only', status: 'passed', evidence: ['correo-uruguayo-postcode-search-status', 'correo-uruguayo-postcode-open-data-catalog', 'nationalPattern=^[0-9]{5}$', 'formatAuthorityEvidence=true'], blocksRealPostalLookup: false },
      { id: 'open-data-reuse-terms-recorded', label: 'The official catalog assigns the Uruguay Open Data License and requires origin attribution', status: 'passed', evidence: ['correo-uruguayo-postcode-open-data-catalog', 'license=Licencia de Datos Abiertos - Uruguay', 'provider-and-dataset-attribution-required'], blocksRealPostalLookup: false },
      { id: 'stale-source-ingestion-fails-closed', label: 'A catalog resource older than the operational service is not acquired or imported', status: 'passed', evidence: ['catalogResourceReleaseDate=2023-08-16', 'operationalServiceUpdatedAt=2026-05-04', 'rawAcquisitionStatus=rejected-as-stale', 'rawSnapshotStorage=external-nonpublic when a future acquisition is authorized'], blocksRealPostalLookup: false },
      { id: 'catalog-currentness-conflict', label: 'The catalog resource is current enough for reproducible mapping ingestion', status: 'blocked', evidence: ['catalog last updated 2023-08-16', 'service page last updated 2026-05-04', 'catalog update cadence=one-off-publication', 'no current downloadable authoritative resource recorded'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no mapping rows or zone geometries acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, retrieval record, update cadence, and correction path', status: 'blocked', evidence: ['catalog resource is older than operational service status', 'uy-current-postcode-mapping-coverage-and-correction-required version=null', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current, authority-published postcode mapping or postal-zone resource whose version is no older than the operational service status; retain any raw snapshot outside public packs and record its hash, URL, and retrieval time.', 'Before ingestion, reject residential, building, street, recipient, precise-point, and query-result fields; validate only safe postcode and administrative-zone identifiers.', 'Record national coverage, update cadence, attribution wording, and an authority correction path before any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not query, store, or redistribute Correo Uruguayo service results.', 'This pack does not assert that the 2023 catalog resource is current, complete, or suitable for mapping ingestion.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateUruguayPostalSourceReadiness(readiness: UruguayPostalSourceReadiness): UruguayPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== URUGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'UY' || readiness.countryName !== 'Uruguay') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{5}$' || readiness.postalFormat.formatAuthorityEvidence !== true) errors.push('postal-format-evidence-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['correo-uruguayo-postcode-search-status', 'correo-uruguayo-postcode-open-data-catalog', 'ursec-postal-services-reference', 'uy-current-postcode-mapping-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-format-authority-evidence', 'open-data-reuse-terms-recorded', 'stale-source-ingestion-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['catalog-currentness-conflict', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
