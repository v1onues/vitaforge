'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Habit } from '../db/schema';

export function useHabits() {
  const habits = useLiveQuery(
    () => db.habits.where('archived').equals(0).toArray(),
    []
  );

  const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    await db.habits.add({
      ...habit,
      id,
      createdAt: Date.now(),
    });
    return id;
  };

  const updateHabit = async (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
    await db.habits.update(id, updates);
  };

  const archiveHabit = async (id: string) => {
    await db.habits.update(id, { archived: true });
  };

  const deleteHabit = async (id: string) => {
    await db.habits.delete(id);
    await db.habitLogs.where('habitId').equals(id).delete();
  };

  return {
    habits: habits ?? [],
    isLoading: habits === undefined,
    addHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
  };
}

export function useHabitLogs(habitId: string, startDate?: string, endDate?: string) {
  const logs = useLiveQuery(
    () => {
      let query = db.habitLogs.where('habitId').equals(habitId);
      if (startDate && endDate) {
        query = query.filter(
          (log) => log.date >= startDate && log.date <= endDate
        );
      }
      return query.toArray();
    },
    [habitId, startDate, endDate]
  );

  const logHabit = async (date: string, value: number, notes?: string) => {
    const existing = await db.habitLogs
      .where('[habitId+date]')
      .equals([habitId, date])
      .first();

    if (existing) {
      await db.habitLogs.update(existing.id, { value, notes: notes ?? '' });
    } else {
      await db.habitLogs.add({
        id: crypto.randomUUID(),
        habitId,
        date,
        value,
        notes: notes ?? '',
        createdAt: Date.now(),
      });
    }
  };

  const removeLog = async (date: string) => {
    const existing = await db.habitLogs
      .where('[habitId+date]')
      .equals([habitId, date])
      .first();
    if (existing) {
      await db.habitLogs.delete(existing.id);
    }
  };

  return {
    logs: logs ?? [],
    isLoading: logs === undefined,
    logHabit,
    removeLog,
  };
}
