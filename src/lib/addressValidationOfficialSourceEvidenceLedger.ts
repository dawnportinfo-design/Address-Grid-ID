export const ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION = 'address-validation-official-source-evidence-ledger-v1';
export const OFFICIAL_SOURCE_EVIDENCE_RENEWAL_LEAD_DAYS = 14;

export type AddressValidationQualityOfficialSourceEvidence = {
  sourceId: string;
  sourceVersion: string;
  sourceUrl: string;
  retrievedAt: string;
  validUntil: string;
  rightsUrl: string;
  correctionUrl: string;
  correctionPathEvidenceUrls?: string[];
  correctionPathEvidenceNotes?: string[];
};

export type AddressValidationOfficialSourceEvidenceLedger = {
  version: string;
  countryCode: string;
  records: AddressValidationQualityOfficialSourceEvidence[];
};

export type AddressValidationOfficialSourceEvidenceStatus = 'current' | 'renewal-due' | 'expired-or-invalid';

export type AddressValidationOfficialSourceEvidenceLedgerAssessment = {
  countryCode: string;
  status: 'current' | 'renewal-due' | 'blocked';
  records: Array<{
    sourceId: string;
    sourceVersion: string;
    status: AddressValidationOfficialSourceEvidenceStatus;
    validUntil: string;
    blockers: string[];
  }>;
  blockers: string[];
  nextActions: string[];
};

function normalizeCountryCode(value: string) {
  const code = value.normalize('NFKC').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return code === 'UK' ? 'GB' : code;
}

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function assessAddressValidationOfficialSourceEvidence(
  source: AddressValidationQualityOfficialSourceEvidence | undefined,
  checkedAt: string,
): AddressValidationOfficialSourceEvidenceStatus {
  return sourceEvidenceBlockers(source, checkedAt).length
    ? 'expired-or-invalid'
    : sourceEvidenceWithinRenewalWindow(source, checkedAt)
      ? 'renewal-due'
      : 'current';
}

function sourceEvidenceBlockers(
  source: AddressValidationQualityOfficialSourceEvidence | undefined,
  checkedAt: string,
) {
  const sourceRetrievedAt = parseTimestamp(source?.retrievedAt || '');
  const sourceValidUntil = parseTimestamp(source?.validUntil || '');
  const checkedTimestamp = parseTimestamp(checkedAt);
  return [
    !source?.sourceId.trim() ? 'source-id-missing' : null,
    !source?.sourceVersion.trim() ? 'source-version-missing' : null,
    !isHttpUrl(source?.sourceUrl || '') ? 'source-url-missing-or-invalid' : null,
    !isHttpUrl(source?.rightsUrl || '') ? 'rights-url-missing-or-invalid' : null,
    !isHttpUrl(source?.correctionUrl || '') ? 'correction-url-missing-or-invalid' : null,
    sourceRetrievedAt === null || checkedTimestamp === null || sourceRetrievedAt > checkedTimestamp
      ? 'retrieval-time-invalid-or-future'
      : null,
    sourceValidUntil === null || checkedTimestamp === null || sourceValidUntil <= checkedTimestamp
      ? 'source-evidence-expired-or-invalid'
      : null,
  ].filter(Boolean) as string[];
}

function sourceEvidenceWithinRenewalWindow(
  source: AddressValidationQualityOfficialSourceEvidence | undefined,
  checkedAt: string,
) {
  const sourceValidUntil = parseTimestamp(source?.validUntil || '');
  const checkedTimestamp = parseTimestamp(checkedAt);
  return sourceValidUntil !== null && checkedTimestamp !== null &&
    sourceValidUntil - checkedTimestamp <= OFFICIAL_SOURCE_EVIDENCE_RENEWAL_LEAD_DAYS * 24 * 60 * 60 * 1000;
}

export function assessAddressValidationOfficialSourceEvidenceLedger(
  ledger: AddressValidationOfficialSourceEvidenceLedger,
  checkedAt: string,
): AddressValidationOfficialSourceEvidenceLedgerAssessment {
  const countryCode = normalizeCountryCode(ledger.countryCode);
  const records = ledger.records.map(record => {
    const blockers = sourceEvidenceBlockers(record, checkedAt);
    return {
      sourceId: record.sourceId,
      sourceVersion: record.sourceVersion,
      status: blockers.length
        ? 'expired-or-invalid' as const
        : sourceEvidenceWithinRenewalWindow(record, checkedAt)
          ? 'renewal-due' as const
          : 'current' as const,
      validUntil: record.validUntil,
      blockers,
    };
  });
  const duplicateSource = new Set(records.map(record => record.sourceId)).size !== records.length;
  const blockers = [
    ledger.version !== ADDRESS_VALIDATION_OFFICIAL_SOURCE_EVIDENCE_LEDGER_VERSION ? 'unsupported-source-evidence-ledger-version' : null,
    !countryCode ? 'country-code-missing' : null,
    !records.length ? 'official-source-evidence-missing' : null,
    duplicateSource ? 'duplicate-official-source-id' : null,
    records.some(record => record.status === 'expired-or-invalid') ? 'official-source-evidence-expired-or-invalid' : null,
  ].filter(Boolean) as string[];
  const renewalDue = !blockers.length && records.some(record => record.status === 'renewal-due');

  return {
    countryCode,
    status: blockers.length ? 'blocked' : renewalDue ? 'renewal-due' : 'current',
    records,
    blockers,
    nextActions: blockers.length
      ? ['refresh-or-correct-official-source-evidence-before-quality-report-publication']
      : renewalDue
        ? ['refresh-official-source-evidence-before-the-recorded-expiry']
        : ['reassess-source-evidence-on-the-next-scheduled-review'],
  };
}
