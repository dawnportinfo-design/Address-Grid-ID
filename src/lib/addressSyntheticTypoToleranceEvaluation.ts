import { createHash } from 'node:crypto';
import { normalizeAddressPartEphemerally } from './addressEphemeralNormalization';

export const ADDRESS_SYNTHETIC_TYPO_TOLERANCE_EVALUATION_VERSION = 'address-synthetic-typo-tolerance-evaluation-v1';

export type AddressSyntheticTypoToleranceCase = {
  scenarioId: string;
  canonical: string;
  variant: string;
  shouldMatch: boolean;
};

export type AddressSyntheticTypoToleranceEvaluation = {
  version: string;
  retention: 'ephemeral-inputs-aggregate-output-only';
  sampleCount: number;
  equivalencePrecision: number;
  equivalenceRecall: number;
  falseEquivalenceRate: number;
  testVectorDigest: string;
  correctionBoundary: 'comparison-only-no-suggested-or-automatic-semantic-correction';
  nonClaim: string;
};

function rate(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0;
}

function digestFor(cases: AddressSyntheticTypoToleranceCase[]) {
  const payload = cases
    .map(item => [item.scenarioId, item.canonical, item.variant, item.shouldMatch ? '1' : '0'].join('\u0000'))
    .sort()
    .join('\n');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export function evaluateSyntheticTypoTolerance(
  cases: AddressSyntheticTypoToleranceCase[],
): AddressSyntheticTypoToleranceEvaluation {
  let actualMatches = 0;
  let expectedMatches = 0;
  let trueMatches = 0;
  let falseMatches = 0;

  for (const item of cases) {
    const canonicalKey = normalizeAddressPartEphemerally(item.canonical).comparisonKey;
    const variantKey = normalizeAddressPartEphemerally(item.variant).comparisonKey;
    const matched = Boolean(canonicalKey && canonicalKey === variantKey);
    if (item.shouldMatch) expectedMatches += 1;
    if (matched) actualMatches += 1;
    if (matched && item.shouldMatch) trueMatches += 1;
    if (matched && !item.shouldMatch) falseMatches += 1;
  }

  return {
    version: ADDRESS_SYNTHETIC_TYPO_TOLERANCE_EVALUATION_VERSION,
    retention: 'ephemeral-inputs-aggregate-output-only',
    sampleCount: cases.length,
    equivalencePrecision: rate(trueMatches, actualMatches),
    equivalenceRecall: rate(trueMatches, expectedMatches),
    falseEquivalenceRate: rate(falseMatches, cases.length),
    testVectorDigest: digestFor(cases),
    correctionBoundary: 'comparison-only-no-suggested-or-automatic-semantic-correction',
    nonClaim: 'This is a synthetic comparison-tolerance measurement. It does not produce spelling suggestions, correct semantic typos, validate a real-world address, or establish delivery-point reachability.',
  };
}
