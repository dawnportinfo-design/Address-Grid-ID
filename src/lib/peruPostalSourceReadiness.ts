export const PERU_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-peru-postal-source-readiness-v0.1';

export type PeruPostalSourceReadinessSource = {
  sourceId: 'mtc-peru-national-postcode-guidance' | 'mtc-peru-postal-statistics-2022' | 'mtc-peru-postcode-open-data' | 'pe-current-postcode-mapping-required';
  scope: 'official-national-postcode-guidance' | 'official-postal-statistics-reference' | 'official-open-data-postcode-catalog' | 'current-postcode-mapping-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'licensed-metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'blocked-http-403';
  rawRecordsBundled: false;
  documentation?: {
    sourceUrl: string;
    termsUrl: string;
    correctionUrl: string;
    correctionPathStatus: 'general-contact-only';
    reuseStatus: 'metadata-only-verified';
    verifiedAt: string;
  };
};

export type PeruPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type PeruPostalSourceReadiness = {
  schemaId: typeof PERU_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'PE';
  countryName: 'Peru';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{5}$'; formatAuthorityEvidence: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: PeruPostalSourceReadinessSource[];
  gates: PeruPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type PeruPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function buildPeruPostalSourceReadiness(input: { evaluatedAt?: string } = {}): PeruPostalSourceReadiness {
  return {
    schemaId: PERU_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'PE',
    countryName: 'Peru',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{5}$', formatAuthorityEvidence: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'mtc-peru-national-postcode-guidance', scope: 'official-national-postcode-guidance', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'last changed 2024-01-14', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'mtc-peru-postal-statistics-2022', scope: 'official-postal-statistics-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: '2022', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      {
        sourceId: 'mtc-peru-postcode-open-data',
        scope: 'official-open-data-postcode-catalog',
        authorityStatus: 'recorded',
        postalMappingEvidence: false,
        redistributionStatus: 'licensed-metadata-only',
        version: 'released and modified 2018-03-23',
        retrievedAt: '2026-07-23',
        updateCadence: 'unknown',
        rawAcquisitionStatus: 'blocked-http-403',
        rawRecordsBundled: false,
        documentation: {
          sourceUrl: 'https://www.datosabiertos.gob.pe/dataset/mtc-codigo-postal-peru',
          termsUrl: 'https://www.datosabiertos.gob.pe/dataset/mtc-codigo-postal-peru',
          correctionUrl: 'https://www.datosabiertos.gob.pe/datos-abiertos-0',
          correctionPathStatus: 'general-contact-only',
          reuseStatus: 'metadata-only-verified',
          verifiedAt: '2026-07-24T00:00:00.000Z',
        },
      },
      { sourceId: 'pe-current-postcode-mapping-required', scope: 'current-postcode-mapping-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'The MTC states a five-digit national postcode format for offline validation only', status: 'passed', evidence: ['mtc-peru-national-postcode-guidance', 'nationalPattern=^[0-9]{5}$', 'formatAuthorityEvidence=true'], blocksRealPostalLookup: false },
      { id: 'official-postcode-system-recorded', label: 'MTC national postcode guidance and statistical scope are cataloged as metadata only', status: 'passed', evidence: ['mtc-peru-national-postcode-guidance', 'mtc-peru-postal-statistics-2022', 'postalMappingEvidence=false for both sources'], blocksRealPostalLookup: false },
      { id: 'open-data-reuse-terms-recorded', label: 'The MTC postcode dataset catalog records public access and the Open Data Commons Attribution License', status: 'passed', evidence: ['mtc-peru-postcode-open-data', 'publicAccessLevel=Public', 'license=Open Data Commons Attribution License', 'attribution-required'], blocksRealPostalLookup: false },
      { id: 'open-data-general-contact-recorded', label: 'The public-data platform general contact route is recorded without treating it as a dataset-specific correction path', status: 'passed', evidence: ['https://www.datosabiertos.gob.pe/datos-abiertos-0', 'correctionPathStatus=general-contact-only', 'does-not-satisfy-postal-mapping-correction-path'], blocksRealPostalLookup: false },
      { id: 'raw-source-acquisition-isolated', label: 'Raw-source acquisition is kept outside public packs and fails closed when automated retrieval is rejected', status: 'passed', evidence: ['mtc-peru-postcode-open-data rawAcquisitionStatus=blocked-http-403', 'rawRecordsBundled=false', 'no derived mapping emitted'], blocksRealPostalLookup: false },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['mtc-peru-postcode-open-data rawAcquisitionStatus=blocked-http-403', 'postalMappingEvidence=false for every source', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, retrieval record, update cadence, and correction path', status: 'blocked', evidence: ['mtc-peru-postcode-open-data version=released and modified 2018-03-23', 'pe-current-postcode-mapping-required version=null', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain the explicitly licensed MTC workbook through an authority-supported access path, keep the raw snapshot outside public packs, and record its hash and retrieval time.', 'Schema-check the workbook for postcode-to-locality fields while rejecting residential, building, street, recipient, and precise-coordinate records.', 'Validate current national coverage, publication/version date, update cadence, attribution wording, and an MTC correction path before any lookup release.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert that the 2018 catalog is current or complete.', 'This pack does not store or infer a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validatePeruPostalSourceReadiness(readiness: PeruPostalSourceReadiness): PeruPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== PERU_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'PE' || readiness.countryName !== 'Peru') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{5}$' || readiness.postalFormat.formatAuthorityEvidence !== true) errors.push('postal-format-evidence-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['mtc-peru-national-postcode-guidance', 'mtc-peru-postal-statistics-2022', 'mtc-peru-postcode-open-data', 'pe-current-postcode-mapping-required'] as const) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  const openDataSource = readiness.sources.find(source => source.sourceId === 'mtc-peru-postcode-open-data');
  if (!openDataSource?.documentation || openDataSource.documentation.reuseStatus !== 'metadata-only-verified' ||
    !openDataSource.documentation.sourceUrl.startsWith('https://www.datosabiertos.gob.pe/') ||
    openDataSource.documentation.correctionUrl !== 'https://www.datosabiertos.gob.pe/datos-abiertos-0' ||
    openDataSource.documentation.correctionPathStatus !== 'general-contact-only') {
    errors.push('mtc-open-data-metadata-reuse-documentation-missing');
  }
  for (const gateId of ['postal-format-authority-evidence', 'open-data-reuse-terms-recorded', 'open-data-general-contact-recorded', 'raw-source-acquisition-isolated']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
