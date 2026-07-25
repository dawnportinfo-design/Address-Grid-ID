import {
  assessAddressValidationQualityKeyringGovernance,
  calculateAddressValidationQualityKeyringGovernanceLedgerDigest,
  type AddressValidationQualityKeyringGovernanceLedger,
} from './addressValidationQualityKeyringGovernance';

export const ADDRESS_VALIDATION_KEYRING_APPROVAL_ROLES = [
  'security-control',
  'quality-governance',
] as const;

export type AddressValidationKeyringApprovalRole =
  (typeof ADDRESS_VALIDATION_KEYRING_APPROVAL_ROLES)[number];

export type AddressValidationQualityKeyringImportApproval = {
  role: AddressValidationKeyringApprovalRole;
  decision: 'approved' | 'rejected';
  approvedAt: string;
  ledgerDigest: string;
  reviewReference: string;
};

export type AddressValidationQualityKeyringImportApprovalAssessment = {
  status: 'blocked' | 'approved-for-controlled-import';
  blockers: string[];
  nextActions: string[];
  nonClaim: string;
};

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function assessAddressValidationQualityKeyringImportApproval(
  ledger: AddressValidationQualityKeyringGovernanceLedger,
  approvals: AddressValidationQualityKeyringImportApproval[],
  checkedAt: string,
): AddressValidationQualityKeyringImportApprovalAssessment {
  const governance = assessAddressValidationQualityKeyringGovernance(ledger, checkedAt);
  const digest = calculateAddressValidationQualityKeyringGovernanceLedgerDigest(ledger);
  const publishedAt = parseTimestamp(ledger.publishedAt);
  const nextReviewAt = parseTimestamp(ledger.nextReviewAt);
  const now = parseTimestamp(checkedAt);
  const approved = approvals.filter(approval => approval.decision === 'approved');
  const approvedRoles = new Set(approved.map(approval => approval.role));
  const duplicateRole = approved.length !== approvedRoles.size;
  const staleOrInvalidApproval = approved.some(approval => {
    const approvedAt = parseTimestamp(approval.approvedAt);
    return !approval.reviewReference.trim() || approval.ledgerDigest !== digest || approvedAt === null ||
      publishedAt === null || nextReviewAt === null || now === null ||
      approvedAt < publishedAt || approvedAt > now || approvedAt >= nextReviewAt;
  });
  const blockers = [
    governance.status !== 'ready-for-approved-keyring-import' ? 'keyring-governance-not-ready' : null,
    approvals.some(approval => approval.decision === 'rejected') ? 'keyring-import-rejected-by-control' : null,
    approvedRoles.size !== ADDRESS_VALIDATION_KEYRING_APPROVAL_ROLES.length ? 'two-distinct-approval-roles-required' : null,
    duplicateRole ? 'duplicate-approval-role' : null,
    staleOrInvalidApproval ? 'approval-does-not-bind-to-current-reviewable-ledger' : null,
  ].filter(Boolean) as string[];

  return {
    status: blockers.length ? 'blocked' : 'approved-for-controlled-import',
    blockers,
    nextActions: blockers.length
      ? ['obtain-current-ledger-bound-approvals-from-both-required-control-roles']
      : ['import-approved-public-keys-through-the-separate-controlled-release-operation'],
    nonClaim: 'This approval gate records role separation and ledger binding only. It does not import a key, authenticate an auditor, or verify a report signature.',
  };
}
