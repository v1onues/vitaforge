'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Task } from '@/lib/db/schema';

interface TaskCalendarProps {
  tasks: Task[];
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500',
  normal: 'bg-gray-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.deadline) {
        const dateStr = new Date(task.deadline).toISOString().split('T')[0];
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [startDayOfWeek, daysInMonth]);

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {MONTH_NAMES[month]} {year}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(new Date(year, month - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(new Date())}
          >
            Bugün
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(new Date(year, month + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[80px]" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate.get(dateStr) ?? [];

            return (
              <div
                key={day}
                className={`min-h-[80px] p-1 rounded-lg border text-sm transition-colors ${
                  isToday(day)
                    ? 'bg-primary/10 border-primary/30'
                    : 'border-transparent hover:bg-muted/50'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${
                        task.status === 'done'
                          ? 'bg-green-500/20 text-green-700 line-through'
                          : `${priorityColors[task.priority]}/20 text-foreground`
                      }`}
                      style={{
                        backgroundColor:
                          task.status === 'done'
                            ? undefined
                            : `var(--color-${task.priority === 'urgent' ? 'destructive' : task.priority === 'high' ? 'orange' : task.priority === 'low' ? 'blue' : 'muted'})`,
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayTasks.length - 3} daha
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
