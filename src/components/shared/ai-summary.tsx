'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { db } from '@/lib/db/schema';

export function AiDashboardSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<{ apiKey: string; provider: string; model: string } | null>(null);

  useEffect(() => {
    db.settings.get('main').then((s) => {
      if (s && s.aiApiKey) {
        setSettings({ apiKey: s.aiApiKey, provider: s.aiProvider || 'openrouter', model: s.aiModel || '' });
      }
    });
  }, []);

  const generateSummary = async () => {
    if (!settings) return;
    setLoading(true);
    setError('');

    try {
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date(weekAgo).toISOString().split('T')[0];

      const [tasks, moods, habits, habitLogs, journalEntries, transactions] = await Promise.all([
        db.tasks.toArray(),
        db.moodLogs.toArray(),
        db.habits.toArray(),
        db.habitLogs.toArray(),
        db.journalEntries.toArray(),
        db.transactions.toArray(),
      ]);

      const completedTasks = tasks.filter((t) => t.completedAt && t.completedAt >= weekAgo);
      const recentMoods = moods.filter((m) => m.date >= weekStart);
      const avgMood = recentMoods.length > 0 ? Math.round(recentMoods.reduce((s, m) => s + m.mood, 0) / recentMoods.length) : 0;
      const recentHabitLogs = habitLogs.filter((h) => h.date >= weekStart);
      const habitStreak = habits.filter((h) => {
        const lastLog = habitLogs.filter((l) => l.habitId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
        return lastLog && lastLog.date >= today;
      }).length;

      const recentIncome = transactions.filter((t) => t.type === 'income' && t.date >= weekStart).reduce((s, t) => s + t.amount, 0);
      const recentExpense = transactions.filter((t) => t.type === 'expense' && t.date >= weekStart).reduce((s, t) => s + Math.abs(t.amount), 0);
      const journalCount = journalEntries.filter((j) => j.date >= weekStart).length;

      const dataSummary = [
        `Son 7 günde ${completedTasks.length} görev tamamlandı.`,
        `Toplam ${tasks.length} görev var, ${tasks.filter((t) => t.status === 'done').length} tanesi tamamlanmış.`,
        `Ortalama ruh hali: ${avgMood}/5 (${recentMoods.length} kayıt).`,
        `${habitStreak} alışkanlık bugün işaretlendi, ${recentHabitLogs.length} alışkanlık kaydı var.`,
        recentIncome > 0 || recentExpense > 0 ? `Son hafta: ${Math.round(recentIncome).toLocaleString('tr-TR')} TL gelir, ${Math.round(recentExpense).toLocaleString('tr-TR')} TL gider.` : '',
        `${journalCount} günlük girişi.`,
      ].filter(Boolean).join(' ');

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Sen kişisel bir yaşam asistanısın. Verilen verilere göre kısa, motive edici bir haftalık özet hazırla.
- Verileri analiz et, anlamlı içgörüler çıkar.
- Olumlu bir ton kullan, motive et.
- Çok kısa ol: en fazla 3 cümle.
- Türkçe yanıtla.
- Veriler boşsa "Henüz yeterli veri yok, uygulamayı kullanmaya devam ettikçe burada haftalık özetler göreceksin." yaz.`,
            },
            { role: 'user', content: `Son haftanın verileri: ${dataSummary}` },
          ],
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model || (settings.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'openai/gpt-4o-mini'),
          tool_choice: 'none',
        }),
      });

      if (!res.ok) throw new Error('API hatası');
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      setSummary(content || 'Özet alınamadı.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {summary ? (
              <p className="text-sm text-muted-foreground">{summary}</p>
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Özet hazırlanıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Haftalık AI özetini görmek ister misin?</p>
                <Button variant="outline" size="sm" onClick={generateSummary}>
                  <Sparkles className="w-3 h-3 mr-1" />Özet Oluştur
                </Button>
              </div>
            )}
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
