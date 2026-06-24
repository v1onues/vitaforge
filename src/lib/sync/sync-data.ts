import { db } from '../db/schema';

const SYNC_TABLES = [
  'projects', 'projectGroups', 'tasks', 'timeEntries', 'tags',
  'habits', 'habitLogs', 'notes', 'goals', 'lifeAreas', 'moodLogs',
  'journalEntries', 'gratitudeEntries', 'sleepLogs',
  'readingItems', 'mediaItems', 'transactions',
  'activityLogs', 'aiChatMessages',
  'fitnessLogs', 'dictionLogs',
  'monitoredEndpoints', 'radioStations',
] as const;

export interface SyncPayload {
  version: string;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

export async function exportAllTables(): Promise<SyncPayload> {
  const tables: Record<string, unknown[]> = {};

  for (const tableName of SYNC_TABLES) {
    tables[tableName] = await (db[tableName as keyof typeof db] as { toArray: () => Promise<unknown[]> }).toArray();
  }

  return {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    tables,
  };
}

export async function importSyncData(payload: SyncPayload): Promise<void> {
  for (const [tableName, rows] of Object.entries(payload.tables)) {
    if (tableName === 'settings') continue;
    if (rows && rows.length > 0) {
      await (db[tableName as keyof typeof db] as { bulkPut: (items: unknown[]) => Promise<void> }).bulkPut(rows);
    }
  }
}
