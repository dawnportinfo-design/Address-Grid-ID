import type { AddressSyntheticNormalizationEvaluation } from './addressSyntheticNormalizationEvaluation';

export type AddressSyntheticNormalizationParityEvidence = {
  normalizationExactMatchRate: number;
  testVectorDigest: string;
  evaluationVersion: string;
  retention: 'ephemeral-inputs-aggregate-output-only';
  remainingCommercialParityGates: [
    'aggregate-typo-correction-precision',
    'aggregate-typo-correction-false-change-rate',
  ];
  nonClaim: string;
};

export function adaptSyntheticNormalizationEvaluationForCommercialParity(
  evaluation: AddressSyntheticNormalizationEvaluation,
): AddressSyntheticNormalizationParityEvidence {
  return {
    normalizationExactMatchRate: evaluation.comparisonKeyExactMatchRate,
    testVectorDigest: evaluation.testVectorDigest,
    evaluationVersion: evaluation.version,
    retention: evaluation.retention,
    remainingCommercialParityGates: [
      'aggregate-typo-correction-precision',
      'aggregate-typo-correction-false-change-rate',
    ],
    nonClaim: 'Synthetic normalization evidence can populate only the normalization exact-match metric. It does not measure semantic typo correction, postal deliverability, or commercial-provider parity.',
  };
}
