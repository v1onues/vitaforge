'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';

export function useMoodLog(date?: string) {
  const today = date ?? new Date().toISOString().split('T')[0];

  const log = useLiveQuery(
    () => db.moodLogs.where('date').equals(today).first(),
    [today]
  );

  const setMood = async (mood: number, energy: number, notes?: string) => {
    const existing = await db.moodLogs.where('date').equals(today).first();

    if (existing) {
      await db.moodLogs.update(existing.id, { mood, energy, notes: notes ?? '' });
    } else {
      await db.moodLogs.add({
        id: crypto.randomUUID(),
        date: today,
        mood,
        energy,
        notes: notes ?? '',
        createdAt: Date.now(),
      });
    }
  };

  return {
    log: log ?? null,
    setMood,
  };
}
