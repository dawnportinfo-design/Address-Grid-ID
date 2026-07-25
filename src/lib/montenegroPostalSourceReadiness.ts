export const MONTENEGRO_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-montenegro-postal-source-readiness-v0.1';

export type MontenegroPostalSourceReadinessSource = {
  sourceId: 'montenegro-ekip-universal-postal-operator' | 'montenegro-posta-crne-gore-addressing-rules-2020' | 'montenegro-data-gov-municipalities-catalog' | 'montenegro-monstat-municipalities-classification' | 'me-current-postcode-format-mapping-rights-coverage-and-correction-required';
  scope: 'postal-regulator-and-operator-reference' | 'official-postcode-format-and-addressing-rule' | 'administrative-key-open-data-catalog-reference' | 'official-administrative-classification-reference' | 'current-postcode-format-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'terms-not-verified' | 'copyright-restricted';
  rawRecordsBundled: false;
};

export type MontenegroPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type MontenegroPostalSourceReadiness = {
  schemaId: typeof MONTENEGRO_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'ME';
  countryName: 'Montenegro';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{5}$'; formatAuthorityEvidence: true; sourceFreshness: 'operator-addressing-rule-published-2020-current-applicability-not-verified' };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: MontenegroPostalSourceReadinessSource[];
  gates: MontenegroPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type MontenegroPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type MontenegroPostalSourceIngestionPlan = {
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

export function validateMontenegroPostalSourceIngestionPlan(plan: MontenegroPostalSourceIngestionPlan): string[] {
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

export function buildMontenegroPostalSourceReadiness(input: { evaluatedAt?: string } = {}): MontenegroPostalSourceReadiness {
  return {
    schemaId: MONTENEGRO_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'ME',
    countryName: 'Montenegro',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{5}$', formatAuthorityEvidence: true, sourceFreshness: 'operator-addressing-rule-published-2020-current-applicability-not-verified' },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'montenegro-ekip-universal-postal-operator', scope: 'postal-regulator-and-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'special license 01-1 dated 2007-02-15; regulator page retrieved 2026-07-23', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'montenegro-posta-crne-gore-addressing-rules-2020', scope: 'official-postcode-format-and-addressing-rule', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'operator special-conditions rule published 2020-06-10; current applicability not verified', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'montenegro-data-gov-municipalities-catalog', scope: 'administrative-key-open-data-catalog-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'municipalities catalog last updated 2024-11-19; resource page reports no license provided', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'terms-not-verified', rawRecordsBundled: false },
      { sourceId: 'montenegro-monstat-municipalities-classification', scope: 'official-administrative-classification-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'List of municipalities 2022; MONSTAT copyright notice 2025', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'copyright-restricted', rawRecordsBundled: false },
      { sourceId: 'me-current-postcode-format-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-format-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-regulator-and-operator-recorded', label: 'The regulator and national universal postal operator are recorded as metadata only', status: 'passed', evidence: ['montenegro-ekip-universal-postal-operator', 'special-license reference recorded', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'national-postcode-format-authority-recorded', label: 'The national five-digit postal format is recorded from the operator addressing rule', status: 'passed', evidence: ['montenegro-posta-crne-gore-addressing-rules-2020', 'nationalPattern=^[0-9]{5}$', 'format evidence is not a current mapping artifact'], blocksRealPostalLookup: false },
      { id: 'administrative-key-catalogs-recorded', label: 'Official municipality catalog and classification authorities are recorded without acquiring entries', status: 'passed', evidence: ['montenegro-data-gov-municipalities-catalog', 'montenegro-monstat-municipalities-classification', 'rawRecordsBundled=false'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and requires a safe schema, rights, current version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'address, office, contact, cadastral, coordinate, and geometry fields rejected', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-format-currentness', label: 'The operator addressing rule has current-applicability evidence for operational use', status: 'blocked', evidence: ['operator format rule published 2020-06-10', 'current applicability not verified', 'sourceFreshness=operator-addressing-rule-published-2020-current-applicability-not-verified'], blocksRealPostalLookup: true },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit reuse terms suitable for a safe offline artifact', status: 'blocked', evidence: ['no current mapping artifact acquired', 'operator rule is not a mapping redistribution grant', 'postalMappingEvidence=false'], blocksRealPostalLookup: true },
      { id: 'administrative-geodata-rights-and-safe-schema', label: 'Administrative geographic keys have explicit resource-level reuse terms and a safe non-geometry schema', status: 'blocked', evidence: ['data.gov municipalities resource reports no license provided', 'MONSTAT classification has copyright notice', 'no key-only artifact acquired'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been schema-checked and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no postcode rows acquired', 'coverage-not-validated'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and authority correction path', status: 'blocked', evidence: ['mapping-version-not-recorded', 'no mapping update cadence recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain current regulator- or operator-confirmed applicability of the five-digit format and a postcode-only or safe administrative-key mapping artifact with explicit reuse terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, version, attribution wording, and coverage.', 'Before ingestion, accept only safe postcode and administrative-zone identifiers, reject address, street, number, postal-unit, office, contact, precise-point, geometry, parcel, property, and cadastral fields, and verify that the publication is current.', 'Record mapping coverage, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not treat the 2020 operator addressing rule as proof of current operational applicability.', 'This pack does not download, store, or redistribute postcode mappings, municipality lists, classification entries, addresses, offices, contacts, properties, parcels, boundaries, or location records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateMontenegroPostalSourceReadiness(readiness: MontenegroPostalSourceReadiness): MontenegroPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== MONTENEGRO_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'ME' || readiness.countryName !== 'Montenegro') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{5}$' || readiness.postalFormat.formatAuthorityEvidence !== true || readiness.postalFormat.sourceFreshness !== 'operator-addressing-rule-published-2020-current-applicability-not-verified') errors.push('postal-format-evidence-mismatch');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['montenegro-ekip-universal-postal-operator', 'montenegro-posta-crne-gore-addressing-rules-2020', 'montenegro-data-gov-municipalities-catalog', 'montenegro-monstat-municipalities-classification', 'me-current-postcode-format-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-regulator-and-operator-recorded', 'national-postcode-format-authority-recorded', 'administrative-key-catalogs-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-format-currentness', 'postal-mapping-reuse-rights', 'administrative-geodata-rights-and-safe-schema', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
