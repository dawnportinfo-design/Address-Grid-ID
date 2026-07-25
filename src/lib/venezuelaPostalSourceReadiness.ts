export const VENEZUELA_POSTAL_SOURCE_READINESS_SCHEMA_ID = 'agid-venezuela-postal-source-readiness-v0.1';

export type VenezuelaPostalSourceReadinessSource = {
  sourceId: 'upu-venezuela-addressing-unit-2019' | 'upu-venezuela-designated-operator' | 'salb-venezuela-authority-and-availability' | 've-current-postcode-mapping-rights-coverage-and-correction-required';
  scope: 'upu-postcode-format-reference' | 'upu-designated-postal-operator-reference' | 'administrative-geodata-authority-and-availability' | 'current-postcode-mapping-rights-coverage-and-correction-evidence';
  authorityStatus: 'recorded' | 'unresolved';
  postalMappingEvidence: false;
  redistributionStatus: 'metadata-only' | 'not-bundled';
  version: string | null;
  retrievedAt: string | null;
  updateCadence: 'unknown' | 'provider-released';
  rawAcquisitionStatus: 'not-attempted' | 'not-available';
  rawRecordsBundled: false;
};

export type VenezuelaPostalSourceReadinessGate = { id: string; label: string; status: 'passed' | 'blocked'; evidence: string[]; blocksRealPostalLookup: boolean };

export type VenezuelaPostalSourceReadiness = {
  schemaId: typeof VENEZUELA_POSTAL_SOURCE_READINESS_SCHEMA_ID;
  countryCode: 'VE';
  countryName: 'Venezuela';
  evaluatedAt: string;
  postalFormat: { nationalPattern: '^[0-9]{4}$'; formatAuthorityEvidence: true };
  publicationStatus: 'draft';
  containsPersonalData: false;
  containsRawThirdPartyData: false;
  realPostalLookupEnabled: false;
  deliveryClaimEnabled: false;
  sources: VenezuelaPostalSourceReadinessSource[];
  gates: VenezuelaPostalSourceReadinessGate[];
  nextRequiredEvidence: string[];
  nonClaims: string[];
};

export type VenezuelaPostalSourceReadinessValidation = { valid: boolean; errors: string[] };
export type VenezuelaPostalSourceIngestionPlan = {
  rawSnapshotStorage: 'external-nonpublic';
  rawRecordsBundled: false;
  allowMappingIngestion: boolean;
  mappingReuseTermsVerified: boolean;
  mappingVersion: string | null;
  coverageEvidenceRecorded: boolean;
  correctionPathRecorded: boolean;
};

const DEFAULT_EVALUATED_AT = '2026-07-23T00:00:00.000Z';

export function validateVenezuelaPostalSourceIngestionPlan(plan: VenezuelaPostalSourceIngestionPlan): string[] {
  const errors: string[] = [];
  if (plan.rawSnapshotStorage !== 'external-nonpublic') errors.push('raw-snapshot-storage-not-external');
  if (plan.rawRecordsBundled !== false) errors.push('raw-records-must-not-be-bundled');
  if (plan.allowMappingIngestion && !plan.mappingReuseTermsVerified) errors.push('mapping-reuse-terms-not-verified');
  if (plan.allowMappingIngestion && !plan.mappingVersion) errors.push('mapping-version-not-recorded');
  if (plan.allowMappingIngestion && !plan.coverageEvidenceRecorded) errors.push('mapping-coverage-not-recorded');
  if (plan.allowMappingIngestion && !plan.correctionPathRecorded) errors.push('mapping-correction-path-not-recorded');
  return errors;
}

export function buildVenezuelaPostalSourceReadiness(input: { evaluatedAt?: string } = {}): VenezuelaPostalSourceReadiness {
  return {
    schemaId: VENEZUELA_POSTAL_SOURCE_READINESS_SCHEMA_ID,
    countryCode: 'VE',
    countryName: 'Venezuela',
    evaluatedAt: input.evaluatedAt || DEFAULT_EVALUATED_AT,
    postalFormat: { nationalPattern: '^[0-9]{4}$', formatAuthorityEvidence: true },
    publicationStatus: 'draft',
    containsPersonalData: false,
    containsRawThirdPartyData: false,
    realPostalLookupEnabled: false,
    deliveryClaimEnabled: false,
    sources: [
      { sourceId: 'upu-venezuela-addressing-unit-2019', scope: 'upu-postcode-format-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'UPU addressing unit reference dated 2019-05', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'upu-venezuela-designated-operator', scope: 'upu-designated-postal-operator-reference', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; publication version not recorded', retrievedAt: '2026-07-23', updateCadence: 'provider-released', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
      { sourceId: 'salb-venezuela-authority-and-availability', scope: 'administrative-geodata-authority-and-availability', authorityStatus: 'recorded', postalMappingEvidence: false, redistributionStatus: 'metadata-only', version: 'retrieved 2026-07-23; no geospatial dataset available', retrievedAt: '2026-07-23', updateCadence: 'unknown', rawAcquisitionStatus: 'not-available', rawRecordsBundled: false },
      { sourceId: 've-current-postcode-mapping-rights-coverage-and-correction-required', scope: 'current-postcode-mapping-rights-coverage-and-correction-evidence', authorityStatus: 'unresolved', postalMappingEvidence: false, redistributionStatus: 'not-bundled', version: null, retrievedAt: null, updateCadence: 'unknown', rawAcquisitionStatus: 'not-attempted', rawRecordsBundled: false },
    ],
    gates: [
      { id: 'no-personal-or-raw-third-party-data', label: 'The published pack remains metadata and synthetic fixtures only', status: 'passed', evidence: ['containsPersonalData=false', 'containsRawThirdPartyData=false', 'rawRecordsBundled=false for every source'], blocksRealPostalLookup: false },
      { id: 'postal-format-authority-evidence', label: 'The IPOSTEL-submitted UPU addressing reference records a four-digit postcode syntax for offline validation only', status: 'passed', evidence: ['upu-venezuela-addressing-unit-2019', 'nationalPattern=^[0-9]{4}$', 'formatAuthorityEvidence=true', 'reference dated 2019-05'], blocksRealPostalLookup: false },
      { id: 'designated-operator-recorded', label: 'UPU records IPOSTEL as Venezuela’s designated postal operator', status: 'passed', evidence: ['upu-venezuela-designated-operator', 'operator=IPOSTEL', 'postalMappingEvidence=false'], blocksRealPostalLookup: false },
      { id: 'source-acquisition-plan-fails-closed', label: 'Any future mapping snapshot remains external and cannot be ingested without rights, version, coverage, and correction evidence', status: 'passed', evidence: ['rawSnapshotStorage=external-nonpublic', 'rawRecordsBundled=false', 'allowMappingIngestion=false until all mapping gates are evidenced'], blocksRealPostalLookup: false },
      { id: 'postal-mapping-reuse-rights', label: 'A current official postcode mapping has explicit, verified reuse terms', status: 'blocked', evidence: ['UPU format reference carries no bulk mapping reuse grant', 'no official mapping license or terms recorded', 've-current-postcode-mapping-rights-coverage-and-correction-required unresolved'], blocksRealPostalLookup: true },
      { id: 'postal-code-mapping-and-coverage-evidence', label: 'A current official postcode mapping has been acquired, schema-checked, and coverage-validated for offline reuse', status: 'blocked', evidence: ['postalMappingEvidence=false for every source', 'no mapping rows, postal zones, or address-query results acquired', 'SALB Venezuela page reports no geospatial datasets available'], blocksRealPostalLookup: true },
      { id: 'version-freshness-and-correction-path', label: 'The mapping has a current version, update cadence, and correction path', status: 'blocked', evidence: ['format reference dated 2019-05', 'no current mapping version recorded', 'correction-path-not-recorded'], blocksRealPostalLookup: true },
    ],
    nextRequiredEvidence: ['Obtain a current IPOSTEL or authority-designated mapping artifact with an explicit reuse license or terms; retain any raw snapshot outside public packs and record its hash, URL, retrieval time, and attribution wording.', 'Before ingestion, reject recipient, residential, building, street, precise-point, and query-result fields; validate only safe postcode and administrative-zone identifiers.', 'Record mapping coverage, current version, update cadence, and an authority correction path before enabling any real lookup or delivery claim.'],
    nonClaims: ['This pack does not provide a real postcode lookup.', 'This pack does not assert that the four-digit format reference from 2019 is a current mapping or a complete current delivery specification.', 'This pack does not download, store, or redistribute IPOSTEL, UPU, SALB, address-query, or postal-mapping records.', 'This pack does not assert a household, building, street, point, or address-to-postcode match.', 'This pack does not assert delivery-point or carrier deliverability coverage.'],
  };
}

export function validateVenezuelaPostalSourceReadiness(readiness: VenezuelaPostalSourceReadiness): VenezuelaPostalSourceReadinessValidation {
  const errors: string[] = [];
  const sourceIds = new Set<string>(readiness.sources.map(source => source.sourceId));
  const gateById = new Map(readiness.gates.map(gate => [gate.id, gate]));
  if (readiness.schemaId !== VENEZUELA_POSTAL_SOURCE_READINESS_SCHEMA_ID) errors.push('schema-id-mismatch');
  if (readiness.countryCode !== 'VE' || readiness.countryName !== 'Venezuela') errors.push('country-mismatch');
  if (readiness.postalFormat.nationalPattern !== '^[0-9]{4}$' || readiness.postalFormat.formatAuthorityEvidence !== true) errors.push('postal-format-evidence-missing');
  if (readiness.publicationStatus !== 'draft') errors.push('publication-status-not-draft');
  if (readiness.containsPersonalData !== false) errors.push('personal-data-not-false');
  if (readiness.containsRawThirdPartyData !== false) errors.push('raw-third-party-data-not-false');
  if (readiness.realPostalLookupEnabled !== false) errors.push('real-postal-lookup-enabled');
  if (readiness.deliveryClaimEnabled !== false) errors.push('delivery-claim-enabled');
  for (const sourceId of ['upu-venezuela-addressing-unit-2019', 'upu-venezuela-designated-operator', 'salb-venezuela-authority-and-availability', 've-current-postcode-mapping-rights-coverage-and-correction-required']) if (!sourceIds.has(sourceId)) errors.push(`source-missing:${sourceId}`);
  for (const source of readiness.sources) {
    if (source.postalMappingEvidence !== false) errors.push(`postal-mapping-evidence-not-false:${source.sourceId}`);
    if (source.rawRecordsBundled !== false) errors.push(`raw-records-bundled:${source.sourceId}`);
  }
  for (const gateId of ['postal-format-authority-evidence', 'designated-operator-recorded', 'source-acquisition-plan-fails-closed']) if (gateById.get(gateId)?.status !== 'passed') errors.push(`required-passed-gate-missing:${gateId}`);
  for (const gateId of ['postal-mapping-reuse-rights', 'postal-code-mapping-and-coverage-evidence', 'version-freshness-and-correction-path']) {
    const gate = gateById.get(gateId);
    if (!gate || gate.status !== 'blocked' || gate.blocksRealPostalLookup !== true) errors.push(`required-blocked-gate-missing:${gateId}`);
  }
  return { valid: errors.length === 0, errors };
}
