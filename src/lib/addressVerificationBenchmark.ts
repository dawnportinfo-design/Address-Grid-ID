export const ADDRESS_VERIFICATION_BENCHMARK_VERSION = 'address-verification-benchmark-v2';
export const ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION = 'address-validation-aggregate-evaluation-v1';
export const ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION = 'address-validation-aggregate-metrics-v1';

export const ADDRESS_VERIFICATION_BENCHMARK_DIMENSIONS = [
  'globalPostalCoverage',
  'deliveryPointDepth',
  'authoritativePostalDepth',
  'correctionAndStandardization',
  'fuzzyMatching',
  'geocodingDepth',
  'autocompleteCapture',
  'languageAndScriptHandling',
  'naturalFeatureContext',
  'openSourceAuditability',
  'privacyLocalFirst',
  'costControl',
] as const;

export type AddressVerificationBenchmarkDimension =
  (typeof ADDRESS_VERIFICATION_BENCHMARK_DIMENSIONS)[number];

export type AddressVerificationBenchmarkProfile = {
  id: string;
  label: string;
  kind: 'agid' | 'commercial-api' | 'maps-api' | 'open-source';
  metrics: {
    claimedCountries?: number;
    addressFormatCountries?: number;
    explicitPolicyCountries?: number;
    authoritativePostalCountries?: number;
    deliveryPointCountries?: number;
    notes: string[];
  };
  scores: Record<AddressVerificationBenchmarkDimension, number>;
  strengths: string[];
  risks: string[];
  sourceEvidence: string[];
};

export type AddressVerificationBenchmarkSummary = {
  id: string;
  label: string;
  kind: AddressVerificationBenchmarkProfile['kind'];
  score: number;
  strongestDimensions: AddressVerificationBenchmarkDimension[];
  weakestDimensions: AddressVerificationBenchmarkDimension[];
};

export type AddressVerificationBenchmarkGap = {
  dimension: AddressVerificationBenchmarkDimension;
  agidScore: number;
  bestCompetitorScore: number;
  bestCompetitorIds: string[];
  delta: number;
  priority: 'high' | 'medium' | 'low';
};

export type AgidAddressVerificationBenchmarkInput = {
  addressFormatCountryCount: number;
  explicitPolicyCountryCount: number;
  authoritativePostalCountryCount?: number;
  deliveryPointCountryCount?: number;
};

export const COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS = {
  minimumAggregateSamples: 10_000,
  minimumExactMatchRate: 0.995,
  maximumFalseAcceptRate: 0.001,
  maximumP95LatencyMs: 500,
  minimumAvailabilityPct: 99.9,
  minimumNormalizationExactMatchRate: 0.995,
  minimumTypoCorrectionPrecision: 0.99,
  maximumTypoCorrectionFalseChangeRate: 0.001,
  minimumInputScriptClassCount: 2,
  minimumAvailabilityObservationWindowSeconds: 86_400,
  maximumAggregateEvaluationAgeDays: 30,
} as const;

export type AddressValidationCommercialParityInput = {
  countryCode: string;
  officialEvidence: {
    format: boolean;
    postal: boolean;
    deliveryPoint: boolean;
    rights: boolean;
    version: boolean;
    freshness: boolean;
    correctionPath: boolean;
  };
  privacyBoundary: 'no-raw-address-storage' | 'ephemeral-customer-controlled' | 'unknown-or-persistent';
  evaluatedAt?: string;
  aggregateEvaluation?: {
    measuredAt: string;
    sampleCount: number;
    exactMatchRate: number;
    falseAcceptRate: number;
    p95LatencyMs: number;
    availabilityPct: number;
    normalizationExactMatchRate?: number;
    typoCorrectionPrecision?: number;
    typoCorrectionFalseChangeRate?: number;
    measurementContract?: AddressValidationAggregateMeasurementContract;
  };
};

export type AddressValidationAggregateMeasurementContract = {
  protocolVersion: string;
  metricDefinitionVersion: string;
  corpusKind: 'synthetic' | 'aggregate-only';
  scope: 'country-specific-holdout';
  rawDataHandling: 'no-raw-addresses-or-responses-recorded';
  testVectorDigest: string;
  inputScriptClassCount?: number;
  availabilityObservationWindowSeconds?: number;
};

export type AddressValidationCommercialParityGate = {
  id: string;
  passed: boolean;
  action: string;
};

export type AddressValidationCommercialParityReadiness = {
  countryCode: string;
  status: 'blocked' | 'measurement-required' | 'commercial-comparison-eligible';
  gates: AddressValidationCommercialParityGate[];
  blockers: string[];
  nextActions: string[];
  nonClaim: string;
};

export const ADDRESS_VERIFICATION_DIMENSION_WEIGHTS: Record<AddressVerificationBenchmarkDimension, number> = {
  globalPostalCoverage: 0.13,
  deliveryPointDepth: 0.14,
  authoritativePostalDepth: 0.13,
  correctionAndStandardization: 0.1,
  fuzzyMatching: 0.08,
  geocodingDepth: 0.08,
  autocompleteCapture: 0.06,
  languageAndScriptHandling: 0.08,
  naturalFeatureContext: 0.07,
  openSourceAuditability: 0.06,
  privacyLocalFirst: 0.05,
  costControl: 0.03,
};

function clampScore(score: number) {
  return Math.max(0, Math.min(10, score));
}

function roundScore(score: number) {
  return Math.round(score * 10) / 10;
}

function bestDimensions(
  scores: Record<AddressVerificationBenchmarkDimension, number>,
  direction: 'strongest' | 'weakest',
) {
  return [...ADDRESS_VERIFICATION_BENCHMARK_DIMENSIONS]
    .sort((left, right) => (
      direction === 'strongest'
        ? scores[right] - scores[left]
        : scores[left] - scores[right]
    ))
    .slice(0, 3);
}

export function scoreAddressVerificationProfile(profile: AddressVerificationBenchmarkProfile) {
  const weighted = ADDRESS_VERIFICATION_BENCHMARK_DIMENSIONS.reduce(
    (score, dimension) => score + profile.scores[dimension] * ADDRESS_VERIFICATION_DIMENSION_WEIGHTS[dimension],
    0,
  );
  return roundScore(weighted);
}

export function summarizeAddressVerificationProfile(
  profile: AddressVerificationBenchmarkProfile,
): AddressVerificationBenchmarkSummary {
  return {
    id: profile.id,
    label: profile.label,
    kind: profile.kind,
    score: scoreAddressVerificationProfile(profile),
    strongestDimensions: bestDimensions(profile.scores, 'strongest'),
    weakestDimensions: bestDimensions(profile.scores, 'weakest'),
  };
}

export function compareAddressVerificationProfiles(
  profiles: AddressVerificationBenchmarkProfile[],
): AddressVerificationBenchmarkSummary[] {
  return profiles
    .map(summarizeAddressVerificationProfile)
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
}

export function findAgidAddressVerificationGaps(
  agid: AddressVerificationBenchmarkProfile,
  competitors: AddressVerificationBenchmarkProfile[],
): AddressVerificationBenchmarkGap[] {
  return ADDRESS_VERIFICATION_BENCHMARK_DIMENSIONS.flatMap(dimension => {
    const bestCompetitorScore = Math.max(...competitors.map(competitor => competitor.scores[dimension]));
    const delta = roundScore(bestCompetitorScore - agid.scores[dimension]);
    if (delta <= 1) return [];
    const priority: AddressVerificationBenchmarkGap['priority'] =
      delta >= 3 ? 'high' : delta >= 2 ? 'medium' : 'low';

    return [{
      dimension,
      agidScore: agid.scores[dimension],
      bestCompetitorScore,
      bestCompetitorIds: competitors
        .filter(competitor => competitor.scores[dimension] === bestCompetitorScore)
        .map(competitor => competitor.id),
      delta,
      priority,
    }];
  }).sort((left, right) => right.delta - left.delta);
}

function normalizedCountryCode(value: string) {
  const code = value.normalize('NFKC').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return code === 'UK' ? 'GB' : code;
}

function validMetric(value: number, minimum: number, direction: 'at-least' | 'at-most') {
  if (!Number.isFinite(value)) return false;
  return direction === 'at-least' ? value >= minimum : value <= minimum;
}

function validRate(value: number, minimum: number, direction: 'at-least' | 'at-most') {
  return value >= 0 && value <= 1 && validMetric(value, minimum, direction);
}

function validPercentage(value: number, minimum: number) {
  return value >= 0 && value <= 100 && validMetric(value, minimum, 'at-least');
}

function validSampleCount(value: number, minimum: number) {
  return Number.isInteger(value) && value >= 0 && validMetric(value, minimum, 'at-least');
}

function validLatency(value: number, maximum: number) {
  return value >= 0 && validMetric(value, maximum, 'at-most');
}

function validScriptClassCount(value: number | undefined) {
  return Number.isInteger(value) && value >= COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumInputScriptClassCount;
}

function validAvailabilityObservationWindow(value: number | undefined) {
  return Number.isInteger(value) &&
    value >= COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAvailabilityObservationWindowSeconds;
}

function timestamp(value: string | undefined) {
  if (!value || !/T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null;
  const parsed = Date.parse(value || '');
  return Number.isNaN(parsed) ? null : parsed;
}

function isSha256Digest(value: string | undefined) {
  return /^[a-f0-9]{64}$/i.test(value || '');
}

function hasValidAggregateMeasurementContract(
  contract: AddressValidationAggregateMeasurementContract | undefined,
) {
  return contract?.protocolVersion === ADDRESS_VALIDATION_AGGREGATE_EVALUATION_PROTOCOL_VERSION &&
    contract.metricDefinitionVersion === ADDRESS_VALIDATION_AGGREGATE_METRIC_DEFINITION_VERSION &&
    (contract.corpusKind === 'synthetic' || contract.corpusKind === 'aggregate-only') &&
    contract.scope === 'country-specific-holdout' &&
    contract.rawDataHandling === 'no-raw-addresses-or-responses-recorded';
}

export function assessAddressValidationCommercialParity(
  input: AddressValidationCommercialParityInput,
): AddressValidationCommercialParityReadiness {
  const evidence = input.officialEvidence;
  const aggregate = input.aggregateEvaluation;
  const evaluatedAt = timestamp(input.evaluatedAt);
  const measuredAt = timestamp(aggregate?.measuredAt);
  const semanticTypoCorrectionCorpusEligible = aggregate?.measurementContract?.corpusKind === 'aggregate-only';
  const aggregateEvaluationFresh = evaluatedAt !== null &&
    measuredAt !== null &&
    measuredAt <= evaluatedAt &&
    evaluatedAt - measuredAt <= COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumAggregateEvaluationAgeDays * 24 * 60 * 60 * 1000;
  const gates: AddressValidationCommercialParityGate[] = [
    { id: 'official-format', passed: evidence.format, action: 'record-current-official-format-evidence' },
    { id: 'official-postal', passed: evidence.postal, action: 'record-current-authoritative-postal-evidence' },
    { id: 'official-delivery-point', passed: evidence.deliveryPoint, action: 'connect-an-authoritative-delivery-point-source' },
    { id: 'rights', passed: evidence.rights, action: 'record-use-and-redistribution-terms' },
    { id: 'version', passed: evidence.version, action: 'record-source-version-and-update-cadence' },
    { id: 'freshness', passed: evidence.freshness, action: 'enforce-a-country-specific-freshness-window' },
    { id: 'correction-path', passed: evidence.correctionPath, action: 'record-and-test-the-source-correction-path' },
    {
      id: 'privacy-boundary',
      passed: input.privacyBoundary !== 'unknown-or-persistent',
      action: 'use-no-storage-or-customer-controlled-ephemeral-address-handling',
    },
    {
      id: 'aggregate-sample-size',
      passed: aggregate ? validSampleCount(aggregate.sampleCount, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAggregateSamples) : false,
      action: `collect-at-least-${COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAggregateSamples}-synthetic-or-consented-aggregate-evaluations`,
    },
    {
      id: 'aggregate-evaluation-freshness',
      passed: aggregateEvaluationFresh,
      action: `refresh-aggregate-evaluation-within-${COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumAggregateEvaluationAgeDays}-days`,
    },
    {
      id: 'aggregate-measurement-contract',
      passed: hasValidAggregateMeasurementContract(aggregate?.measurementContract),
      action: 'record-the-versioned-aggregate-only-measurement-contract-and-no-raw-data-attestation',
    },
    {
      id: 'aggregate-test-vector-digest',
      passed: isSha256Digest(aggregate?.measurementContract?.testVectorDigest),
      action: 'record-a-sha256-digest-for-the-non-personal-test-vector-set',
    },
    {
      id: 'aggregate-exact-match-rate',
      passed: aggregate ? validRate(aggregate.exactMatchRate, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumExactMatchRate, 'at-least') : false,
      action: 'meet-the-exact-match-rate-threshold-in-a-country-specific-holdout-evaluation',
    },
    {
      id: 'aggregate-false-accept-rate',
      passed: aggregate ? validRate(aggregate.falseAcceptRate, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumFalseAcceptRate, 'at-most') : false,
      action: 'reduce-false-accept-rate-below-the-release-threshold',
    },
    {
      id: 'aggregate-p95-latency',
      passed: aggregate ? validLatency(aggregate.p95LatencyMs, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumP95LatencyMs) : false,
      action: 'meet-the-p95-latency-release-threshold',
    },
    {
      id: 'aggregate-availability',
      passed: aggregate ? validPercentage(aggregate.availabilityPct, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAvailabilityPct) : false,
      action: 'meet-the-availability-release-threshold',
    },
    {
      id: 'aggregate-availability-observation-window',
      passed: validAvailabilityObservationWindow(aggregate?.measurementContract?.availabilityObservationWindowSeconds),
      action: `record-an-availability-observation-window-of-at-least-${COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAvailabilityObservationWindowSeconds}-seconds`,
    },
    {
      id: 'aggregate-normalization-exact-match-rate',
      passed: aggregate ? validRate(
        aggregate.normalizationExactMatchRate ?? Number.NaN,
        COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumNormalizationExactMatchRate,
        'at-least',
      ) : false,
      action: 'meet-the-country-specific-multilingual-normalization-threshold-in-a-synthetic-holdout-evaluation',
    },
    {
      id: 'aggregate-multilingual-script-diversity',
      passed: validScriptClassCount(aggregate?.measurementContract?.inputScriptClassCount),
      action: `record-at-least-${COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumInputScriptClassCount}-input-script-classes-in-the-aggregate-only-normalization-holdout`,
    },
    {
      id: 'aggregate-typo-correction-precision',
      passed: Boolean(semanticTypoCorrectionCorpusEligible && aggregate && validRate(
        aggregate.typoCorrectionPrecision ?? Number.NaN,
        COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumTypoCorrectionPrecision,
        'at-least',
      )),
      action: 'meet-the-country-specific-typo-correction-precision-threshold-in-an-aggregate-only-holdout-evaluation',
    },
    {
      id: 'aggregate-typo-correction-false-change-rate',
      passed: Boolean(semanticTypoCorrectionCorpusEligible && aggregate && validRate(
        aggregate.typoCorrectionFalseChangeRate ?? Number.NaN,
        COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumTypoCorrectionFalseChangeRate,
        'at-most',
      )),
      action: 'reduce-country-specific-typo-correction-false-change-rate-below-the-aggregate-only-release-threshold',
    },
  ];
  const blockers = gates.filter(gate => !gate.passed).map(gate => gate.id);
  const evidenceBlocked = blockers.some(blocker => blocker.startsWith('official-') || [
    'rights',
    'version',
    'freshness',
    'correction-path',
    'privacy-boundary',
  ].includes(blocker));

  return {
    countryCode: normalizedCountryCode(input.countryCode),
    status: evidenceBlocked
      ? 'blocked'
      : blockers.length
        ? 'measurement-required'
        : 'commercial-comparison-eligible',
    gates,
    blockers,
    nextActions: gates.filter(gate => !gate.passed).map(gate => gate.action),
    nonClaim: 'Commercial-comparison eligibility is an internal release gate, not a claim of equivalence, superiority, carrier deliverability, or nationwide coverage.',
  };
}

export function buildAgidAddressVerificationBenchmarkProfile({
  addressFormatCountryCount,
  explicitPolicyCountryCount,
  authoritativePostalCountryCount = 0,
  deliveryPointCountryCount = 0,
}: AgidAddressVerificationBenchmarkInput): AddressVerificationBenchmarkProfile {
  const formatCoverageScore = Math.min(2.4, (addressFormatCountryCount / 281) * 2.4);
  const explicitPolicyScore = Math.min(1.8, (explicitPolicyCountryCount / 55) * 1.8);
  const authoritativePostalDepthScore = Math.min(1.5, Math.max(0, authoritativePostalCountryCount) / 40);
  const deliveryPointDepthScore = Math.min(1.2, Math.max(0, deliveryPointCountryCount) / 30);

  return {
    id: 'agid-current',
    label: 'AGID address verification engine',
    kind: 'agid',
    metrics: {
      addressFormatCountries: addressFormatCountryCount,
      explicitPolicyCountries: explicitPolicyCountryCount,
      authoritativePostalCountries: authoritativePostalCountryCount,
      deliveryPointCountries: deliveryPointCountryCount,
      notes: [
        'Scores assume the current open-source rules, address-format corpus, postal evidence matching, and optional OpenAddresses-style reference records.',
        'The score is an internal planning heuristic, not a user-facing quality label.',
      ],
    },
    scores: {
      globalPostalCoverage: roundScore(clampScore(2 + formatCoverageScore + explicitPolicyScore)),
      deliveryPointDepth: roundScore(clampScore(2.2 + deliveryPointDepthScore)),
      authoritativePostalDepth: roundScore(clampScore(3 + authoritativePostalDepthScore)),
      correctionAndStandardization: 5.8,
      fuzzyMatching: 5.7,
      geocodingDepth: 5.5,
      autocompleteCapture: 4.8,
      languageAndScriptHandling: 7.1,
      naturalFeatureContext: 8.8,
      openSourceAuditability: 9.7,
      privacyLocalFirst: 9.4,
      costControl: 9.2,
    },
    strengths: [
      'Auditable open-source rules and evidence logs.',
      'Local-first verification path without mandatory third-party API calls.',
      'Natural feature and remote-place context beyond ordinary postal validation.',
    ],
    risks: [
      'Delivery-point and sub-building validation is weaker than commercial reference datasets.',
      'Country-specific authoritative postal evidence is still sparse outside the explicit target policies.',
      'No large public gold corpus has been wired into the benchmark yet.',
    ],
    sourceEvidence: [
      'AGID source: src/lib/addressVerificationEngine.ts',
      'AGID source: src/data/address_formats',
    ],
  };
}

export const ADDRESS_VERIFICATION_COMPETITOR_PROFILES: AddressVerificationBenchmarkProfile[] = [
  {
    id: 'experian',
    label: 'Experian Address Validation',
    kind: 'commercial-api',
    metrics: {
      claimedCountries: 245,
      notes: ['Official docs describe real-time and bulk address validation, formatting, enrichment, fuzzy matching, and authoritative postal sources.'],
    },
    scores: {
      globalPostalCoverage: 9.4,
      deliveryPointDepth: 9.1,
      authoritativePostalDepth: 9.2,
      correctionAndStandardization: 9.1,
      fuzzyMatching: 9.0,
      geocodingDepth: 8.4,
      autocompleteCapture: 8.7,
      languageAndScriptHandling: 8.7,
      naturalFeatureContext: 3.4,
      openSourceAuditability: 3.1,
      privacyLocalFirst: 3.5,
      costControl: 3.2,
    },
    strengths: [
      'Strong commercial reference data and fuzzy correction.',
      'Broad country coverage and enterprise uptime guarantees.',
      'Transliteration support across many character sets.',
    ],
    risks: [
      'Closed scoring and proprietary datasets reduce reproducibility.',
      'Commercial API dependency and licensing costs.',
      'Not designed as a named natural-feature identity engine.',
    ],
    sourceEvidence: [
      'https://docs.experianaperture.io/address-validation/experian-address-validation/overview/introduction/',
    ],
  },
  {
    id: 'loqate',
    label: 'GBG Loqate Verify',
    kind: 'commercial-api',
    metrics: {
      notes: ['Official coverage docs expose country-by-country verification and geocode levels from L1 to L5.'],
    },
    scores: {
      globalPostalCoverage: 9.5,
      deliveryPointDepth: 9.3,
      authoritativePostalDepth: 9.1,
      correctionAndStandardization: 8.9,
      fuzzyMatching: 8.6,
      geocodingDepth: 8.6,
      autocompleteCapture: 8.8,
      languageAndScriptHandling: 8.5,
      naturalFeatureContext: 3.3,
      openSourceAuditability: 3.2,
      privacyLocalFirst: 4.3,
      costControl: 3.4,
    },
    strengths: [
      'Very broad global verification coverage with delivery-point levels in strong countries.',
      'Clear country-level depth model.',
      'Cloud and installed product options.',
    ],
    risks: [
      'Closed reference data limits independent verification.',
      'Commercial dependency and cost.',
      'Postal-address focus does not cover AGID-style natural geography.',
    ],
    sourceEvidence: ['https://docs.loqate.com/data-coverage/introduction'],
  },
  {
    id: 'melissa',
    label: 'Melissa Global Address Verification',
    kind: 'commercial-api',
    metrics: {
      claimedCountries: 240,
      notes: ['Official material claims 240+ countries, correction, standardization, geocoding, autocomplete, and transliteration.'],
    },
    scores: {
      globalPostalCoverage: 9.2,
      deliveryPointDepth: 9.0,
      authoritativePostalDepth: 9.0,
      correctionAndStandardization: 9.0,
      fuzzyMatching: 8.4,
      geocodingDepth: 8.9,
      autocompleteCapture: 8.3,
      languageAndScriptHandling: 8.4,
      naturalFeatureContext: 3.2,
      openSourceAuditability: 3.0,
      privacyLocalFirst: 4.0,
      costControl: 3.3,
    },
    strengths: [
      'Strong postal correction, standardization, geocoding, and transliteration.',
      'CASS-certified US path and on-prem/cloud options.',
      'Good operational fit for shipping and CRM data quality.',
    ],
    risks: [
      'Closed datasets and proprietary parsing rules.',
      'Commercial API dependency and licensing.',
      'Postal-address focus is narrower than AGID natural-feature identity.',
    ],
    sourceEvidence: ['https://www.melissa.com/hubfs/resources/data-sheet-global-address-verification.pdf'],
  },
  {
    id: 'smarty',
    label: 'Smarty International Street Address API',
    kind: 'commercial-api',
    metrics: {
      notes: ['Official docs describe international verification with per-country verification/geocode accuracy differences and a separate stronger US API.'],
    },
    scores: {
      globalPostalCoverage: 8.5,
      deliveryPointDepth: 8.4,
      authoritativePostalDepth: 8.5,
      correctionAndStandardization: 8.4,
      fuzzyMatching: 8.0,
      geocodingDepth: 8.0,
      autocompleteCapture: 8.1,
      languageAndScriptHandling: 7.3,
      naturalFeatureContext: 3.2,
      openSourceAuditability: 3.2,
      privacyLocalFirst: 3.4,
      costControl: 4.0,
    },
    strengths: [
      'Strong shipping-address workflow, especially with the dedicated US products.',
      'Verification and geocode precision metadata.',
      'Clear API behavior around zero or more matches.',
    ],
    risks: [
      'Country depth varies and US should use a separate product for best metadata.',
      'Closed reference data.',
      'Natural feature context is not the core product.',
    ],
    sourceEvidence: ['https://www.smarty.com/docs/apis/international-street-api/reference'],
  },
  {
    id: 'google-address-validation',
    label: 'Google Address Validation API',
    kind: 'maps-api',
    metrics: {
      claimedCountries: 40,
      notes: ['Coverage is limited to the current official support table; data quality varies by country.'],
    },
    scores: {
      globalPostalCoverage: 7.0,
      deliveryPointDepth: 7.4,
      authoritativePostalDepth: 7.2,
      correctionAndStandardization: 8.0,
      fuzzyMatching: 7.6,
      geocodingDepth: 8.8,
      autocompleteCapture: 8.6,
      languageAndScriptHandling: 6.4,
      naturalFeatureContext: 5.1,
      openSourceAuditability: 3.7,
      privacyLocalFirst: 3.2,
      costControl: 3.9,
    },
    strengths: [
      'Strong geocoding and metadata in supported regions.',
      'Good integration with Google Maps and Places workflows.',
      'USPS CASS-compatible mode for US-specific flows.',
    ],
    risks: [
      'Supported country list is much smaller than 240+ country commercial providers.',
      'Language code in the input address is currently ignored by the validation method.',
      'PostalAddress is explicitly not intended to model roads, towns, or mountains.',
    ],
    sourceEvidence: [
      'https://developers.google.com/maps/documentation/address-validation/coverage',
      'https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/TopLevel/validateAddress',
    ],
  },
  {
    id: 'nominatim-libpostal',
    label: 'Nominatim + libpostal style open-source stack',
    kind: 'open-source',
    metrics: {
      notes: ['Represents a self-hosted open geocoder and parser baseline, not a postal-authority deliverability product.'],
    },
    scores: {
      globalPostalCoverage: 5.4,
      deliveryPointDepth: 3.2,
      authoritativePostalDepth: 2.9,
      correctionAndStandardization: 4.0,
      fuzzyMatching: 5.8,
      geocodingDepth: 7.9,
      autocompleteCapture: 5.5,
      languageAndScriptHandling: 6.3,
      naturalFeatureContext: 7.6,
      openSourceAuditability: 9.0,
      privacyLocalFirst: 8.8,
      costControl: 8.5,
    },
    strengths: [
      'Self-hostable and inspectable.',
      'Broad OSM place search and reverse geocoding.',
      'Good baseline for named natural and civic features.',
    ],
    risks: [
      'OSM coverage and tagging vary widely by country and region.',
      'Not a deliverability validator or postal authority source.',
      'Classification labels can be inconsistent across OSM tags.',
    ],
    sourceEvidence: [
      'https://nominatim.org/release-docs/develop/api/Overview/',
      'https://nominatim.org/release-docs/develop/api/Search/',
    ],
  },
];
