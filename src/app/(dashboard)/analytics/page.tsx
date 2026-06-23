'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, CheckSquare, Flame, Target } from 'lucide-react';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useGoals } from '@/lib/hooks/use-goals';

function getWeekDates(offset = 0): string[] {
  const dates: string[] = [];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function getMonthDates(offset = 0): string[] {
  const dates: string[] = [];
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(month.getFullYear(), month.getMonth(), i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export default function AnalyticsPage() {
  const { tasks } = useTasks();
  const { goals } = useGoals();

  const thisWeek = useMemo(() => getWeekDates(0), []);
  const lastWeek = useMemo(() => getWeekDates(-1), []);
  const thisMonth = useMemo(() => getMonthDates(0), []);

  // Task stats
  const completedThisWeek = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const date = new Date(t.completedAt).toISOString().split('T')[0];
    return thisWeek.includes(date);
  }).length;

  const completedLastWeek = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const date = new Date(t.completedAt).toISOString().split('T')[0];
    return lastWeek.includes(date);
  }).length;

  const completedThisMonth = tasks.filter((t) => {
    if (!t.completedAt) return false;
    const date = new Date(t.completedAt).toISOString().split('T')[0];
    return thisMonth.includes(date);
  }).length;

  // Tasks by day of week
  const tasksByDay = useMemo(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return days.map((day, i) => {
      const count = tasks.filter((t) => {
        if (!t.completedAt) return false;
        const d = new Date(t.completedAt);
        const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
        return dayOfWeek === i;
      }).length;
      return { day, count };
    });
  }, [tasks]);

  const maxTasksPerDay = Math.max(1, ...tasksByDay.map((d) => d.count));

  // Priority distribution
  const priorityStats = useMemo(() => {
    const active = tasks.filter((t) => t.status !== 'done');
    return [
      { label: 'Acil', count: active.filter((t) => t.priority === 'urgent').length, color: 'bg-red-500' },
      { label: 'Yüksek', count: active.filter((t) => t.priority === 'high').length, color: 'bg-orange-500' },
      { label: 'Normal', count: active.filter((t) => t.priority === 'normal').length, color: 'bg-gray-500' },
      { label: 'Düşük', count: active.filter((t) => t.priority === 'low').length, color: 'bg-blue-500' },
    ];
  }, [tasks]);

  // Goal completion rate
  const goalStats = useMemo(() => {
    const active = goals.filter((g) => g.status === 'active');
    const completed = goals.filter((g) => g.status === 'completed');
    const total = active.length + completed.length;
    return {
      active: active.length,
      completed: completed.length,
      rate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    };
  }, [goals]);

  const weekChange = completedLastWeek > 0
    ? Math.round(((completedThisWeek - completedLastWeek) / completedLastWeek) * 100)
    : completedThisWeek > 0 ? 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          İstatistikler
        </h1>
        <p className="text-muted-foreground">Performansını analiz et</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeek}</div>
            <p className={`text-xs ${weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {weekChange >= 0 ? '+' : ''}{weekChange}% geçen haftaya göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">görev tamamlandı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status !== 'done').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.status === 'in_progress').length} devam ediyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hedefler</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{goalStats.rate}</div>
            <p className="text-xs text-muted-foreground">
              {goalStats.completed}/{goalStats.active + goalStats.completed} tamamlandı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Haftalık Görev Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {tasksByDay.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/20 rounded-t" style={{ height: `${(d.count / maxTasksPerDay) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }} />
                  <span className="text-xs text-muted-foreground">{d.day}</span>
                  <span className="text-xs font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Öncelik Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityStats.map((p) => {
                const total = priorityStats.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? (p.count / total) * 100 : 0;
                return (
                  <div key={p.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{p.label}</span>
                      <span className="text-muted-foreground">{p.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
