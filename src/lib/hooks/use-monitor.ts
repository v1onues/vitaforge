'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, MonitoredEndpoint } from '../db/schema';

export function useMonitor() {
  const endpoints = useLiveQuery(
    () => db.monitoredEndpoints.orderBy('order').toArray()
  );

  const addEndpoint = async (data: Omit<MonitoredEndpoint, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    await db.monitoredEndpoints.add({
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateEndpoint = async (id: string, updates: Partial<Omit<MonitoredEndpoint, 'id' | 'createdAt'>>) => {
    await db.monitoredEndpoints.update(id, { ...updates, updatedAt: Date.now() });
  };

  const deleteEndpoint = async (id: string) => {
    await db.monitoredEndpoints.delete(id);
  };

  const toggleEndpoint = async (id: string) => {
    const ep = await db.monitoredEndpoints.get(id);
    if (ep) await db.monitoredEndpoints.update(id, { enabled: !ep.enabled, updatedAt: Date.now() });
  };

  return {
    endpoints: endpoints ?? [],
    isLoading: endpoints === undefined,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
    toggleEndpoint,
  };
}
