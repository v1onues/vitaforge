'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Goal, LifeArea } from '../db/schema';

export function useGoals(lifeAreaFilter?: string) {
  const goals = useLiveQuery(
    async () => {
      let results = await db.goals.toArray();
      if (lifeAreaFilter) {
        results = results.filter((g) => g.lifeArea === lifeAreaFilter);
      }
      return results.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [lifeAreaFilter]
  );

  const objectives = useLiveQuery(
    () => db.goals.where('type').equals('objective').toArray(),
    []
  );

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.goals.add({
      ...goal,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    await db.goals.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const deleteGoal = async (id: string) => {
    await db.goals.delete(id);
    // Delete key results
    const krs = await db.goals.where('parentId').equals(id).toArray();
    if (krs.length > 0) {
      await db.goals.bulkDelete(krs.map((k) => k.id));
    }
  };

  return {
    goals: goals ?? [],
    objectives: objectives ?? [],
    isLoading: goals === undefined,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}

export function useLifeAreas() {
  const areas = useLiveQuery(
    () => db.lifeAreas.toArray(),
    []
  );

  const updateArea = async (id: string, updates: Partial<Omit<LifeArea, 'id'>>) => {
    await db.lifeAreas.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const initAreas = async () => {
    const count = await db.lifeAreas.count();
    if (count > 0) return;

    const defaultAreas: Omit<LifeArea, 'id' | 'updatedAt'>[] = [
      { name: 'Kariyer', icon: 'Briefcase', color: '#3b82f6', currentScore: 5, targetScore: 8, notes: '' },
      { name: 'Finans', icon: 'Wallet', color: '#10b981', currentScore: 5, targetScore: 7, notes: '' },
      { name: 'Sağlık', icon: 'Heart', color: '#ef4444', currentScore: 5, targetScore: 8, notes: '' },
      { name: 'İlişkiler', icon: 'Users', color: '#f59e0b', currentScore: 5, targetScore: 7, notes: '' },
      { name: 'Eğitim', icon: 'BookOpen', color: '#8b5cf6', currentScore: 5, targetScore: 8, notes: '' },
      { name: 'Eğlence', icon: 'Gamepad2', color: '#ec4899', currentScore: 5, targetScore: 6, notes: '' },
      { name: 'Ruh Hali', icon: 'Smile', color: '#06b6d4', currentScore: 5, targetScore: 8, notes: '' },
      { name: 'Çevre', icon: 'Home', color: '#84cc16', currentScore: 5, targetScore: 7, notes: '' },
    ];

    await db.lifeAreas.bulkAdd(
      defaultAreas.map((a) => ({
        ...a,
        id: crypto.randomUUID(),
        updatedAt: Date.now(),
      }))
    );
  };

  return {
    areas: areas ?? [],
    isLoading: areas === undefined,
    updateArea,
    initAreas,
  };
}
