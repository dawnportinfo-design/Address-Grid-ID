import { ADDRESS_VALIDATION_QUALITY_REPORT_KEY_PURPOSE } from './addressValidationQualityKeyring';
import { createHash } from 'node:crypto';

export const ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION = 'address-validation-quality-keyring-governance-v1';
export const MAXIMUM_KEYRING_REVIEW_WINDOW_DAYS = 90;

export type AddressValidationQualityKeyRotationEntry = {
  id: string;
  algorithm: 'ed25519';
  purpose: typeof ADDRESS_VALIDATION_QUALITY_REPORT_KEY_PURPOSE;
  publicKeySha256: string;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'scheduled' | 'revoked';
  revocationReason?: string;
};

export type AddressValidationQualityKeyringGovernanceLedger = {
  version: string;
  publishedAt: string;
  nextReviewAt: string;
  correctionUrl: string;
  changeLogUrl: string;
  keys: AddressValidationQualityKeyRotationEntry[];
};

export type AddressValidationQualityKeyringGovernanceAssessment = {
  status: 'blocked' | 'ready-for-approved-keyring-import';
  blockers: string[];
  nextActions: string[];
  nonClaim: string;
};

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Keyring governance ledgers cannot contain non-finite numbers.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`;
  }
  throw new Error('Keyring governance ledgers must contain JSON-compatible values.');
}

export function calculateAddressValidationQualityKeyringGovernanceLedgerDigest(
  ledger: AddressValidationQualityKeyringGovernanceLedger,
) {
  return createHash('sha256').update(canonicalJson(ledger)).digest('hex');
}

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isSha256(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function assessAddressValidationQualityKeyringGovernance(
  ledger: AddressValidationQualityKeyringGovernanceLedger,
  checkedAt: string,
): AddressValidationQualityKeyringGovernanceAssessment {
  const publishedAt = parseTimestamp(ledger.publishedAt);
  const nextReviewAt = parseTimestamp(ledger.nextReviewAt);
  const now = parseTimestamp(checkedAt);
  const keyIds = new Set<string>();
  const duplicateKey = ledger.keys.some(key => keyIds.has(key.id) || !keyIds.add(key.id));
  const invalidKey = ledger.keys.some(key => {
    const validFrom = parseTimestamp(key.validFrom);
    const validUntil = parseTimestamp(key.validUntil);
    return !key.id || key.algorithm !== 'ed25519' ||
      key.purpose !== ADDRESS_VALIDATION_QUALITY_REPORT_KEY_PURPOSE ||
      !isSha256(key.publicKeySha256) || validFrom === null || validUntil === null || validUntil <= validFrom ||
      (key.status === 'revoked' && !key.revocationReason?.trim());
  });
  const activeOrScheduledKeys = ledger.keys.filter(key => key.status !== 'revoked');
  const reviewWindowExceeded = publishedAt === null || nextReviewAt === null || now === null ||
    nextReviewAt <= now || nextReviewAt <= publishedAt ||
    nextReviewAt - publishedAt > MAXIMUM_KEYRING_REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const blockers = [
    ledger.version !== ADDRESS_VALIDATION_QUALITY_KEYRING_GOVERNANCE_VERSION ? 'unsupported-governance-ledger-version' : null,
    !isHttpUrl(ledger.correctionUrl) ? 'correction-url-missing-or-invalid' : null,
    !isHttpUrl(ledger.changeLogUrl) ? 'change-log-url-missing-or-invalid' : null,
    reviewWindowExceeded ? 'keyring-review-window-invalid-or-expired' : null,
    !activeOrScheduledKeys.length ? 'no-active-or-scheduled-public-key' : null,
    duplicateKey ? 'duplicate-key-id' : null,
    invalidKey ? 'invalid-key-rotation-entry' : null,
  ].filter(Boolean) as string[];

  return {
    status: blockers.length ? 'blocked' : 'ready-for-approved-keyring-import',
    blockers,
    nextActions: blockers.length
      ? ['correct-the-governance-ledger-before-importing-any-public-key']
      : ['obtain-approval-and-import-public-key-material-through-the-separate-keyring-release-process'],
    nonClaim: 'Governance readiness does not authenticate a public key, approve an auditor, or verify any signature. It only validates the non-secret rotation metadata required before a controlled import.',
  };
}
