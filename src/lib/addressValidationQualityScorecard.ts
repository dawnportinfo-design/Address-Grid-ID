import { COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS } from './addressVerificationBenchmark';
import type { AddressValidationQualityReport } from './addressValidationQualityReport';

export const ADDRESS_VALIDATION_QUALITY_SCORECARD_VERSION = 'address-validation-quality-scorecard-v1';

type MetricGate = {
  direction: 'at-least' | 'at-most';
  threshold: number;
  observed: number;
  passed: boolean;
};

export type AddressValidationQualityScorecard = {
  version: string;
  countryCode: string;
  status: 'blocked' | 'internally-comparable-awaiting-signature';
  measurement: {
    protocolVersion: string;
    metricDefinitionVersion: string;
    corpusKind: 'synthetic' | 'aggregate-only';
    scope: 'country-specific-holdout';
    testVectorDigest: string;
    inputScriptClassCount: number | null;
    availabilityObservationWindowSeconds: number | null;
  } | null;
  metricGates: {
    sampleCount: MetricGate;
    exactMatchRate: MetricGate;
    falseAcceptRate: MetricGate;
    p95LatencyMs: MetricGate;
    availabilityPct: MetricGate;
    normalizationExactMatchRate: MetricGate;
    inputScriptClassCount: MetricGate;
    availabilityObservationWindowSeconds: MetricGate;
    typoCorrectionPrecision: MetricGate;
    typoCorrectionFalseChangeRate: MetricGate;
  } | null;
  blockers: string[];
  nonClaim: string;
};

function atLeast(observed: number, threshold: number): MetricGate {
  return { direction: 'at-least', threshold, observed, passed: Number.isFinite(observed) && observed >= threshold };
}

function atMost(observed: number, threshold: number): MetricGate {
  return { direction: 'at-most', threshold, observed, passed: Number.isFinite(observed) && observed <= threshold };
}

export function buildAddressValidationQualityScorecard(
  report: AddressValidationQualityReport,
): AddressValidationQualityScorecard {
  const aggregate = report.aggregateMetrics;
  const trace = report.measurementTrace;
  const blockers = [
    report.publicationStatus !== 'awaiting-independent-signature' ? `report-status-${report.publicationStatus}` : null,
    report.officialSourceEvidence.status !== 'fresh' ? 'official-source-evidence-not-current' : null,
    ['blocking', 'country-mismatch'].includes(report.officialSourceUpdate.status)
      ? `official-source-update-${report.officialSourceUpdate.status}`
      : null,
    !aggregate ? 'aggregate-metrics-missing' : null,
    !trace ? 'measurement-trace-missing' : null,
  ].filter(Boolean) as string[];

  if (!aggregate || !trace) {
    return {
      version: ADDRESS_VALIDATION_QUALITY_SCORECARD_VERSION,
      countryCode: report.countryCode,
      status: 'blocked',
      measurement: null,
      metricGates: null,
      blockers,
      nonClaim: 'This scorecard has no aggregate metrics to compare. It does not rate an address, claim provider parity, or authorize publication.',
    };
  }

  const metricGates = {
    sampleCount: atLeast(aggregate.sampleCount, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAggregateSamples),
    exactMatchRate: atLeast(aggregate.exactMatchRate, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumExactMatchRate),
    falseAcceptRate: atMost(aggregate.falseAcceptRate, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumFalseAcceptRate),
    p95LatencyMs: atMost(aggregate.p95LatencyMs, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumP95LatencyMs),
    availabilityPct: atLeast(aggregate.availabilityPct, COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAvailabilityPct),
    normalizationExactMatchRate: atLeast(
      aggregate.normalizationExactMatchRate ?? Number.NaN,
      COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumNormalizationExactMatchRate,
    ),
    inputScriptClassCount: atLeast(
      trace.inputScriptClassCount ?? Number.NaN,
      COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumInputScriptClassCount,
    ),
    availabilityObservationWindowSeconds: atLeast(
      trace.availabilityObservationWindowSeconds ?? Number.NaN,
      COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumAvailabilityObservationWindowSeconds,
    ),
    typoCorrectionPrecision: atLeast(
      aggregate.typoCorrectionPrecision ?? Number.NaN,
      COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.minimumTypoCorrectionPrecision,
    ),
    typoCorrectionFalseChangeRate: atMost(
      aggregate.typoCorrectionFalseChangeRate ?? Number.NaN,
      COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumTypoCorrectionFalseChangeRate,
    ),
  };
  const failedMetricIds = Object.entries(metricGates)
    .filter(([, gate]) => !gate.passed)
    .map(([id]) => `metric-threshold-${id}`);
  const completeBlockers = [...blockers, ...failedMetricIds];

  return {
    version: ADDRESS_VALIDATION_QUALITY_SCORECARD_VERSION,
    countryCode: report.countryCode,
    status: completeBlockers.length ? 'blocked' : 'internally-comparable-awaiting-signature',
    measurement: {
      protocolVersion: trace.protocolVersion,
      metricDefinitionVersion: trace.metricDefinitionVersion,
      corpusKind: trace.corpusKind,
      scope: trace.scope,
      testVectorDigest: trace.testVectorDigest,
      inputScriptClassCount: trace.inputScriptClassCount,
      availabilityObservationWindowSeconds: trace.availabilityObservationWindowSeconds,
    },
    metricGates,
    blockers: completeBlockers,
    nonClaim: 'This is an internal aggregate-metric comparison aid pending independent signature. It does not claim parity or superiority to Google, Smarty, Loqate, Melissa, or another provider; it does not validate any address or establish delivery-point reachability.',
  };
}
