import type { AddressSyntheticTypoToleranceEvaluation } from './addressSyntheticTypoToleranceEvaluation';

export type AddressSyntheticTypoToleranceParityBoundary = {
  evaluationVersion: string;
  retention: 'ephemeral-inputs-aggregate-output-only';
  testVectorDigest: string;
  comparisonTolerance: {
    equivalencePrecision: number;
    equivalenceRecall: number;
    falseEquivalenceRate: number;
  };
  commercialMetricEligibility: {
    typoCorrectionPrecision: false;
    typoCorrectionFalseChangeRate: false;
  };
  remainingCommercialParityGates: [
    'aggregate-typo-correction-precision',
    'aggregate-typo-correction-false-change-rate',
  ];
  nonClaim: string;
};

export function boundSyntheticTypoToleranceForCommercialParity(
  evaluation: AddressSyntheticTypoToleranceEvaluation,
): AddressSyntheticTypoToleranceParityBoundary {
  return {
    evaluationVersion: evaluation.version,
    retention: evaluation.retention,
    testVectorDigest: evaluation.testVectorDigest,
    comparisonTolerance: {
      equivalencePrecision: evaluation.equivalencePrecision,
      equivalenceRecall: evaluation.equivalenceRecall,
      falseEquivalenceRate: evaluation.falseEquivalenceRate,
    },
    commercialMetricEligibility: {
      typoCorrectionPrecision: false,
      typoCorrectionFalseChangeRate: false,
    },
    remainingCommercialParityGates: [
      'aggregate-typo-correction-precision',
      'aggregate-typo-correction-false-change-rate',
    ],
    nonClaim: 'Synthetic comparison tolerance does not measure semantic typo correction. These aggregate values cannot satisfy commercial typo-correction gates, enable automatic correction, validate an address, or establish delivery reachability.',
  };
}
