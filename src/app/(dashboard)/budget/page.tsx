'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Transaction } from '@/lib/db/schema';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Wallet, TrendingUp, TrendingDown, Plus, Trash2, Repeat, AlertTriangle,
} from 'lucide-react';
import { applyRecurringTransactions, getBudgetAlerts } from '@/lib/api/budget';

const CATEGORIES = [
  'Maaş', 'Freelance', 'Yatırım', 'Kira', 'Fatura', 'Market',
  'Yeme-İçme', 'Ulaşım', 'Sağlık', 'Eğitim', 'Eğlence', 'Teknoloji',
  'Giyim', 'Hediye', 'Seyahat', 'Diğer',
];

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function formatTL(amount: number): string {
  return `${amount > 0 ? '+' : ''}${Math.round(amount).toLocaleString('tr-TR')} TL`;
}

function BudgetForm({ onDone, onSave, editing }: {
  onDone: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  editing?: Transaction | null;
}) {
  const [type, setType] = useState<'income' | 'expense'>(editing?.type ?? 'expense');
  const [amount, setAmount] = useState(editing ? String(Math.abs(editing.amount)) : '');
  const [category, setCategory] = useState(editing?.category ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState(!!editing?.recurringPattern);
  const [recurringPattern, setRecurringPattern] = useState<'monthly' | 'yearly'>((editing?.recurringPattern as 'monthly' | 'yearly') ?? 'monthly');
  const [budgetLimit, setBudgetLimit] = useState(editing?.budgetLimit ? String(editing.budgetLimit) : '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !category) return;
    setSaving(true);
    try {
      await onSave({
        type,
        amount: parseFloat(amount),
        currency: 'TRY',
        category,
        description,
        date,
        tags: [],
        recurringPattern: recurring ? recurringPattern : null,
        lastRecurringAt: recurring ? Date.now() : null,
        budgetLimit: budgetLimit ? parseFloat(budgetLimit) : null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onDone()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? 'İşlemi Düzenle' : 'Yeni İşlem'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant={type === 'expense' ? 'default' : 'outline'} onClick={() => setType('expense')} className="flex-1">
              <TrendingDown className="w-4 h-4 mr-2" />Gider
            </Button>
            <Button variant={type === 'income' ? 'default' : 'outline'} onClick={() => setType('income')} className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />Gelir
            </Button>
          </div>
          <Input type="number" placeholder="Tutar" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger><SelectValue placeholder="Kategori seç" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {type === 'expense' && (
            <Input type="number" placeholder="Bütçe limiti (opsiyonel, TL)" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} />
          )}
          <Input placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="rounded" />
            <Repeat className="w-4 h-4 text-muted-foreground" />
            Tekrarlanan işlem
          </label>
          {recurring && (
            <Select value={recurringPattern} onValueChange={(v) => v && setRecurringPattern(v as 'monthly' | 'yearly')}>
              <SelectTrigger><SelectValue>{recurringPattern === 'monthly' ? 'Her ay tekrarla' : 'Her yıl tekrarla'}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Her ay tekrarla</SelectItem>
                <SelectItem value="yearly">Her yıl tekrarla</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onDone()}>İptal</Button>
          <Button disabled={saving || !amount || !category} onClick={handleSave}>{editing ? 'Kaydet' : 'Ekle'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const months: { label: string; income: number; expense: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthTx = transactions.filter((t) => t.date.startsWith(prefix));
    months.push({
      label: MONTH_NAMES[d.getMonth()],
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
    });
  }

  const maxVal = Math.max(...months.map((m) => Math.max(m.income, m.expense)), 1);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Aylık Karşılaştırma</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-end gap-3 h-40">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full flex flex-col items-center gap-0.5" style={{ height: `${(Math.max(m.income, m.expense) / maxVal) * 100}%`, maxHeight: '100%' }}>
                <div
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(m.income / maxVal) * 100}%`, minHeight: m.income > 0 ? 4 : 0 }}
                  title={`Gelir: ${formatTL(m.income)}`}
                />
                <div
                  className="w-full bg-red-500 rounded-b"
                  style={{ height: `${(m.expense / maxVal) * 100}%`, minHeight: m.expense > 0 ? 4 : 0 }}
                  title={`Gider: ${formatTL(-m.expense)}`}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1">{m.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BudgetPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Transaction | null>(null);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  const allTransactions = useLiveQuery(async () => {
    await applyRecurringTransactions();
    return await db.transactions.toArray();
  }, []);

  const filtered = (allTransactions ?? []).filter((t) => t.date.startsWith(monthFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const byCategory = filtered.filter((t) => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const alerts = getBudgetAlerts(allTransactions ?? []);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    await db.transactions.add({ ...data, amount, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() });
  };

  const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    await db.transactions.update(id, { ...data, updatedAt: Date.now() });
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Bu işlemi silmek istediğine emin misin?')) return;
    await db.transactions.delete(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6" />Bütçe
          </h1>
          <p className="text-muted-foreground">{(allTransactions ?? []).length} işlem</p>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {alerts.length} limit aşımı
            </div>
          )}
          <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-40" />
          <Button onClick={() => { setEditItem(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />İşlem Ekle</Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-1">
          {alerts.map((a) => (
            <p key={a.category} className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {a.category}: {formatTL(-a.spent)} harcandı (limit: {formatTL(-a.limit)})
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Gelir</p>
          <p className="text-2xl font-bold text-green-500">{formatTL(totalIncome)}</p>
        </CardContent></Card>
        <Card><CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Gider</p>
          <p className="text-2xl font-bold text-red-500">{formatTL(-totalExpense)}</p>
        </CardContent></Card>
        <Card><CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Kalan</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatTL(balance)}</p>
        </CardContent></Card>
      </div>

      <MonthlyChart transactions={allTransactions ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">İşlemler</CardTitle></CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Bu ayda işlem yok</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {t.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          {t.description || t.category}
                          {t.recurringPattern && <Repeat className="w-3 h-3 text-muted-foreground" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.category} · {new Date(t.date + 'T12:00:00').toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {formatTL(t.amount)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditItem(t); setShowForm(true); }}>
                        <TrendingUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteTransaction(t.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Kategorilere Göre Gider</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(byCategory).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Veri yok</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amt]) => {
                    const pct = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat}</span>
                          <span className="text-muted-foreground">{formatTL(-amt)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <BudgetForm
          key={editItem?.id ?? 'new'}
          onDone={() => { setShowForm(false); setEditItem(null); }}
          onSave={editItem ? (data) => updateTransaction(editItem.id, data) : addTransaction}
          editing={editItem}
        />
      )}
    </div>
  );
}
