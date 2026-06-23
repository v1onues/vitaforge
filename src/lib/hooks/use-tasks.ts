'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Task } from '../db/schema';

interface UseTasksOptions {
  projectId?: string | null;
  status?: Task['status'];
  parentId?: string | null;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { projectId, status, parentId } = options;

  const tasks = useLiveQuery(
    async () => {
      const collection = db.tasks.toCollection();
      let results = await collection.toArray();

      if (projectId !== undefined) {
        if (projectId === null) {
          results = results.filter((t) => t.projectId === null);
        } else {
          results = results.filter((t) => t.projectId === projectId);
        }
      }

      if (status !== undefined) {
        results = results.filter((t) => t.status === status);
      }

      if (parentId !== undefined) {
        if (parentId === null) {
          results = results.filter((t) => t.parentId === null);
        } else {
          results = results.filter((t) => t.parentId === parentId);
        }
      }

      return results.sort((a, b) => a.order - b.order);
    },
    [projectId, status, parentId]
  );

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.tasks.add({
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    await db.tasks.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const deleteTask = async (id: string) => {
    await db.tasks.delete(id);
    // Delete subtasks
    const subtasks = await db.tasks.where('parentId').equals(id).toArray();
    if (subtasks.length > 0) {
      await db.tasks.bulkDelete(subtasks.map((s) => s.id));
    }
  };

  const toggleDone = async (id: string) => {
    const task = await db.tasks.get(id);
    if (!task) return;
    const newStatus: Task['status'] = task.status === 'done' ? 'todo' : 'done';
    await db.tasks.update(id, {
      status: newStatus,
      completedAt: newStatus === 'done' ? Date.now() : null,
      updatedAt: Date.now(),
    });
  };

  return {
    tasks: tasks ?? [],
    isLoading: tasks === undefined,
    addTask,
    updateTask,
    deleteTask,
    toggleDone,
  };
}

export function useTask(id: string | null) {
  const task = useLiveQuery(
    () => (id ? db.tasks.get(id) : undefined),
    [id]
  );

  const subtasks = useLiveQuery(
    () => (id ? db.tasks.where('parentId').equals(id).toArray() : []),
    [id]
  );

  return {
    task: task ?? null,
    subtasks: (subtasks ?? []) as Task[],
    isLoading: task === undefined,
  };
}
