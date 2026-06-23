'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';

export function useTimeTracking(taskId: string) {
  const entries = useLiveQuery(
    () => db.timeEntries.where('taskId').equals(taskId).reverse().sortBy('startTime'),
    [taskId]
  );

  const activeEntry = useLiveQuery(
    () =>
      db.timeEntries
        .where('taskId')
        .equals(taskId)
        .and((e) => e.endTime === null)
        .first(),
    [taskId]
  );

  const totalTime = (entries ?? []).reduce((sum, e) => sum + e.duration, 0);

  const startTimer = async (notes?: string) => {
    // Stop any existing timer for this task
    if (activeEntry) {
      await stopTimer(activeEntry.id);
    }

    // eslint-disable-next-line react-hooks/purity -- async callback, not render
    const now = Date.now();
    await db.timeEntries.add({
      id: crypto.randomUUID(),
      taskId,
      startTime: now,
      endTime: null,
      duration: 0,
      notes: notes ?? '',
      createdAt: now,
    });
  };

  const stopTimer = async (entryId: string) => {
    const entry = await db.timeEntries.get(entryId);
    if (!entry || entry.endTime) return;

    const duration = Math.floor((Date.now() - entry.startTime) / 1000);
    await db.timeEntries.update(entryId, {
      endTime: Date.now(),
      duration,
    });
  };

  const addManualEntry = async (durationMinutes: number, notes?: string) => {
    await db.timeEntries.add({
      id: crypto.randomUUID(),
      taskId,
      startTime: Date.now() - durationMinutes * 60 * 1000,
      endTime: Date.now(),
      duration: durationMinutes * 60,
      notes: notes ?? '',
      createdAt: Date.now(),
    });
  };

  const deleteEntry = async (entryId: string) => {
    await db.timeEntries.delete(entryId);
  };

  return {
    entries: entries ?? [],
    activeEntry: activeEntry ?? null,
    totalTime,
    isRunning: !!activeEntry,
    startTimer,
    stopTimer,
    addManualEntry,
    deleteEntry,
  };
}

export function useActiveTimer() {
  const [elapsed, setElapsed] = useState(0);
  const activeEntry = useLiveQuery(async () => {
    const entries = await db.timeEntries
      .filter((e) => e.endTime === null)
      .toArray();
    return entries[0] ?? null;
  }, []);

  useEffect(() => {
    if (!activeEntry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeEntry.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  return {
    activeEntry,
    elapsed,
    isRunning: !!activeEntry,
  };
}
