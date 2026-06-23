'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, DictionLog } from '../db/schema';

export function useDiction() {
  const logs = useLiveQuery(() => db.dictionLogs.orderBy('date').toArray());

  const addLog = async (data: Omit<DictionLog, 'id' | 'createdAt'>) => {
    await db.dictionLogs.add({
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    });
  };

  const getStreak = (): number => {
    if (!logs) return 0;
    const sorted = [...logs].filter((l) => l.completed).sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (sorted[i]?.date === expected.toISOString().split('T')[0]) streak++;
      else break;
    }
    return streak;
  };

  return {
    logs: logs ?? [],
    isLoading: logs === undefined,
    addLog,
    getStreak,
  };
}
