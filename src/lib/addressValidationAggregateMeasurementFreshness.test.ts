import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assessAddressValidationAggregateMeasurementFreshness } from './addressValidationAggregateMeasurementFreshness';

test('calculates a bounded refresh deadline from aggregate measurement metadata only', () => {
  const freshness = assessAddressValidationAggregateMeasurementFreshness(
    { measuredAt: '2026-07-22T00:00:00.000Z' },
    '2026-07-23T00:00:00.000Z',
  );

  assert.equal(freshness.status, 'current');
  assert.equal(freshness.refreshDueAt, '2026-08-21T00:00:00.000Z');
  assert.match(freshness.nonClaim, /does not retain evaluation inputs/i);
});

test('blocks missing, expired, and future aggregate measurement metadata', () => {
  assert.equal(
    assessAddressValidationAggregateMeasurementFreshness(null, '2026-07-23T00:00:00.000Z').status,
    'missing',
  );
  assert.equal(
    assessAddressValidationAggregateMeasurementFreshness(
      { measuredAt: '2026-06-22T00:00:00.000Z' },
      '2026-07-23T00:00:00.000Z',
    ).status,
    'expired-or-invalid',
  );
  assert.equal(
    assessAddressValidationAggregateMeasurementFreshness(
      { measuredAt: '2026-07-24T00:00:00.000Z' },
      '2026-07-23T00:00:00.000Z',
    ).status,
    'expired-or-invalid',
  );
});

test('blocks aggregate timestamps without explicit timezone information', () => {
  assert.equal(
    assessAddressValidationAggregateMeasurementFreshness(
      { measuredAt: '2026-07-22T00:00:00' },
      '2026-07-23T00:00:00.000Z',
    ).status,
    'expired-or-invalid',
  );
  assert.equal(
    assessAddressValidationAggregateMeasurementFreshness(
      { measuredAt: '2026-07-22T00:00:00.000Z' },
      '2026-07-23',
    ).status,
    'expired-or-invalid',
  );
});
