import { db } from '../db/schema';

/**
 * Recurring pattern formatları:
 * - "daily" → her gün
 * - "weekly:1" → her Pazartesi (1=Pzt, 7=Paz)
 * - "weekly:1,3,5" → Pzt, Çar, Cum
 * - "monthly:1" → her ayın 1'i
 * - "monthly:1,15" → her ayın 1'i ve 15'i
 */

function getDaysOfWeek(pattern: string): number[] {
  const match = pattern.match(/weekly:(.+)/);
  if (!match) return [];
  return match[1].split(',').map(Number);
}

function getDaysOfMonth(pattern: string): number[] {
  const match = pattern.match(/monthly:(.+)/);
  if (!match) return [];
  return match[1].split(',').map(Number);
}

function shouldCreateToday(pattern: string, lastRecurringAt: number | null): boolean {
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun, 1=Mon, ...
  const todayDate = today.getDate();

  // If already created today, skip
  if (lastRecurringAt) {
    const lastDate = new Date(lastRecurringAt);
    if (
      lastDate.getFullYear() === today.getFullYear() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getDate() === today.getDate()
    ) {
      return false;
    }
  }

  if (pattern === 'daily') {
    return true;
  }

  if (pattern.startsWith('weekly:')) {
    const days = getDaysOfWeek(pattern);
    // Convert JS day (0=Sun) to our format (1=Mon, 7=Sun)
    const jsDayToOur = todayDay === 0 ? 7 : todayDay;
    return days.includes(jsDayToOur);
  }

  if (pattern.startsWith('monthly:')) {
    const days = getDaysOfMonth(pattern);
    return days.includes(todayDate);
  }

  return false;
}

export async function processRecurringTasks() {
  const tasks = await db.tasks
    .where('recurringPattern')
    .notEqual('')
    .and((t) => t.recurringPattern !== null)
    .toArray();

  let created = 0;

  for (const task of tasks) {
    if (!task.recurringPattern) continue;
    if (task.status !== 'done') continue; // Only create new instance after completion

    if (shouldCreateToday(task.recurringPattern, task.lastRecurringAt)) {
      // Create a new task instance
      const newDeadline = task.deadline
        ? calculateNextDeadline(task.deadline, task.recurringPattern)
        : null;

      await db.tasks.add({
        ...task,
        id: crypto.randomUUID(),
        status: 'todo',
        completedAt: null,
        deadline: newDeadline,
        lastRecurringAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Mark original as recurring done
      await db.tasks.update(task.id, {
        lastRecurringAt: Date.now(),
      });

      created++;
    }
  }

  return created;
}

function calculateNextDeadline(currentDeadline: number, pattern: string): number {
  const date = new Date(currentDeadline);

  if (pattern === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (pattern.startsWith('weekly:')) {
    date.setDate(date.getDate() + 7);
  } else if (pattern.startsWith('monthly:')) {
    date.setMonth(date.getMonth() + 1);
  }

  return date.getTime();
}

/**
 * Recurring task descriptini Türkçe'ye çevir
 */
export function getRecurringLabel(pattern: string | null): string {
  if (!pattern) return '';
  if (pattern === 'daily') return 'Her gün';
  if (pattern === 'weekly:1') return 'Her Pazartesi';
  if (pattern === 'weekly:1,3,5') return 'Pzt-Çar-Cum';
  if (pattern === 'weekly:2,4') return 'Sal-Per';
  if (pattern === 'monthly:1') return 'Her ayın 1\'i';
  if (pattern === 'monthly:1,15') return 'Her ayın 1\'i ve 15\'i';
  return pattern;
}
