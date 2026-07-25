import type { AddressCorrectionCandidateScope, AddressCorrectionCandidateSource } from './addressCorrectionCandidatePolicy';

export const ADDRESS_CORRECTION_CANDIDATE_DICTIONARY_INTAKE_VERSION =
  'address-correction-candidate-dictionary-intake-v1';

export type AddressCorrectionCandidateDictionaryManifest = {
  version: string;
  countryCode: string;
  sourceId: string;
  sourceVersion: string;
  retrievedAt: string;
  validUntil: string;
  rightsUrl: string;
  correctionUrl: string;
  sourceArtifactDigest: string;
  dictionaryDigest: string;
  aggregateEntryCount: number;
  scopes: readonly AddressCorrectionCandidateScope[];
  artifactKind: 'aggregate-described-candidate-dictionary';
  payloadHandling: 'external-ephemeral-only';
};

export type AddressCorrectionCandidateDictionaryIntake = {
  version: string;
  status: 'eligible-for-ephemeral-processing' | 'blocked';
  candidateSource: AddressCorrectionCandidateSource | null;
  blockers: string[];
  nonClaim: string;
};

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

export function assessAddressCorrectionCandidateDictionaryManifest(
  manifest: AddressCorrectionCandidateDictionaryManifest,
  checkedAt: string,
): AddressCorrectionCandidateDictionaryIntake {
  const retrievedAt = Date.parse(manifest.retrievedAt);
  const validUntil = Date.parse(manifest.validUntil);
  const checkedTimestamp = Date.parse(checkedAt);
  const blockers = [
    manifest.version !== ADDRESS_CORRECTION_CANDIDATE_DICTIONARY_INTAKE_VERSION ? 'manifest-version-unsupported' : null,
    !manifest.countryCode.trim() ? 'country-code-missing' : null,
    !manifest.sourceId.trim() ? 'source-id-missing' : null,
    !manifest.sourceVersion.trim() ? 'source-version-missing' : null,
    !Number.isFinite(retrievedAt) || !Number.isFinite(checkedTimestamp) || retrievedAt > checkedTimestamp
      ? 'retrieval-time-invalid-or-future'
      : null,
    !Number.isFinite(validUntil) || !Number.isFinite(checkedTimestamp) || validUntil <= checkedTimestamp
      ? 'source-evidence-expired-or-invalid'
      : null,
    !isHttpUrl(manifest.rightsUrl) ? 'rights-url-missing-or-invalid' : null,
    !isHttpUrl(manifest.correctionUrl) ? 'correction-url-missing-or-invalid' : null,
    !isSha256(manifest.sourceArtifactDigest) ? 'source-artifact-digest-invalid' : null,
    !isSha256(manifest.dictionaryDigest) ? 'candidate-dictionary-digest-invalid' : null,
    !Number.isInteger(manifest.aggregateEntryCount) || manifest.aggregateEntryCount <= 0
      ? 'candidate-dictionary-entry-count-invalid'
      : null,
    !manifest.scopes.length ? 'candidate-scope-missing' : null,
    manifest.artifactKind !== 'aggregate-described-candidate-dictionary' ? 'artifact-kind-not-allowed' : null,
    manifest.payloadHandling !== 'external-ephemeral-only' ? 'payload-handling-not-allowed' : null,
  ].filter(Boolean) as string[];

  return {
    version: ADDRESS_CORRECTION_CANDIDATE_DICTIONARY_INTAKE_VERSION,
    status: blockers.length ? 'blocked' : 'eligible-for-ephemeral-processing',
    candidateSource: blockers.length
      ? null
      : {
        countryCode: manifest.countryCode,
        sourceId: manifest.sourceId,
        sourceVersion: manifest.sourceVersion,
        validUntil: manifest.validUntil,
        rightsUrl: manifest.rightsUrl,
        correctionUrl: manifest.correctionUrl,
        dictionaryDigest: manifest.dictionaryDigest,
        aggregateEntryCount: manifest.aggregateEntryCount,
        scopes: manifest.scopes,
      },
    blockers,
    nonClaim: 'This is metadata-only intake authorization for ephemeral external processing. It does not fetch, store, log, or publish dictionary entries, raw addresses, recipient data, delivery points, or precise locations.',
  };
}
