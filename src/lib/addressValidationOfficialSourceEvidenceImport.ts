import {
  ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
  OFFICIAL_SOURCE_EVIDENCE_RENEWAL_LEAD_DAYS,
  type AddressValidationOfficialSourceEvidenceLedger,
} from './addressValidationOfficialSourceEvidenceLedger';
import {
  OFFICIAL_POSTAL_SOURCE_REUSE_LEDGER_VERSION,
  assessOfficialPostalSourceReuseLedgerRecord,
  type OfficialPostalSourceReuseLedger,
  type OfficialPostalSourceReuseLedgerRecord,
} from './officialPostalSourceReuseLedger';
import {
  buildAddressValidationQualityReport,
  type AddressValidationQualityReport,
} from './addressValidationQualityReport';
import type { AddressValidationCommercialParityInput } from './addressVerificationBenchmark';

export const ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_IMPORT_VERSION =
  'address-validation-official-source-evidence-import-v1';

export type AddressValidationOfficialSourceEvidenceImport = {
  version: string;
  checkedAt: string;
  ledgers: AddressValidationOfficialSourceEvidenceLedger[];
  countryReadiness: Array<{
    countryCode: string;
    priority: 'blocking' | 'normal';
    status: 'metadata-only-source-ready' | 'source-approval-pending';
    approvedSourceIds: string[];
    excludedSourceIds: string[];
    nextAction: string;
  }>;
  skippedSourceIds: string[];
  nonClaim: string;
};

function approvedForQualityEvidence(record: OfficialPostalSourceReuseLedgerRecord, checkedAt: string) {
  const checkedTimestamp = Date.parse(checkedAt);
  const reviewTimestamp = Date.parse(record.reviewBy);
  const renewalLeadMs = OFFICIAL_SOURCE_EVIDENCE_RENEWAL_LEAD_DAYS * 24 * 60 * 60 * 1000;
  return record.status === 'metadata-only-approved' &&
    assessOfficialPostalSourceReuseLedgerRecord(record, checkedAt).status === 'metadata-only-approved' &&
    record.reuseStatus === 'conditional-open-reuse' &&
    record.allowedUse === 'non-delivery-postal-metadata-only' &&
    Number.isFinite(checkedTimestamp) &&
    Number.isFinite(reviewTimestamp) &&
    reviewTimestamp - checkedTimestamp > renewalLeadMs;
}

function normalizeCountryCode(value: string) {
  const code = value.normalize('NFKC').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return code === 'UK' ? 'GB' : code;
}

export function buildAddressValidationOfficialSourceEvidenceImport(
  reuseLedger: OfficialPostalSourceReuseLedger,
  checkedAt: string,
): AddressValidationOfficialSourceEvidenceImport {
  const eligible = reuseLedger.version === OFFICIAL_POSTAL_SOURCE_REUSE_LEDGER_VERSION
    ? reuseLedger.records.filter(record => approvedForQualityEvidence(record, checkedAt))
    : [];
  const eligibleSourceIds = new Set(eligible.map(record => record.sourceId));
  const countryRecords = new Map<string, AddressValidationOfficialSourceEvidenceLedger['records']>();
  const countrySources = new Map<string, Array<{ sourceId: string; approved: boolean }>>();

  for (const source of reuseLedger.records) {
    for (const countryCode of source.countryCodes) {
      const sources = countrySources.get(countryCode) || [];
      sources.push({ sourceId: source.sourceId, approved: eligibleSourceIds.has(source.sourceId) });
      countrySources.set(countryCode, sources);
    }
  }

  for (const source of eligible) {
    for (const countryCode of source.countryCodes) {
      const records = countryRecords.get(countryCode) || [];
      records.push({
        sourceId: source.sourceId,
        sourceVersion: source.sourceVersion,
        sourceUrl: source.sourceUrl,
        retrievedAt: source.retrievedAt,
        validUntil: source.reviewBy,
        rightsUrl: source.termsUrl,
        correctionUrl: source.correctionUrl,
        correctionPathEvidenceUrls: source.correctionPathEvidenceUrls,
        correctionPathEvidenceNotes: source.correctionPathEvidenceNotes,
      });
      countryRecords.set(countryCode, records);
    }
  }

  return {
    version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_IMPORT_VERSION,
    checkedAt,
    ledgers: [...countryRecords.entries()].map(([countryCode, records]) => ({
      version: ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION,
      countryCode,
      records: records.sort((left, right) => left.sourceId.localeCompare(right.sourceId)),
    })).sort((left, right) => left.countryCode.localeCompare(right.countryCode)),
    countryReadiness: [...countrySources.entries()].map(([countryCode, sources]) => {
      const approvedSourceIds = [...new Set(sources.filter(source => source.approved).map(source => source.sourceId))].sort();
      const excludedSourceIds = [...new Set(sources.filter(source => !source.approved).map(source => source.sourceId))].sort();
      const sourceReady = approvedSourceIds.length > 0;
      return {
        countryCode,
        priority: sourceReady ? 'normal' as const : 'blocking' as const,
        status: sourceReady ? 'metadata-only-source-ready' as const : 'source-approval-pending' as const,
        approvedSourceIds,
        excludedSourceIds,
        nextAction: sourceReady
          ? 'run-a-scope-bound-synthetic-holdout-before-any-postal-lookup-or-delivery-claim'
          : 'record-an-official-source-with-explicit-reuse-rights-version-freshness-and-correction-evidence',
      };
    }).sort((left, right) => left.countryCode.localeCompare(right.countryCode)),
    skippedSourceIds: reuseLedger.records
      .map(record => record.sourceId)
      .filter(sourceId => !eligibleSourceIds.has(sourceId))
      .sort(),
    nonClaim: 'This import carries reviewed public source metadata only. It does not import source payloads, permit postcode lookup, establish coverage, or authorize delivery-point validation.',
  };
}

export function buildAddressValidationQualityReportFromOfficialSourceEvidenceImport(
  input: AddressValidationCommercialParityInput,
  imported: AddressValidationOfficialSourceEvidenceImport,
): AddressValidationQualityReport {
  const countryCode = normalizeCountryCode(input.countryCode);
  const ledger = imported.ledgers.find(candidate => candidate.countryCode === countryCode);
  const evidence = ledger?.records.length === 1 ? ledger.records[0] : undefined;
  return buildAddressValidationQualityReport({
    ...input,
    officialEvidence: {
      ...input.officialEvidence,
      // Imported records are explicitly metadata-only and cannot support lookup or delivery assertions.
      postal: false,
      deliveryPoint: false,
    },
  }, evidence, ledger);
}
