'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, RadioStation } from '../db/schema';

export function useRadio() {
  const stations = useLiveQuery(
    () => db.radioStations.orderBy('order').toArray()
  );

  const addStation = async (data: Omit<RadioStation, 'id' | 'createdAt' | 'updatedAt' | 'isDefault' | 'order'>) => {
    const now = Date.now();
    const count = (await db.radioStations.count()) || 0;
    await db.radioStations.add({
      ...data,
      id: crypto.randomUUID(),
      order: count,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateStation = async (id: string, updates: Partial<Omit<RadioStation, 'id' | 'createdAt'>>) => {
    await db.radioStations.update(id, { ...updates, updatedAt: Date.now() });
  };

  const deleteStation = async (id: string) => {
    const station = await db.radioStations.get(id);
    if (station?.isDefault) {
      await db.radioStations.update(id, { order: -1, updatedAt: Date.now() });
    } else {
      await db.radioStations.delete(id);
    }
  };

  const toggleStation = async (id: string) => {
    const s = await db.radioStations.get(id);
    if (s) {
      const count = (await db.radioStations.where('order').aboveOrEqual(0).count()) || 0;
      await db.radioStations.update(id, {
        order: s.order < 0 ? count : -1,
        updatedAt: Date.now(),
      });
    }
  };

  return {
    stations: stations ?? [],
    isLoading: stations === undefined,
    addStation,
    updateStation,
    deleteStation,
    toggleStation,
  };
}
