export const PARAGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-paraguay-postal-source-readiness-v0.1';

export type ParaguayPostalSourceReadinessSource = {
  sourceId: 'dinacopa-postcode-format-guidance' | 'dinacopa-postcode-open-data-catalog' | 'dinacopa-postcode-data-dictionary' | 'ine-paraguay-admin-cartography' | 'py-current-postcode-mapping-coverage-and-correction-required';
  scope: 'official-postcode-format-guidance' | 'official-open-data-postcode-catalog' | 'official-postcode-schema-dictionary' | 'official-administrative-cartography' | 'current-postcode-mapping-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  schemaEvidence: boolean;
  redistributionStatus: 'metadata-only' | 'licensed-metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'external-dictionary-acquired';
  rawSnapshotSha256: string | null;
  rawSnapshotBytes: number | null;
  rawRecordsBundled: false;
};

export type ParaguayPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type ParaguayPostalSourceReadiness = {
  schemaId: typeof PARAGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'PY';
  countryName: 'Paraguay';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{6}$'; formatAuthorityEvidence: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: ParaguayPostalSourceReadinessSource[];
  gates: ParaguayPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type ParaguayPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type ParaguayPostalSourceSchemaInspection = { columns: string[]; rawSnapshotStorage: 'external-nonpublic'; rawSnapshotSha256: string; rawSnapshotBytes: number };
const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';
const PARAGUAY_POSTCODE_DICTIONARY_SHA256 = 'AC8D2303AEC3309D02BAC672D8DC789EA868B7D58159C11F0951362F6DEA588D';
const PARAGUAY_POSTCODE_DICTIONARY_BYTES = 12261;

export function validateParaguayPostalSourceSchemaInspection(inspection: ParaguayPostalSourceSchemaInspection): string[] {
  const errors: string[] = [];
  const columns = new Set(inspection.columns.map(column => column.trim().toLowerCase()));
  for (const column of ['dpto', 'distrito', 'barloc', 'div_post', 'cod_post']) if (!columns.has(column)) errors.push(`required-column-missing:${column}`);
  for (const column of columns) if (/(address|street|via|number|house|lat|lon|geometry|coordinate)/.test(column)) errors.push(`unsafe-column:${column}`);
  if (inspection.rawSnapshotStorage !== 'external-nonpublic') errors.push('raw-snapshot-storage-not-external');
  if (!/^[A-F0-9]{64}$/.test(inspection.rawSnapshotSha256)) errors.push('raw-snapshot-sha256-invalid');
  if (!Number.isInteger(inspection.rawSnapshotBytes) || inspection.rawSnapshotBytes <= 0) errors.push('raw-snapshot-bytes-invalid');
  return errors;
}

export function buildParaguayPostalSourceReadiness(input: { evaluatedAt?: string } = {}): ParaguayPostalSourceReadiness {
  return {
    schemaId: PARAGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'PY',
    countryName: 'Paraguay',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{6}$', formatAuthorityEvidence: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'dinacopa-postcode-format-guidance', scope: 'official-postcode-format-guidance', authorityStatus: 'recorded', postalMappingEvidence: false, schemaEvidence: false, redistributionStatus: 'metadata-only', version: 'published 2023-08', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawSnapshotSha256: null, rawSnapshotBytes: null, rawRecordsBundled: false },
      { sourceId: 'dinacopa-postcode-open-data-catalog', scope: 'official-open-data-postcode-catalog', authorityStatus: 'recorded', postalMappingEvidence: false, schemaEvidence: false, redistributionStatus: 'licensed-metadata-only', version: 'metadata modified 2023-08-11; resources modified 2023-04-03', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawSnapshotSha256: null, rawSnapshotBytes: null, rawRecordsBundled: false },
      { sourceId: 'dinacopa-postcode-data-dictionary', scope: 'official-postcode-schema-dictionary', authorityStatus: 'recorded', postalMappingEvidence: false, schemaEvidence: true, redistributionStatus: 'licensed-metadata-only', version: 'resource modified 2023-04-03', retrievedAt: '2026-07-23T08:06:46.2757296Z', updateCadence: 'unknown', rawAcquisitionStatus: 'external-dictionary-acquired', rawSnapshotSha256: PARAGUAY_POSTCODE_DICTIONARY_SHA256, rawSnapshotBytes: PARAGUAY_POSTCODE_DICTIONARY_BYTES, rawRecordsBundled: false },
      { sourceId: 'ine-paraguay-admin-cartography', scope: 'official-administrative-cartography', authorityStatus: 'recorded', postalMappingEvidence: false, schemaEvidence: false, redistributionStatus: 'licensed-metadata-only', version: 'digital cartography 2012', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawSnapshotSha256: null, rawSnapshotBytes: null, rawRecordsBundled: false },
      { sourceId: 'py-current-postcode-mapping-coverage-and-correction-required', scope: 'current-postcode-mapping-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, schemaEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawSnapshotSha256: null, rawSnapshotBytes: null, rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'DINACOPA documents a six-digit postcode format for offline validation only', status: 'passed', evidence: ['dinacopa-postcode-format-guidance', 'nationalPattern=^[0-9]{6}$', 'formatAuthorityEvidence=true'], blocksRealPostalLookup: false },
      { id: 'open-data-reuse-terms-recorded', label: 'DINACOPA postcode data catalog and INE cartography record the Paraguayan Government Public Information Use License', status: 'passed', evidence: ['dinacopa-postcode-open-data-catalog', 'ine-paraguay-admin-cartography', 'license=Licencia de Uso de la Información Pública del Gobierno Paraguayo', 'attribution-and-update-date-required'], blocksRealPostalLookup: false },
      { id: 'source-schema-inspection-isolated', label: 'The official data dictionary is externally snapshotted and schema-checked without importing raw source records', status: 'passed', evidence: ['dinacopa-postcode-data-dictionary', `sha256=${PARAGUAY_POSTCODE_DICTIONARY_SHA256}`, `bytes=${PARAGUAY_POSTCODE_DICTIONARY_BYTES}`, 'rawRecordsBundled=false'], blocksRealPostalLookup: false },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current postcode mapping has been separately acquired, row-validated, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'dictionary schema inspection is not mapping-row validation', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, retrieval record, update cadence, and correction path', status: 'blocked', evidence: ['catalog resources modified 2023-04-03', 'py-current-postcode-mapping-coverage-and-correction-required version=null', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Acquire the licensed DINACOPA mapping table through the catalog resource, retain the raw snapshot outside public packs, and record its hash, resource URL, and retrieval time.', 'Validate mapping rows and national coverage using only safe administrative and postal-zone identifiers; reject addresses, recipients, buildings, streets, precise points, and query logs.', 'Record the current publication version, update cadence, attribution wording, and a DINACOPA correction path before any lookup release.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert a postcode-to-household, building, street, point, or address match.', 'This pack does not assert that the 2023 catalog resource is current or nationally complete.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateParaguayPostalSourceReadiness(readiness: ParaguayPostalSourceReadiness): ParaguayPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== PARAGUAY_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'PY' || readiness.countryName !== 'Paraguay') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{6}$' || readiness.postalFormat.formatAuthorityEvidence !== true) errors.push('postal-format-evidence-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['dinacopa-postcode-format-guidance', 'dinacopa-postcode-open-data-catalog', 'dinacopa-postcode-data-dictionary', 'ine-paraguay-admin-cartography', 'py-current-postcode-mapping-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  const dictionary = readiness.sources.find(source => source.sourceId === 'dinacopa-postcode-data-dictionary');
  if (!dictionary || dictionary.schemaEvidence !== true || dictionary.rawAcquisitionStatus !== 'external-dictionary-acquired' || dictionary.rawSnapshotSha256 !== PARAGUAY_POSTCODE_DICTIONARY_SHA256 || dictionary.rawSnapshotBytes !== PARAGUAY_POSTCODE_DICTIONARY_BYTES) errors.push('dictionary-snapshot-receipt-invalid');
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-format-authority-evidence', 'open-data-reuse-terms-recorded', 'source-schema-inspection-isolated']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
