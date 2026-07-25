import { COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS } from './addressVerificationBenchmark';

export const ADDRESS_VALIDATION_AGGREGATE_MEASUREMENT_FRESHNESS_VERSION =
  'address-validation-aggregate-measurement-freshness-v1';

export type AddressValidationAggregateMeasurementFreshness = {
  version: string;
  status: 'missing' | 'current' | 'expired-or-invalid';
  measuredAt: string | null;
  refreshDueAt: string | null;
  nonClaim: string;
};

function hasTimezoneQualifiedTimestamp(value: string | null | undefined) {
  return Boolean(value) && /T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value) && Number.isFinite(Date.parse(value));
}

export function assessAddressValidationAggregateMeasurementFreshness(
  aggregateMetrics: { measuredAt: string } | null | undefined,
  checkedAt: string,
): AddressValidationAggregateMeasurementFreshness {
  const measuredAt = Date.parse(aggregateMetrics?.measuredAt || '');
  const checkedTimestamp = Date.parse(checkedAt);
  if (!aggregateMetrics) {
    return {
      version: ADDRESS_VALIDATION_AGGREGATE_MEASUREMENT_FRESHNESS_VERSION,
      status: 'missing',
      measuredAt: null,
      refreshDueAt: null,
      nonClaim: 'No aggregate measurement is available. This does not imply a country has no postal service, address quality, or delivery capability.',
    };
  }
  if (!hasTimezoneQualifiedTimestamp(aggregateMetrics.measuredAt) ||
    !hasTimezoneQualifiedTimestamp(checkedAt) ||
    !Number.isFinite(measuredAt) ||
    !Number.isFinite(checkedTimestamp) ||
    measuredAt > checkedTimestamp) {
    return {
      version: ADDRESS_VALIDATION_AGGREGATE_MEASUREMENT_FRESHNESS_VERSION,
      status: 'expired-or-invalid',
      measuredAt: aggregateMetrics.measuredAt,
      refreshDueAt: null,
      nonClaim: 'Invalid or future measurement metadata cannot be used for a quality comparison or publication decision.',
    };
  }
  const refreshDueAt = new Date(
    measuredAt + COMMERCIAL_ADDRESS_VALIDATION_MINIMUMS.maximumAggregateEvaluationAgeDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  return {
    version: ADDRESS_VALIDATION_AGGREGATE_MEASUREMENT_FRESHNESS_VERSION,
    status: Date.parse(refreshDueAt) <= checkedTimestamp ? 'expired-or-invalid' : 'current',
    measuredAt: aggregateMetrics.measuredAt,
    refreshDueAt,
    nonClaim: 'This is a freshness calculation for aggregate-only evaluation metadata. It does not retain evaluation inputs, provider responses, or individual address results.',
  };
}
