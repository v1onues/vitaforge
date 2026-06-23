'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';

export function useJournal(date?: string) {
  const today = date ?? new Date().toISOString().split('T')[0];

  const entry = useLiveQuery(
    () => db.journalEntries.where('date').equals(today).first(),
    [today]
  );

  const allEntries = useLiveQuery(
    () => db.journalEntries.orderBy('date').reverse().toArray(),
    []
  );

  const saveEntry = async (data: {
    whatIDid: string;
    whatILearned: string;
    tomorrowPlan: string;
    mood: number;
  }) => {
    const existing = await db.journalEntries.where('date').equals(today).first();

    if (existing) {
      await db.journalEntries.update(existing.id, {
        ...data,
        updatedAt: Date.now(),
      });
    } else {
      await db.journalEntries.add({
        id: crypto.randomUUID(),
        date: today,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

  return {
    entry: entry ?? null,
    allEntries: allEntries ?? [],
    saveEntry,
  };
}
