import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  EMPTY_APP_DATABASE_SNAPSHOT,
  isClientDatabaseSupported,
  mergeRecordsById,
  sanitizeDatabaseRecords,
} from './appDatabase';

test('database record merge prefers IndexedDB records and backfills local fallback records', () => {
  const merged = mergeRecordsById<{ id?: unknown; address?: string; savedAt?: string }>(
    [
      { id: 'JP05AV8TJGH8', address: 'DB address', savedAt: '2026-06-01T00:00:00.000Z' },
      { id: 'US00TEST0001', address: 'US DB address' },
    ],
    [
      { id: 'JP05AV8TJGH8', address: 'old localStorage address' },
      { id: 'VN00TEST0001', address: 'localStorage only address' },
    ],
  );

  assert.deepEqual(merged.map(record => record.id), ['JP05AV8TJGH8', 'US00TEST0001', 'VN00TEST0001']);
  assert.equal(merged[0].address, 'DB address');
  assert.equal(merged[2].address, 'localStorage only address');
});

test('database record sanitizer ignores invalid records without an id', () => {
  assert.deepEqual(
    sanitizeDatabaseRecords([
      { id: 'A1', name: 'valid' },
      { id: '' },
      { name: 'missing id' },
      null,
      'bad',
    ]),
    [{ id: 'A1', name: 'valid' }],
  );
});

test('empty database snapshot is stable and IndexedDB support is environment-gated', () => {
  assert.deepEqual(EMPTY_APP_DATABASE_SNAPSHOT, {
    savedAgids: [],
    savedQrs: [],
    registeredAddresses: [],
    aoids: [],
    syncQueue: [],
  });
  assert.equal(isClientDatabaseSupported(), typeof globalThis.indexedDB !== 'undefined');
});
