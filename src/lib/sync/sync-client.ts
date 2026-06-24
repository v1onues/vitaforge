import { db } from '../db/schema';
import { encryption } from '../crypto/encryption';
import { exportAllTables, importSyncData } from './sync-data';

interface SyncResult {
  success: boolean;
  error?: string;
  timestamp?: number;
}

export async function pushSync(): Promise<SyncResult> {
  try {
    const settings = await db.settings.get('main');
    if (!settings?.syncEnabled || !settings.syncId || !settings.supabaseUrl || !settings.supabaseAnonKey) {
      return { success: false, error: 'Senkronizasyon yapılandırılmamış' };
    }

    const payload = await exportAllTables();
    const encryptedData = await encryption.encrypt(JSON.stringify(payload));

    const res = await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseUrl: settings.supabaseUrl,
        supabaseAnonKey: settings.supabaseAnonKey,
        syncId: settings.syncId,
        encryptedData,
      }),
    });

    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error };

    await db.settings.update('main', { lastSyncAt: Date.now() });
    return { success: true, timestamp: Date.now() };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Bilinmeyen hata' };
  }
}

export async function pullSync(): Promise<SyncResult> {
  try {
    const settings = await db.settings.get('main');
    if (!settings?.syncEnabled || !settings.syncId || !settings.supabaseUrl || !settings.supabaseAnonKey) {
      return { success: false, error: 'Senkronizasyon yapılandırılmamış' };
    }

    const res = await fetch('/api/sync/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseUrl: settings.supabaseUrl,
        supabaseAnonKey: settings.supabaseAnonKey,
        syncId: settings.syncId,
      }),
    });

    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error };
    if (!result.encryptedData) return { success: false, error: 'Bulut verisi bulunamadı' };

    const decrypted = await encryption.decrypt(result.encryptedData);
    const payload = JSON.parse(decrypted);
    await importSyncData(payload);

    await db.settings.update('main', { lastSyncAt: Date.now() });
    return { success: true, timestamp: Date.now() };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Bilinmeyen hata' };
  }
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function schedulePushSync(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const settings = await db.settings.get('main');
    if (settings?.syncEnabled && settings.autoSync) {
      await pushSync();
    }
  }, 10000);
}
