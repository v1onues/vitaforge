'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';

export function useSleep() {
  const logs = useLiveQuery(
    () => db.sleepLogs.orderBy('date').reverse().toArray(),
    []
  );

  const today = new Date().toISOString().split('T')[0];

  const todayLog = useLiveQuery(
    () => db.sleepLogs.where('date').equals(today).first(),
    [today]
  );

  const saveLog = async (data: {
    bedtime: string;
    wakeTime: string;
    quality: number;
    notes: string;
  }) => {
    const existing = await db.sleepLogs.where('date').equals(today).first();
    if (existing) {
      await db.sleepLogs.update(existing.id, { ...data, updatedAt: Date.now() });
    } else {
      await db.sleepLogs.add({
        id: crypto.randomUUID(),
        date: today,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

  const deleteLog = async (id: string) => {
    await db.sleepLogs.delete(id);
  };

  const avgQuality = (logs ?? []).length > 0
    ? Math.round((logs ?? []).reduce((s, l) => s + l.quality, 0) / (logs ?? []).length * 10) / 10
    : 0;

  return { logs: logs ?? [], todayLog: todayLog ?? null, saveLog, deleteLog, avgQuality };
}
