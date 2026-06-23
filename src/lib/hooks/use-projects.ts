'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Project } from '../db/schema';

export function useProjects(statusFilter?: Project['status']) {
  const projects = useLiveQuery(
    () => {
      if (statusFilter) {
        return db.projects.where('status').equals(statusFilter).sortBy('order');
      }
      return db.projects.orderBy('order').toArray();
    },
    [statusFilter]
  );

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.projects.add({
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    await db.projects.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const deleteProject = async (id: string) => {
    await db.projects.delete(id);
    // Delete associated task groups
    await db.projectGroups.where('projectId').equals(id).delete();
    // Delete associated tasks
    await db.tasks.where('projectId').equals(id).delete();
  };

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    addProject,
    updateProject,
    deleteProject,
  };
}

export function useProject(id: string | null) {
  const project = useLiveQuery(
    () => (id ? db.projects.get(id) : undefined),
    [id]
  );

  return {
    project: project ?? null,
    isLoading: project === undefined,
  };
}
