import { db, Transaction } from '@/lib/db/schema';

export function processRecurringTransactions(transactions: Transaction[]): Transaction[] {
  const now = Date.now();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const newTransactions: Transaction[] = [];

  for (const t of transactions) {
    if (!t.recurringPattern || !t.lastRecurringAt) continue;

    const lastDate = new Date(t.lastRecurringAt);
    const shouldGenerate = (() => {
      switch (t.recurringPattern) {
        case 'monthly': {
          const monthsSince = Math.floor((now - lastDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
          return monthsSince >= 1;
        }
        case 'yearly': {
          const yearsSince = Math.floor((now - lastDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
          return yearsSince >= 1;
        }
        default:
          return false;
      }
    })();

    if (shouldGenerate) {
      const nextDate = new Date(lastDate);
      if (t.recurringPattern === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (t.recurringPattern === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

      const dateStr = nextDate.toISOString().slice(0, 10);
      if (dateStr.startsWith(currentMonth)) {
        newTransactions.push({
          ...t,
          id: crypto.randomUUID(),
          date: dateStr,
          lastRecurringAt: null,
          recurringPattern: null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return newTransactions;
}

export async function applyRecurringTransactions() {
  const all = await db.transactions.toArray();
  const recurring = all.filter((t) => t.recurringPattern && t.lastRecurringAt);
  const newTx = processRecurringTransactions(all);

  if (newTx.length > 0) {
    await db.transactions.bulkAdd(newTx);
  }

  const now = Date.now();
  for (const t of recurring) {
    const nextDate = new Date(t.lastRecurringAt!);
    if (t.recurringPattern === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (t.recurringPattern === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
    if (nextDate.getTime() <= now) {
      await db.transactions.update(t.id, { lastRecurringAt: now });
    }
  }
}

export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=TRY');
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates ?? null;
  } catch {
    return null;
  }
}

export function getBudgetAlerts(transactions: Transaction[]): { category: string; spent: number; limit: number }[] {
  const limits = transactions
    .filter((t) => t.budgetLimit && t.budgetLimit > 0)
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { limit: t.budgetLimit!, spent: 0 };
      return acc;
    }, {} as Record<string, { limit: number; spent: number }>);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = transactions.filter((t) => t.date.startsWith(currentMonth) && t.type === 'expense');

  for (const t of thisMonth) {
    if (limits[t.category]) {
      limits[t.category].spent += Math.abs(t.amount);
    }
  }

  return Object.entries(limits)
    .filter(([, v]) => v.spent > v.limit)
    .map(([category, v]) => ({ category, spent: v.spent, limit: v.limit }));
}
