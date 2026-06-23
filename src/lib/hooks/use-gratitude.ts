'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';

export function useGratitude(date?: string) {
  const today = date ?? new Date().toISOString().split('T')[0];

  const entry = useLiveQuery(
    () => db.gratitudeEntries.where('date').equals(today).first(),
    [today]
  );

  const allEntries = useLiveQuery(
    () => db.gratitudeEntries.orderBy('date').reverse().toArray(),
    []
  );

  const saveEntry = async (items: string[]) => {
    const trimmed = items.filter((i) => i.trim()).slice(0, 3);
    const existing = await db.gratitudeEntries.where('date').equals(today).first();

    if (existing) {
      await db.gratitudeEntries.update(existing.id, { items: trimmed, updatedAt: Date.now() });
    } else {
      await db.gratitudeEntries.add({
        id: crypto.randomUUID(),
        date: today,
        items: trimmed,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

  return { entry: entry ?? null, allEntries: allEntries ?? [], saveEntry };
}
