import {
  POSTAL_SOURCE_SCOPE_LEDGER,
  assessPostalSourceScopeLedgerEntry,
  type PostalSourceReuseStatus,
} from './postalSourceScopeLedger';

export const OFFICIAL_POSTAL_SOURCE_REUSE_LEDGER_VERSION = 'official-postal-source-reuse-ledger-v1';
export const POSTAL_SOURCE_REUSE_RENEWAL_LEAD_DAYS = 14;
export const POSTAL_SOURCE_REUSE_RETRIEVAL_MAX_AGE_DAYS = 90;

export type OfficialPostalSourceReuseLedgerRecord = {
  sourceId: string;
  countryCodes: string[];
  scopeIds: string[];
  sourceUrl: string;
  termsUrl: string;
  correctionUrl: string;
  correctionPathEvidenceUrls: string[];
  correctionPathEvidenceNotes: string[];
  sourceVersion: string;
  retrievedAt: string;
  reviewBy: string;
  reuseStatus: PostalSourceReuseStatus;
  allowedUse: 'non-delivery-postal-metadata-only' | 'none-without-separate-license-or-permission';
  scopeBlockers: string[];
  status: 'metadata-only-approved' | 'metadata-only-renewal-due' | 'terms-or-license-pending' | 'not-approved';
  limitations: string[];
};

export type OfficialPostalSourceReuseLedger = {
  version: string;
  checkedAt: string;
  records: OfficialPostalSourceReuseLedgerRecord[];
  summary: {
    sourceCount: number;
    metadataOnlyApprovedCount: number;
    metadataOnlyRenewalDueCount: number;
    termsOrLicensePendingCount: number;
    notApprovedCount: number;
  };
  nonClaim: string;
};

export type OfficialPostalSourceReuseLedgerRecordAssessment = {
  status: OfficialPostalSourceReuseLedgerRecord['status'];
  blockers: string[];
};

function parseTimestamp(value: string) {
  if (!/T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function hasTraceableVersion(value: string) {
  const normalized = value.trim().toLowerCase();
  return Boolean(normalized) && !['unknown', 'n/a', 'na', 'none', 'unversioned'].includes(normalized);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function assessOfficialPostalSourceReuseLedgerRecord(
  source: OfficialPostalSourceReuseLedgerRecord,
  checkedAt: string,
) : OfficialPostalSourceReuseLedgerRecordAssessment {
  const reviewBy = parseTimestamp(source.reviewBy);
  const retrievedAt = parseTimestamp(source.retrievedAt);
  const checkedTimestamp = parseTimestamp(checkedAt);
  const reviewExpired = reviewBy === null || checkedTimestamp === null || reviewBy <= checkedTimestamp;
  const renewalDue = reviewBy !== null && checkedTimestamp !== null && !reviewExpired &&
    reviewBy - checkedTimestamp <= POSTAL_SOURCE_REUSE_RENEWAL_LEAD_DAYS * 24 * 60 * 60 * 1000;
  const recordBlockers = [
    !source.sourceId.trim() ? 'source-id-missing' : null,
    !hasTraceableVersion(source.sourceVersion) ? 'source-version-missing-or-untraceable' : null,
    !isHttpUrl(source.sourceUrl) ? 'source-url-missing-or-invalid' : null,
    !isHttpUrl(source.termsUrl) ? 'terms-url-missing-or-invalid' : null,
    !isHttpUrl(source.correctionUrl) ? 'correction-url-missing-or-invalid' : null,
    !source.correctionPathEvidenceUrls.length ? 'correction-path-evidence-missing' : null,
    source.correctionPathEvidenceUrls.some(url => !isHttpUrl(url)) ? 'correction-path-evidence-url-invalid' : null,
    !source.correctionPathEvidenceNotes.some(note => Boolean(note.trim())) ? 'correction-path-evidence-note-missing' : null,
    retrievedAt === null || checkedTimestamp === null || retrievedAt > checkedTimestamp
      ? 'retrieval-time-invalid-or-future'
      : null,
    retrievedAt !== null && checkedTimestamp !== null &&
      checkedTimestamp - retrievedAt > POSTAL_SOURCE_REUSE_RETRIEVAL_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
      ? 'retrieval-time-stale'
      : null,
    reviewExpired ? 'review-expired-or-invalid' : null,
    ...source.scopeBlockers.map(blocker => `scope-${blocker}`),
  ].filter(Boolean) as string[];
  if (source.reuseStatus === 'conditional-open-reuse' &&
    source.allowedUse === 'non-delivery-postal-metadata-only' && !recordBlockers.length) {
    return {
      status: renewalDue ? 'metadata-only-renewal-due' : 'metadata-only-approved',
      blockers: [],
    };
  }
  if (source.reuseStatus === 'conditional-open-reuse' &&
    source.allowedUse === 'non-delivery-postal-metadata-only') {
    return { status: 'not-approved', blockers: recordBlockers };
  }
  if (source.reuseStatus === 'terms-review-required' || source.reuseStatus === 'licensed-restricted') {
    return { status: 'terms-or-license-pending', blockers: recordBlockers };
  }
  return { status: 'not-approved', blockers: recordBlockers };
}

export function buildOfficialPostalSourceReuseLedger(checkedAt: string): OfficialPostalSourceReuseLedger {
  const grouped = new Map<string, OfficialPostalSourceReuseLedgerRecord>();
  for (const scope of POSTAL_SOURCE_SCOPE_LEDGER) {
    const scopeAssessment = assessPostalSourceScopeLedgerEntry(scope, checkedAt);
    for (const source of scope.sources) {
      const key = [
        source.sourceId,
        source.sourceVersion,
        source.sourceUrl,
        source.termsUrl,
        source.correctionUrl,
        source.reviewBy,
        source.reuseStatus,
        source.allowedUse,
      ].join('|');
      const existing = grouped.get(key);
      const record = existing || {
        sourceId: source.sourceId,
        countryCodes: [],
        scopeIds: [],
        sourceUrl: source.sourceUrl,
        termsUrl: source.termsUrl,
        correctionUrl: source.correctionUrl,
        correctionPathEvidenceUrls: [],
        correctionPathEvidenceNotes: [],
        sourceVersion: source.sourceVersion,
        retrievedAt: source.retrievedAt,
        reviewBy: source.reviewBy,
        reuseStatus: source.reuseStatus,
        allowedUse: source.allowedUse,
        scopeBlockers: [],
        status: 'not-approved' as const,
        limitations: [],
      };
      record.countryCodes.push(scope.countryCode);
      record.scopeIds.push(scope.scopeId);
      if (source.correctionPathEvidenceUrl) record.correctionPathEvidenceUrls.push(source.correctionPathEvidenceUrl);
      if (source.correctionPathEvidenceNote) record.correctionPathEvidenceNotes.push(source.correctionPathEvidenceNote);
      record.scopeBlockers.push(...scopeAssessment.blockers);
      record.limitations.push(...source.limitations, ...scopeAssessment.blockers);
      grouped.set(key, record);
    }
  }
  const records = [...grouped.values()].map(record => ({
    ...record,
    countryCodes: [...new Set(record.countryCodes)].sort(),
    scopeIds: [...new Set(record.scopeIds)].sort(),
    correctionPathEvidenceUrls: [...new Set(record.correctionPathEvidenceUrls)].sort(),
    correctionPathEvidenceNotes: [...new Set(record.correctionPathEvidenceNotes)].sort(),
    scopeBlockers: [...new Set(record.scopeBlockers)].sort(),
    limitations: [...new Set(record.limitations)].sort(),
    status: assessOfficialPostalSourceReuseLedgerRecord(record, checkedAt).status,
  })).sort((left, right) => left.sourceId.localeCompare(right.sourceId));
  const summary = {
    sourceCount: records.length,
    metadataOnlyApprovedCount: records.filter(record => record.status === 'metadata-only-approved').length,
    metadataOnlyRenewalDueCount: records.filter(record => record.status === 'metadata-only-renewal-due').length,
    termsOrLicensePendingCount: records.filter(record => record.status === 'terms-or-license-pending').length,
    notApprovedCount: records.filter(record => record.status === 'not-approved').length,
  };
  return {
    version: OFFICIAL_POSTAL_SOURCE_REUSE_LEDGER_VERSION,
    checkedAt,
    records,
    summary,
    nonClaim: 'This ledger records public source metadata and reviewed reuse boundaries only. Metadata-only approval is not permission to redistribute source records, run a public postcode lookup, infer completeness, validate a delivery point, or make territorial claims.',
  };
}
