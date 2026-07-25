export type CountryLocalMetadataReadiness = {
  countryCode?: string;
  containsPersonalData?: boolean;
  containsRawThirdPartyData?: boolean;
  realPostalLookupEnabled?: boolean;
  deliveryClaimEnabled?: boolean;
  sources?: Array<{
    authorityStatus?: string;
    postalMappingEvidence?: boolean;
    redistributionStatus?: string;
    version?: string | null;
    retrievedAt?: string | null;
    documentation?: {
      sourceUrl?: string;
      termsUrl?: string;
      correctionUrl?: string;
      correctionPathStatus?: string;
      reuseStatus?: string;
      verifiedAt?: string;
    };
  }>;
};

export type CountryLocalMetadataEvidenceStatus =
  | 'not-safe-or-not-recorded'
  | 'metadata-recorded'
  | 'metadata-reuse-verified';

export const LOCAL_METADATA_EVIDENCE_REVIEW_MAX_AGE_DAYS = 90;
export const LOCAL_METADATA_EVIDENCE_RETRIEVAL_MAX_AGE_DAYS = 90;

function isHttpUrl(value: string | undefined) {
  try {
    const url = new URL(value || '');
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function hasTraceableVersion(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return Boolean(normalized) && !['unknown', 'n/a', 'na', 'none', 'unversioned'].includes(normalized);
}

function hasTimezoneQualifiedTimestamp(value: string | null | undefined) {
  return Boolean(value) && /T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && Number.isFinite(Date.parse(value));
}

export function assessCountryLocalMetadataEvidence(
  readiness: CountryLocalMetadataReadiness,
  checkedAt: string,
): CountryLocalMetadataEvidenceStatus {
  const checkedTimestamp = Date.parse(checkedAt);
  const hasMetadataOnlyRecordedSource = readiness.sources?.some(source =>
    source.authorityStatus === 'recorded' && source.postalMappingEvidence === false &&
    source.redistributionStatus === 'metadata-only') || false;
  const safeMetadataOnlyReadiness = Boolean(readiness.countryCode) &&
    readiness.containsPersonalData === false &&
    readiness.containsRawThirdPartyData === false &&
    readiness.realPostalLookupEnabled === false &&
    readiness.deliveryClaimEnabled === false &&
    hasMetadataOnlyRecordedSource;
  if (!safeMetadataOnlyReadiness) return 'not-safe-or-not-recorded';

  const hasVerifiedLifecycleDocumentation = readiness.sources?.some(source => {
    const documentation = source.documentation;
    const retrievedAt = Date.parse(source.retrievedAt || '');
    const verifiedAt = Date.parse(documentation?.verifiedAt || '');
    return source.authorityStatus === 'recorded' &&
      source.postalMappingEvidence === false &&
      source.redistributionStatus === 'metadata-only' &&
      documentation?.reuseStatus === 'metadata-only-verified' &&
      hasTraceableVersion(source.version) &&
      isHttpUrl(documentation.sourceUrl) &&
      isHttpUrl(documentation.termsUrl) &&
      isHttpUrl(documentation.correctionUrl) &&
      documentation.correctionPathStatus === 'source-specific-confirmed' &&
      hasTimezoneQualifiedTimestamp(checkedAt) &&
      hasTimezoneQualifiedTimestamp(source.retrievedAt) &&
      hasTimezoneQualifiedTimestamp(documentation.verifiedAt) &&
      Number.isFinite(checkedTimestamp) &&
      Number.isFinite(retrievedAt) && retrievedAt <= checkedTimestamp &&
      checkedTimestamp - retrievedAt <= LOCAL_METADATA_EVIDENCE_RETRIEVAL_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 &&
      Number.isFinite(verifiedAt) && verifiedAt <= checkedTimestamp &&
      verifiedAt >= retrievedAt &&
      checkedTimestamp - verifiedAt <= LOCAL_METADATA_EVIDENCE_REVIEW_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  }) || false;
  return hasVerifiedLifecycleDocumentation ? 'metadata-reuse-verified' : 'metadata-recorded';
}
