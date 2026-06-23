'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Tag } from '../db/schema';

export function useTags() {
  const tags = useLiveQuery(
    () => db.tags.orderBy('name').toArray(),
    []
  );

  const addTag = async (name: string, color: string) => {
    const existing = await db.tags.where('name').equals(name).first();
    if (existing) return existing.id;

    const id = crypto.randomUUID();
    await db.tags.add({
      id,
      name,
      color,
      createdAt: Date.now(),
    });
    return id;
  };

  const deleteTag = async (id: string) => {
    await db.tags.delete(id);
  };

  const updateTag = async (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => {
    await db.tags.update(id, updates);
  };

  return {
    tags: tags ?? [],
    isLoading: tags === undefined,
    addTag,
    deleteTag,
    updateTag,
  };
}
