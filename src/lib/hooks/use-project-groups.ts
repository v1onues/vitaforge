'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, ProjectGroup } from '../db/schema';

export function useProjectGroups(projectId: string | null) {
  const groups = useLiveQuery(
    () => {
      if (!projectId) return Promise.resolve<ProjectGroup[]>([]);
      return db.projectGroups.where('projectId').equals(projectId).sortBy('order');
    },
    [projectId]
  );

  const addGroup = async (group: Omit<ProjectGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.projectGroups.add({
      ...group,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateGroup = async (id: string, updates: Partial<Omit<ProjectGroup, 'id' | 'createdAt'>>) => {
    await db.projectGroups.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const deleteGroup = async (id: string) => {
    await db.projectGroups.delete(id);
    // Unlink tasks from this group
    await db.tasks.where('groupId').equals(id).modify({ groupId: null });
  };

  return {
    groups: groups ?? [],
    isLoading: groups === undefined,
    addGroup,
    updateGroup,
    deleteGroup,
  };
}
