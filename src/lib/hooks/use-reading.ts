'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, ReadingItem } from '../db/schema';

export function useReading(statusFilter?: ReadingItem['status']) {
  const items = useLiveQuery(
    async () => {
      let results = await db.readingItems.toArray();
      if (statusFilter) {
        results = results.filter((i) => i.status === statusFilter);
      }
      return results.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [statusFilter]
  );

  const addItem = async (item: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = crypto.randomUUID();
    await db.readingItems.add({
      ...item,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  };

  const updateItem = async (id: string, updates: Partial<Omit<ReadingItem, 'id' | 'createdAt'>>) => {
    await db.readingItems.update(id, { ...updates, updatedAt: Date.now() });
  };

  const deleteItem = async (id: string) => {
    await db.readingItems.delete(id);
  };

  return { items: items ?? [], addItem, updateItem, deleteItem };
}
