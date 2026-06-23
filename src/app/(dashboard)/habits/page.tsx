'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Repeat, MoreHorizontal, Trash2, Edit, Archive, Check } from 'lucide-react';
import { useHabits, useHabitLogs } from '@/lib/hooks/use-habits';
import { HabitForm } from '@/components/habits/habit-form';
import { HabitGrid } from '@/components/habits/habit-grid';
import { StreakDisplay } from '@/components/habits/streak-display';
import { Habit } from '@/lib/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function HabitCard({ habit }: { habit: Habit }) {
  const today = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { logs, logHabit, removeLog } = useHabitLogs(habit.id, startDateStr, today);
  const todayLog = logs.find((l) => l.date === today);

  const streak = useMemo(() => {
    let current = 0;
    const todayDate = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs.find((l) => l.date === dateStr);
      if (log && log.value > 0) {
        current++;
      } else if (i > 0) {
        break;
      }
    }
    return current;
  }, [logs]);

  const longestStreak = useMemo(() => {
    let max = 0;
    let current = 0;
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((log) => {
      if (log.value > 0) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    });
    return max;
  }, [logs]);

  const completionRate = useMemo(() => {
    if (logs.length === 0) return 0;
    const completed = logs.filter((l) => l.value > 0).length;
    return Math.round((completed / logs.length) * 100);
  }, [logs]);

  const handleToggle = async () => {
    if (todayLog && todayLog.value > 0) {
      await removeLog(today);
    } else {
      await logHabit(today, habit.targetValue ?? 1);
    }
  };

  const frequencyLabel = habit.frequency === 'daily' ? 'Günlük' : habit.frequency === 'weekly' ? 'Haftalık' : 'Özel';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: habit.color + '20' }}
          >
            <Repeat className="w-5 h-5" style={{ color: habit.color }} />
          </div>
          <div>
            <CardTitle className="text-base">{habit.name}</CardTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                {frequencyLabel}
              </Badge>
              {habit.targetValue && (
                <span className="text-xs text-muted-foreground">
                  {habit.targetValue} {habit.unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={todayLog && todayLog.value > 0 ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggle}
            style={
              todayLog && todayLog.value > 0
                ? { backgroundColor: habit.color, borderColor: habit.color }
                : {}
            }
          >
            <Check className="w-4 h-4 mr-1" />
            {todayLog && todayLog.value > 0 ? 'Tamamlandı' : 'Tamamla'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <StreakDisplay
          currentStreak={streak}
          longestStreak={longestStreak}
          completionRate={completionRate}
          color={habit.color}
        />
        <div className="overflow-x-auto">
          <HabitGrid logs={logs} color={habit.color} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HabitsPage() {
  const { habits, addHabit, updateHabit, archiveHabit, deleteHabit } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | undefined>();

  const handleEdit = (habit: Habit) => {
    setEditHabit(habit);
    setShowForm(true);
  };

  const handleArchive = async (habit: Habit) => {
    await archiveHabit(habit.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu alışkanlığı silmek istediğine emin misin?')) {
      await deleteHabit(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alışkanlıklar</h1>
          <p className="text-muted-foreground">{habits.length} alışkanlık</p>
        </div>
        <Button onClick={() => { setEditHabit(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Alışkanlık
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Repeat className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Henüz alışkanlık yok</h3>
              <p className="mb-4">İlk alışkanlığını oluşturarak başla</p>
              <Button onClick={() => { setEditHabit(undefined); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Alışkanlığı Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="relative group">
              <HabitCard habit={habit} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(habit)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchive(habit)}>
                      <Archive className="w-4 h-4 mr-2" />
                      Arşivle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(habit.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <HabitForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editHabit ? (data) => updateHabit(editHabit.id, data) : addHabit}
        initialData={editHabit}
      />
    </div>
  );
}
