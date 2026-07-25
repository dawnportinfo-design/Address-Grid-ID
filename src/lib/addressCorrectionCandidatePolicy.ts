import { classifyPostalSourceTrust } from './officialPostalSourceCatalog';

export const ADDRESS_CORRECTION_CANDIDATE_POLICY_VERSION = 'address-correction-candidate-policy-v1';

export type AddressCorrectionCandidateScope = 'administrative-area' | 'locality';

export type AddressCorrectionCandidateSource = {
  countryCode: string;
  sourceId: string;
  sourceVersion: string;
  validUntil: string;
  rightsUrl: string;
  correctionUrl: string;
  dictionaryDigest: string;
  aggregateEntryCount: number;
  scopes: readonly AddressCorrectionCandidateScope[];
};

export type AddressCorrectionCandidatePolicy = {
  version: string;
  countryCode: string;
  status: 'disabled' | 'locality-admin-suggestions-only';
  mode: 'suggestion-only-never-auto-apply';
  permittedScopes: readonly AddressCorrectionCandidateScope[];
  blockers: string[];
  nonClaim: string;
};

function normalizeCountryCode(value: string) {
  const code = value.normalize('NFKC').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return code === 'UK' ? 'GB' : code;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isSha256(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

export function assessAddressCorrectionCandidatePolicy(
  source: AddressCorrectionCandidateSource,
  checkedAt: string,
): AddressCorrectionCandidatePolicy {
  const countryCode = normalizeCountryCode(source.countryCode);
  const sourceTrust = classifyPostalSourceTrust({ countryCode, sourceIds: [source.sourceId] });
  const validUntil = Date.parse(source.validUntil);
  const checkedTimestamp = Date.parse(checkedAt);
  const blockers = [
    !countryCode ? 'country-code-missing' : null,
    sourceTrust.tier !== 'authoritative' ? 'authoritative-source-not-cataloged' : null,
    !source.sourceVersion.trim() ? 'source-version-missing' : null,
    !Number.isFinite(validUntil) || !Number.isFinite(checkedTimestamp) || validUntil <= checkedTimestamp
      ? 'source-evidence-expired-or-invalid'
      : null,
    !isHttpUrl(source.rightsUrl) ? 'rights-url-missing-or-invalid' : null,
    !isHttpUrl(source.correctionUrl) ? 'correction-url-missing-or-invalid' : null,
    !isSha256(source.dictionaryDigest) ? 'candidate-dictionary-digest-invalid' : null,
    !Number.isInteger(source.aggregateEntryCount) || source.aggregateEntryCount <= 0 ? 'candidate-dictionary-entry-count-invalid' : null,
    !source.scopes.length ? 'candidate-scope-missing' : null,
  ].filter(Boolean) as string[];

  return {
    version: ADDRESS_CORRECTION_CANDIDATE_POLICY_VERSION,
    countryCode,
    status: blockers.length ? 'disabled' : 'locality-admin-suggestions-only',
    mode: 'suggestion-only-never-auto-apply',
    permittedScopes: blockers.length ? [] : [...new Set(source.scopes)].sort() as AddressCorrectionCandidateScope[],
    blockers,
    nonClaim: 'This policy can authorize only caller-controlled suggestions from an approved aggregate-described dictionary. It never imports raw address records, applies a correction automatically, validates a delivery point, or proves postal deliverability.',
  };
}
