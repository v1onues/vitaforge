import { db } from '../db/schema';

export async function checkAutoBackup() {
  const settings = await db.settings.get('main');
  if (!settings?.autoBackup) return;

  const intervalMs = (settings.backupInterval ?? 24) * 60 * 60 * 1000;
  const lastBackup = settings.lastBackupAt;

  if (lastBackup && Date.now() - lastBackup < intervalMs) return;

  try {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: await db.projects.toArray(),
      tasks: await db.tasks.toArray(),
      habits: await db.habits.toArray(),
      habitLogs: await db.habitLogs.toArray(),
      notes: await db.notes.toArray(),
      goals: await db.goals.toArray(),
      lifeAreas: await db.lifeAreas.toArray(),
      moodLogs: await db.moodLogs.toArray(),
    };

    await db.backups.add({
      id: crypto.randomUUID(),
      encrypted: false,
      size: new Blob([JSON.stringify(data)]).size,
      createdAt: Date.now(),
      data: JSON.stringify(data),
    });

    await db.settings.update('main', { lastBackupAt: Date.now() });
  } catch {
    // Silently fail for auto-backup
  }
}
