import { assessOfficialPostalEvidenceGate, type ScopedPostalEvidenceCandidate } from './officialPostalEvidenceGate';
import { POSTAL_SOURCE_SCOPE_LEDGER } from './postalSourceScopeLedger';

export const OFFICIAL_POSTAL_EVIDENCE_HOLDOUT_VERSION = 'official-postal-evidence-holdout-v1';

type ExpectedDecision = 'accepted' | 'rejected';

type SyntheticHoldoutCase = {
  countryCode: 'EH' | 'ES' | 'PT' | 'SJ';
  expected: ExpectedDecision;
  evaluatedAt: string;
  candidate: ScopedPostalEvidenceCandidate | null;
  family: 'scope-bound-metadata' | 'missing-metadata' | 'coordinate-injection' | 'expired-review' | 'blocked-scope';
};

export type OfficialPostalEvidenceHoldoutReport = {
  version: string;
  evaluatedAt: string;
  summary: {
    caseCount: number;
    expectedAccepted: number;
    expectedRejected: number;
    acceptedTruePositive: number;
    acceptedFalsePositive: number;
    acceptedFalseNegative: number;
    rejectedTruePositive: number;
    rejectedFalsePositive: number;
    rejectedFalseNegative: number;
    acceptancePrecision: number | null;
    acceptanceRecall: number | null;
    rejectionPrecision: number | null;
    rejectionRecall: number | null;
    allExpectationsMet: boolean;
  };
  byCountry: Record<string, { caseCount: number; expectedAccepted: number; observedAccepted: number; allExpectationsMet: boolean }>;
  byFamily: Record<SyntheticHoldoutCase['family'], { caseCount: number; allExpectationsMet: boolean }>;
  nonClaim: string;
};

function candidateFor(countryCode: SyntheticHoldoutCase['countryCode']): ScopedPostalEvidenceCandidate {
  const entry = POSTAL_SOURCE_SCOPE_LEDGER.find(item => item.countryCode === countryCode)!;
  const source = entry.sources[0]!;
  return {
    sourceId: source.sourceId,
    url: source.sourceUrl,
    sourceScopeId: entry.scopeId,
    sourceVersion: source.sourceVersion,
    sourceRetrievedAt: source.retrievedAt,
    sourceTermsUrl: source.termsUrl,
    sourceCorrectionUrl: source.correctionUrl,
  };
}

function syntheticHoldoutCases(): SyntheticHoldoutCase[] {
  return [
    { countryCode: 'ES', expected: 'accepted', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: candidateFor('ES'), family: 'scope-bound-metadata' },
    { countryCode: 'PT', expected: 'accepted', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: candidateFor('PT'), family: 'scope-bound-metadata' },
    { countryCode: 'PT', expected: 'rejected', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: { ...candidateFor('PT'), sourceTermsUrl: '' }, family: 'missing-metadata' },
    { countryCode: 'ES', expected: 'rejected', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: { ...candidateFor('ES'), sourceCorrectionUrl: '' }, family: 'missing-metadata' },
    { countryCode: 'ES', expected: 'rejected', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: { ...candidateFor('ES'), lat: 1 }, family: 'coordinate-injection' },
    { countryCode: 'PT', expected: 'rejected', evaluatedAt: '2026-10-22T00:00:00.000Z', candidate: candidateFor('PT'), family: 'expired-review' },
    { countryCode: 'SJ', expected: 'rejected', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: candidateFor('SJ'), family: 'blocked-scope' },
    { countryCode: 'EH', expected: 'rejected', evaluatedAt: '2026-07-24T00:00:00.000Z', candidate: candidateFor('EH'), family: 'blocked-scope' },
  ];
}

const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : null;

export function runOfficialPostalEvidenceSyntheticHoldout(): OfficialPostalEvidenceHoldoutReport {
  const cases = syntheticHoldoutCases();
  let acceptedTruePositive = 0;
  let acceptedFalsePositive = 0;
  let acceptedFalseNegative = 0;
  let rejectedTruePositive = 0;
  let rejectedFalsePositive = 0;
  let rejectedFalseNegative = 0;
  const byCountry: OfficialPostalEvidenceHoldoutReport['byCountry'] = {};
  const byFamily = Object.fromEntries([
    'scope-bound-metadata',
    'missing-metadata',
    'coordinate-injection',
    'expired-review',
    'blocked-scope',
  ].map(family => [family, { caseCount: 0, allExpectationsMet: true }])) as OfficialPostalEvidenceHoldoutReport['byFamily'];

  for (const testCase of cases) {
    const observed = assessOfficialPostalEvidenceGate({
      countryCode: testCase.countryCode,
      candidate: testCase.candidate,
      evaluatedAt: testCase.evaluatedAt,
    }).status === 'accepted' ? 'accepted' : 'rejected';
    const correct = observed === testCase.expected;
    const country = byCountry[testCase.countryCode] || {
      caseCount: 0,
      expectedAccepted: 0,
      observedAccepted: 0,
      allExpectationsMet: true,
    };
    country.caseCount += 1;
    country.expectedAccepted += Number(testCase.expected === 'accepted');
    country.observedAccepted += Number(observed === 'accepted');
    country.allExpectationsMet &&= correct;
    byCountry[testCase.countryCode] = country;
    byFamily[testCase.family].caseCount += 1;
    byFamily[testCase.family].allExpectationsMet &&= correct;

    if (testCase.expected === 'accepted' && observed === 'accepted') acceptedTruePositive += 1;
    if (testCase.expected === 'rejected' && observed === 'accepted') acceptedFalsePositive += 1;
    if (testCase.expected === 'accepted' && observed === 'rejected') acceptedFalseNegative += 1;
    if (testCase.expected === 'rejected' && observed === 'rejected') rejectedTruePositive += 1;
  }
  rejectedFalsePositive = acceptedFalseNegative;
  rejectedFalseNegative = acceptedFalsePositive;
  const expectedAccepted = cases.filter(testCase => testCase.expected === 'accepted').length;
  const expectedRejected = cases.length - expectedAccepted;

  return {
    version: OFFICIAL_POSTAL_EVIDENCE_HOLDOUT_VERSION,
    evaluatedAt: '2026-07-24T00:00:00.000Z',
    summary: {
      caseCount: cases.length,
      expectedAccepted,
      expectedRejected,
      acceptedTruePositive,
      acceptedFalsePositive,
      acceptedFalseNegative,
      rejectedTruePositive,
      rejectedFalsePositive,
      rejectedFalseNegative,
      acceptancePrecision: ratio(acceptedTruePositive, acceptedTruePositive + acceptedFalsePositive),
      acceptanceRecall: ratio(acceptedTruePositive, expectedAccepted),
      rejectionPrecision: ratio(rejectedTruePositive, rejectedTruePositive + rejectedFalsePositive),
      rejectionRecall: ratio(rejectedTruePositive, expectedRejected),
      allExpectationsMet: acceptedFalsePositive === 0 && acceptedFalseNegative === 0,
    },
    byCountry,
    byFamily,
    nonClaim: 'This deterministic holdout evaluates only metadata-gate behavior with synthetic fixtures and aggregate counts. It contains no postcode values, addresses, recipients, coordinates, source payloads, credentials, or delivery observations; it is not a coverage, accuracy, or deliverability evaluation.',
  };
}
