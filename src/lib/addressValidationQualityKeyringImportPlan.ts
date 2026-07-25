import { createHash } from 'node:crypto';
import {
  assessAddressValidationQualityKeyringImportApproval,
  type AddressValidationQualityKeyringImportApproval,
} from './addressValidationQualityKeyringApproval';
import type { AddressValidationQualityKeyringGovernanceLedger } from './addressValidationQualityKeyringGovernance';

export type AddressValidationQualityPublicKeyCandidate = {
  id: string;
  publicKeyPem: string;
};

export type AddressValidationQualityKeyringDryRunPlan = {
  mode: 'dry-run';
  status: 'blocked' | 'ready-for-controlled-import';
  imports: Array<{ id: string; publicKeySha256: string }>;
  blockers: string[];
  nonClaim: string;
};

function sha256(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function planAddressValidationQualityKeyringImport(
  ledger: AddressValidationQualityKeyringGovernanceLedger,
  approvals: AddressValidationQualityKeyringImportApproval[],
  candidates: AddressValidationQualityPublicKeyCandidate[],
  checkedAt: string,
): AddressValidationQualityKeyringDryRunPlan {
  const approval = assessAddressValidationQualityKeyringImportApproval(ledger, approvals, checkedAt);
  const expectedKeys = ledger.keys.filter(key => key.status !== 'revoked');
  const candidateIds = new Set<string>();
  const duplicateCandidate = candidates.some(candidate => candidateIds.has(candidate.id) || !candidateIds.add(candidate.id));
  const expectedById = new Map(expectedKeys.map(key => [key.id, key]));
  const unknownCandidate = candidates.some(candidate => !expectedById.has(candidate.id));
  const missingCandidate = expectedKeys.some(key => !candidateIds.has(key.id));
  const fingerprintMismatch = candidates.some(candidate => {
    const expected = expectedById.get(candidate.id);
    return !candidate.publicKeyPem.trim() || Boolean(expected && sha256(candidate.publicKeyPem) !== expected.publicKeySha256);
  });
  const blockers = [
    ...approval.blockers,
    duplicateCandidate ? 'duplicate-public-key-candidate-id' : null,
    unknownCandidate ? 'public-key-candidate-not-in-approved-ledger' : null,
    missingCandidate ? 'approved-public-key-candidate-missing' : null,
    fingerprintMismatch ? 'public-key-fingerprint-mismatch' : null,
  ].filter(Boolean) as string[];

  return {
    mode: 'dry-run',
    status: blockers.length ? 'blocked' : 'ready-for-controlled-import',
    imports: blockers.length
      ? []
      : candidates.map(candidate => ({ id: candidate.id, publicKeySha256: sha256(candidate.publicKeyPem) }))
        .sort((left, right) => left.id.localeCompare(right.id)),
    blockers,
    nonClaim: 'This is a dry-run only. It does not persist public keys, invoke a remote service, verify a report signature, or expose public-key bodies in its output.',
  };
}
