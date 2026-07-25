import type {
  AddressCorrectionCandidatePolicy,
  AddressCorrectionCandidateScope,
} from './addressCorrectionCandidatePolicy';

export const ADDRESS_CORRECTION_CANDIDATE_MINIMUM_SCORE = 0.92;
export const ADDRESS_CORRECTION_CANDIDATE_MINIMUM_MARGIN = 0.05;

export type AddressCorrectionCandidateScore = {
  candidateId: string;
  scope: AddressCorrectionCandidateScope;
  score: number;
};

export type AddressCorrectionCandidateDecision = {
  status: 'suggestion-available' | 'ambiguous' | 'disabled' | 'insufficient-confidence';
  mode: 'suggestion-only-never-auto-apply';
  suggestion: { candidateId: string; scope: AddressCorrectionCandidateScope; score: number } | null;
  reason: string;
  nonClaim: string;
};

function validScore(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

export function decideAddressCorrectionCandidate(
  policy: AddressCorrectionCandidatePolicy,
  candidates: AddressCorrectionCandidateScore[],
): AddressCorrectionCandidateDecision {
  if (policy.status !== 'locality-admin-suggestions-only') {
    return {
      status: 'disabled',
      mode: 'suggestion-only-never-auto-apply',
      suggestion: null,
      reason: 'candidate-policy-not-enabled',
      nonClaim: 'No correction candidate is available because the policy gates have not passed.',
    };
  }

  const ranked = candidates
    .filter(candidate => (
      candidate.candidateId.trim() &&
      policy.permittedScopes.includes(candidate.scope) &&
      validScore(candidate.score)
    ))
    .sort((left, right) => right.score - left.score || left.candidateId.localeCompare(right.candidateId));
  const top = ranked[0];
  const runnerUp = ranked[1];
  if (!top || top.score < ADDRESS_CORRECTION_CANDIDATE_MINIMUM_SCORE) {
    return {
      status: 'insufficient-confidence',
      mode: 'suggestion-only-never-auto-apply',
      suggestion: null,
      reason: 'top-candidate-score-below-minimum',
      nonClaim: 'A low-confidence candidate must not be displayed as a correction or applied automatically.',
    };
  }
  if (runnerUp && top.score - runnerUp.score < ADDRESS_CORRECTION_CANDIDATE_MINIMUM_MARGIN) {
    return {
      status: 'ambiguous',
      mode: 'suggestion-only-never-auto-apply',
      suggestion: null,
      reason: 'top-candidate-margin-below-minimum',
      nonClaim: 'Ambiguous candidates are intentionally withheld; this is not a correction or delivery validation result.',
    };
  }

  return {
    status: 'suggestion-available',
    mode: 'suggestion-only-never-auto-apply',
    suggestion: { candidateId: top.candidateId, scope: top.scope, score: top.score },
    reason: 'single-high-confidence-candidate',
    nonClaim: 'The caller may display this candidate for user confirmation only. It is not automatically applied and does not prove a valid address or delivery point.',
  };
}
