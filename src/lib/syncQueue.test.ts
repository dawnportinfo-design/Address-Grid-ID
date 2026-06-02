import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
buildSyncQueueRecord,
getFlushableSyncQueueRecords,
getSyncBackoffMs,
getSyncQueueHybridPolicy,
markSyncQueueRecordFailed,
markSyncQueueRecordSending,
} from './syncQueue';

test('builds stable local-first sync queue records', () => {
  const record = buildSyncQueueRecord({
    entityType: 'registeredAddress',
    entityId: ' JP05 AV8 ',
    action: 'update',
    payload: { address: 'Tokyo' },
    now: 1000,
  });

  assert.equal(record.id, 'registeredAddress:JP05-AV8:update:1000');
  assert.equal(record.status, 'pending');
  assert.equal(record.attemptCount, 0);
  assert.deepEqual(record.payload, { address: 'Tokyo' });
});

test('flush queue is offline aware and respects retry backoff', () => {
  const ready = buildSyncQueueRecord({
    entityType: 'savedAgid',
    entityId: 'A',
    action: 'create',
    now: 1000,
  });
  const delayed = markSyncQueueRecordFailed(ready, 'network', 2000);
  const sending = markSyncQueueRecordSending({
    ...ready,
    id: 'savedAgid:B:create:1000',
    entityId: 'B',
  }, 3000);

  assert.deepEqual(getFlushableSyncQueueRecords([ready], { online: false, now: 5000 }), []);
  assert.deepEqual(
    getFlushableSyncQueueRecords([delayed, ready, sending], { online: true, now: 2500 }).map(record => record.id),
    [ready.id],
  );
  assert.equal(getFlushableSyncQueueRecords([delayed], { online: true, now: delayed.nextAttemptAt }).length, 1);
});

test('sync backoff is capped for repeated failures', () => {
  assert.equal(getSyncBackoffMs(0), 1000);
  assert.equal(getSyncBackoffMs(2), 4000);
  assert.equal(getSyncBackoffMs(99), 5 * 60 * 1000);
});

test('sync queue exposes the central/device hybrid policy for each entity type', () => {
  assert.equal(getSyncQueueHybridPolicy('savedAgid').centralRole, 'none');
  assert.equal(getSyncQueueHybridPolicy('registeredAddress').centralRole, 'optional-private-sync');
  assert.equal(getSyncQueueHybridPolicy('settings').privacyScope, 'settings');
});
