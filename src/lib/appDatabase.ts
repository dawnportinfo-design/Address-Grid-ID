import Dexie,{ Table } from 'dexie';

import type { RegisteredAddressRecord,SavedRegisteredAddressQr } from './registeredAddressQr';

export type SavedAgidRecord = {
  id: string;
  lat?: number;
  lon?: number;
  prefix?: string;
  isSea?: boolean;
  address?: string;
  savedAt?: string;
  [key: string]: unknown;
};

export type SavedQrRecord = SavedRegisteredAddressQr & {
  [key: string]: unknown;
};

export type AoidDatabaseRecord = RegisteredAddressRecord & {
  isAoid?: boolean;
  [key: string]: unknown;
};

export type SyncQueueAction = 'create' | 'update' | 'delete';
export type SyncQueueStatus = 'pending' | 'sending' | 'failed';

export type SyncQueueRecord = {
  id: string;
  entityType: 'savedAgid' | 'savedQr' | 'registeredAddress' | 'aoid' | 'settings';
  entityId: string;
  action: SyncQueueAction;
  payload?: unknown;
  status: SyncQueueStatus;
  attemptCount: number;
  createdAt: number;
  updatedAt: number;
  nextAttemptAt?: number;
  lastError?: string;
};

export type AppDatabaseSnapshot = {
  savedAgids: SavedAgidRecord[];
  savedQrs: SavedQrRecord[];
  registeredAddresses: RegisteredAddressRecord[];
  aoids: AoidDatabaseRecord[];
  syncQueue: SyncQueueRecord[];
};

export const EMPTY_APP_DATABASE_SNAPSHOT: AppDatabaseSnapshot = {
  savedAgids: [],
  savedQrs: [],
  registeredAddresses: [],
  aoids: [],
  syncQueue: [],
};

class AgidAppDatabase extends Dexie {
  savedAgids!: Table<SavedAgidRecord, string>;
  savedQrs!: Table<SavedQrRecord, string>;
  registeredAddresses!: Table<RegisteredAddressRecord, string>;
  aoids!: Table<AoidDatabaseRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;

  constructor() {
    super('AGID_AppDB');
    this.version(1).stores({
      savedAgids: 'id, savedAt, prefix, address',
      savedQrs: 'id, savedAt, source, address, regionName',
      registeredAddresses: 'id, type, agid, country, updatedAt, registeredAt, name, address',
      aoids: 'id, type, agid, country, updatedAt, registeredAt, name, address',
    });
    this.version(2).stores({
      savedAgids: 'id, savedAt, prefix, address',
      savedQrs: 'id, savedAt, source, address, regionName',
      registeredAddresses: 'id, type, agid, country, updatedAt, registeredAt, name, address',
      aoids: 'id, type, agid, country, updatedAt, registeredAt, name, address',
      syncQueue: 'id, status, entityType, entityId, updatedAt, nextAttemptAt',
    });
  }
}

const appDatabase = new AgidAppDatabase();

function cloneSnapshot(snapshot: Partial<AppDatabaseSnapshot> = {}): AppDatabaseSnapshot {
  return {
    savedAgids: [...(snapshot.savedAgids || [])],
    savedQrs: [...(snapshot.savedQrs || [])],
    registeredAddresses: [...(snapshot.registeredAddresses || [])],
    aoids: [...(snapshot.aoids || [])],
    syncQueue: [...(snapshot.syncQueue || [])],
  };
}

export function isClientDatabaseSupported() {
  return typeof globalThis.indexedDB !== 'undefined';
}

export function sanitizeDatabaseRecords<T extends { id?: unknown }>(records: unknown): Array<T & { id: string }> {
  if (!Array.isArray(records)) return [];
  return records.filter((record): record is T & { id: string } => (
    Boolean(record)
    && typeof record === 'object'
    && typeof (record as { id?: unknown }).id === 'string'
    && (record as { id: string }).id.trim().length > 0
  ));
}

export function mergeRecordsById<T extends { id?: unknown }>(primary: unknown, fallback: unknown): Array<T & { id: string }> {
  const merged = new Map<string, T & { id: string }>();
  for (const record of sanitizeDatabaseRecords<T>(primary)) {
    merged.set(record.id, record);
  }
  for (const record of sanitizeDatabaseRecords<T>(fallback)) {
    if (!merged.has(record.id)) merged.set(record.id, record);
  }
  return Array.from(merged.values());
}

async function replaceTable<T, TKey>(table: Table<T, TKey>, records: T[]) {
  await table.clear();
  if (records.length > 0) {
    await table.bulkPut(records);
  }
}

async function orderedByNewest<T>(table: Table<T, string>, key: string) {
  try {
    return await table.orderBy(key).reverse().toArray();
  } catch {
    return table.toArray();
  }
}

export async function loadAppDatabaseSnapshot(
  fallback: Partial<AppDatabaseSnapshot> = EMPTY_APP_DATABASE_SNAPSHOT,
): Promise<AppDatabaseSnapshot> {
  const fallbackSnapshot = cloneSnapshot(fallback);
  if (!isClientDatabaseSupported()) return fallbackSnapshot;

  try {
    const [savedAgids, savedQrs, registeredAddresses, aoids, syncQueue] = await Promise.all([
      orderedByNewest(appDatabase.savedAgids, 'savedAt'),
      orderedByNewest(appDatabase.savedQrs, 'savedAt'),
      orderedByNewest(appDatabase.registeredAddresses, 'updatedAt'),
      orderedByNewest(appDatabase.aoids, 'updatedAt'),
      orderedByNewest(appDatabase.syncQueue, 'updatedAt'),
    ]);

    return {
      savedAgids: mergeRecordsById<SavedAgidRecord>(savedAgids, fallbackSnapshot.savedAgids),
      savedQrs: mergeRecordsById<SavedQrRecord>(savedQrs, fallbackSnapshot.savedQrs),
      registeredAddresses: mergeRecordsById<RegisteredAddressRecord>(
        registeredAddresses,
        fallbackSnapshot.registeredAddresses,
      ),
      aoids: mergeRecordsById<AoidDatabaseRecord>(aoids, fallbackSnapshot.aoids),
      syncQueue: mergeRecordsById<SyncQueueRecord>(syncQueue, fallbackSnapshot.syncQueue),
    };
  } catch (error) {
    console.warn('[AGID DB] Falling back to localStorage snapshot:', error);
    return fallbackSnapshot;
  }
}

export async function persistSavedAgids(records: SavedAgidRecord[]) {
  if (!isClientDatabaseSupported()) return false;
  try {
    await replaceTable(appDatabase.savedAgids, sanitizeDatabaseRecords<SavedAgidRecord>(records));
    return true;
  } catch (error) {
    console.warn('[AGID DB] Failed to persist saved AGIDs:', error);
    return false;
  }
}

export async function persistSavedQrs(records: SavedQrRecord[]) {
  if (!isClientDatabaseSupported()) return false;
  try {
    await replaceTable(appDatabase.savedQrs, sanitizeDatabaseRecords<SavedQrRecord>(records));
    return true;
  } catch (error) {
    console.warn('[AGID DB] Failed to persist saved QR records:', error);
    return false;
  }
}

export async function persistRegisteredAddresses(records: RegisteredAddressRecord[]) {
  if (!isClientDatabaseSupported()) return false;
  try {
    await replaceTable(appDatabase.registeredAddresses, sanitizeDatabaseRecords<RegisteredAddressRecord>(records));
    return true;
  } catch (error) {
    console.warn('[AGID DB] Failed to persist registered addresses:', error);
    return false;
  }
}

export async function persistAoids(records: AoidDatabaseRecord[]) {
  if (!isClientDatabaseSupported()) return false;
  try {
    await replaceTable(appDatabase.aoids, sanitizeDatabaseRecords<AoidDatabaseRecord>(records));
    return true;
  } catch (error) {
    console.warn('[AGID DB] Failed to persist AOIDs:', error);
    return false;
  }
}

export async function persistSyncQueue(records: SyncQueueRecord[]) {
  if (!isClientDatabaseSupported()) return false;
  try {
    await replaceTable(appDatabase.syncQueue, sanitizeDatabaseRecords<SyncQueueRecord>(records));
    return true;
  } catch (error) {
    console.warn('[AGID DB] Failed to persist sync queue:', error);
    return false;
  }
}
