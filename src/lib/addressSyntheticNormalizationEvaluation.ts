import { createHash } from 'node:crypto';
import { normalizeAddressPartEphemerally } from './addressEphemeralNormalization';

export const ADDRESS_SYNTHETIC_NORMALIZATION_EVALUATION_VERSION = 'address-synthetic-normalization-evaluation-v1';

export type AddressSyntheticNormalizationCase = {
  scenarioId: string;
  countryCode?: string;
  input: string;
  expectedComparisonKey: string;
  expectedEnglishDisplay?: string | null;
};

export type AddressSyntheticNormalizationEvaluation = {
  version: string;
  retention: 'ephemeral-inputs-aggregate-output-only';
  sampleCount: number;
  countryScopedCaseCount: number;
  inputScriptClassCount: number;
  comparisonKeyExactMatchRate: number;
  englishDisplayExactMatchRate: number | null;
  unexpectedChangeRate: number;
  testVectorDigest: string;
  nonClaim: string;
};

function rate(numerator: number, denominator: number) {
  return denominator ? numerator / denominator : 0;
}

function digestFor(cases: AddressSyntheticNormalizationCase[]) {
  const payload = cases
    .map(item => [item.scenarioId, item.countryCode || '', item.input, item.expectedComparisonKey, item.expectedEnglishDisplay || ''].join('\u0000'))
    .sort()
    .join('\n');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

const INPUT_SCRIPT_PATTERNS = [
  /\p{Script=Latin}/u,
  /\p{Script=Greek}/u,
  /\p{Script=Cyrillic}/u,
  /\p{Script=Arabic}/u,
  /\p{Script=Hebrew}/u,
  /\p{Script=Devanagari}/u,
  /\p{Script=Han}/u,
  /\p{Script=Hiragana}/u,
  /\p{Script=Katakana}/u,
  /\p{Script=Hangul}/u,
] as const;

export function evaluateSyntheticAddressNormalization(
  cases: AddressSyntheticNormalizationCase[],
): AddressSyntheticNormalizationEvaluation {
  let comparisonMatches = 0;
  let expectedEnglishCount = 0;
  let englishMatches = 0;
  let unexpectedChanges = 0;
  let countryScopedCaseCount = 0;
  const inputScriptClasses = new Set<number>();

  for (const item of cases) {
    if (item.countryCode?.trim()) countryScopedCaseCount += 1;
    INPUT_SCRIPT_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(item.input)) inputScriptClasses.add(index);
    });
    const normalized = normalizeAddressPartEphemerally(item.input, item.countryCode || '');
    if (normalized.comparisonKey === item.expectedComparisonKey) comparisonMatches += 1;
    if (item.expectedEnglishDisplay !== undefined) {
      expectedEnglishCount += 1;
      if (normalized.englishDisplay === item.expectedEnglishDisplay) englishMatches += 1;
    }
    if (item.input === item.expectedComparisonKey && normalized.comparisonKey !== item.expectedComparisonKey) {
      unexpectedChanges += 1;
    }
  }

  return {
    version: ADDRESS_SYNTHETIC_NORMALIZATION_EVALUATION_VERSION,
    retention: 'ephemeral-inputs-aggregate-output-only',
    sampleCount: cases.length,
    countryScopedCaseCount,
    inputScriptClassCount: inputScriptClasses.size,
    comparisonKeyExactMatchRate: rate(comparisonMatches, cases.length),
    englishDisplayExactMatchRate: expectedEnglishCount ? rate(englishMatches, expectedEnglishCount) : null,
    unexpectedChangeRate: rate(unexpectedChanges, cases.length),
    testVectorDigest: digestFor(cases),
    nonClaim: 'This is a synthetic text-normalization measurement. Country-scoped case and input-script counts are aggregate test metadata, not language coverage claims. It does not measure postal deliverability, official source coverage, or correction of real-world address records.',
  };
}
