'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Note } from '../db/schema';

export function useNotes(tagFilter?: string) {
  const notes = useLiveQuery(
    async () => {
      let results = await db.notes.toArray();
      if (tagFilter) {
        results = results.filter((n) => n.tags.includes(tagFilter));
      }
      return results.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        return b.updatedAt - a.updatedAt;
      });
    },
    [tagFilter]
  );

  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.notes.add({
      ...note,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    await db.notes.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const deleteNote = async (id: string) => {
    await db.notes.delete(id);
  };

  const togglePin = async (id: string) => {
    const note = await db.notes.get(id);
    if (!note) return;
    await db.notes.update(id, {
      pinned: !note.pinned,
      updatedAt: Date.now(),
    });
  };

  return {
    notes: notes ?? [],
    isLoading: notes === undefined,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}

export function useNote(id: string | null) {
  const note = useLiveQuery(
    () => (id ? db.notes.get(id) : undefined),
    [id]
  );

  const linkedNotes = useLiveQuery(
    async () => {
      if (!note || note.links.length === 0) return [];
      return db.notes
        .where('id')
        .anyOf(note.links)
        .toArray();
    },
    [note?.links]
  );

  return {
    note: note ?? null,
    linkedNotes: linkedNotes ?? [],
    isLoading: note === undefined,
  };
}
