'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, FitnessLog } from '../db/schema';

export function useFitness() {
  const logs = useLiveQuery(() => db.fitnessLogs.orderBy('date').toArray());

  const getLog = (date: string) =>
    logs?.find((l) => l.date === date) ?? null;

  const upsertLog = async (
    date: string,
    data: Partial<Omit<FitnessLog, 'id' | 'date' | 'createdAt' | 'updatedAt'>>
  ) => {
    const existing = logs?.find((l) => l.date === date);
    const now = Date.now();
    if (existing) {
      await db.fitnessLogs.update(existing.id, { ...data, updatedAt: now });
    } else {
      await db.fitnessLogs.add({
        id: crypto.randomUUID(),
        date,
        workoutDone: false,
        workoutType: '',
        workoutDuration: 0,
        weight: null,
        calories: null,
        water: 0,
        notes: '',
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  const getStreak = (): number => {
    if (!logs) return 0;
    const sorted = [...logs].filter((l) => l.workoutDone).sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (sorted[i]?.date === expectedStr) {
        streak++;
      } else break;
    }
    return streak;
  };

  const getWeightLogs = () =>
    (logs ?? []).filter((l) => l.weight != null).map((l) => ({ date: l.date, weight: l.weight! }));

  const getLastNDays = (n: number) => {
    const result: FitnessLog[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = logs?.find((l) => l.date === dateStr);
      result.push(
        existing ?? {
          id: '',
          date: dateStr,
          workoutDone: false,
          workoutType: '',
          workoutDuration: 0,
          weight: null,
          calories: null,
          water: 0,
          notes: '',
          createdAt: 0,
          updatedAt: 0,
        }
      );
    }
    return result;
  };

  return {
    logs: logs ?? [],
    isLoading: logs === undefined,
    getLog,
    upsertLog,
    getStreak,
    getWeightLogs,
    getLastNDays,
  };
}
