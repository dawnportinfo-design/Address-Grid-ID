import type { SyncQueueAction,SyncQueueRecord } from './appDatabase';
import { getHybridSyncEntityPolicy } from './hybridArchitecture';

export type SyncQueueInput = {
  entityType: SyncQueueRecord['entityType'];
  entityId: string;
  action: SyncQueueAction;
  payload?: unknown;
  now?: number;
};

function cleanId(value: string) {
  return value.trim().replace(/\s+/g, '-');
}

export function buildSyncQueueRecord(input: SyncQueueInput): SyncQueueRecord {
  const now = input.now ?? Date.now();
  const entityId = cleanId(input.entityId);
  return {
    id: `${input.entityType}:${entityId}:${input.action}:${now}`,
    entityType: input.entityType,
    entityId,
    action: input.action,
    payload: input.payload,
    status: 'pending',
    attemptCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function getSyncBackoffMs(attemptCount: number) {
  const attempts = Math.max(0, attemptCount);
  return Math.min(5 * 60 * 1000, 1000 * 2 ** attempts);
}

export function markSyncQueueRecordFailed(
  record: SyncQueueRecord,
  error: string,
  now = Date.now(),
): SyncQueueRecord {
  const attemptCount = record.attemptCount + 1;
  return {
    ...record,
    status: 'failed',
    attemptCount,
    lastError: error,
    updatedAt: now,
    nextAttemptAt: now + getSyncBackoffMs(attemptCount),
  };
}

export function markSyncQueueRecordSending(record: SyncQueueRecord, now = Date.now()): SyncQueueRecord {
  return {
    ...record,
    status: 'sending',
    updatedAt: now,
  };
}

export function getFlushableSyncQueueRecords(
  records: SyncQueueRecord[],
  options: {
    online: boolean;
    now?: number;
    limit?: number;
  },
) {
  if (!options.online) return [];
  const now = options.now ?? Date.now();
  const limit = options.limit ?? 25;
  return records
    .filter(record => record.status !== 'sending')
    .filter(record => !record.nextAttemptAt || record.nextAttemptAt <= now)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, limit);
}

export function getSyncQueueHybridPolicy(entityType: SyncQueueRecord['entityType']) {
  return getHybridSyncEntityPolicy(entityType);
}
