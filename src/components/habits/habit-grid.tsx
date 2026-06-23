'use client';

import { cn } from '@/lib/utils';
import { HabitLog } from '@/lib/db/schema';

interface HabitGridProps {
  logs: HabitLog[];
  color: string;
}

function getDaysInRange(startDate: Date, endDate: Date) {
  const days = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function getWeeksFromDays(days: Date[]) {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day) => {
    currentWeek.push(day);
    if (day.getDay() === 6 || day === days[days.length - 1]) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return weeks;
}

export function HabitGrid({ logs, color }: HabitGridProps) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  const days = getDaysInRange(startDate, today);
  const weeks = getWeeksFromDays(days);

  const logMap = new Map(logs.map((l) => [l.date, l.value]));
  const maxValue = Math.max(1, ...logs.map((l) => l.value));

  const dayLabels = ['P', 'P', 'S', 'Ç', 'C', 'C', 'P'];

  return (
    <div className="flex gap-1 items-start">
      <div className="flex flex-col gap-1 mr-1">
        {dayLabels.map((label, i) => (
          <div key={i} className="w-4 h-3 text-[9px] text-muted-foreground flex items-center justify-center">
            {i % 2 === 1 ? label : ''}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
            const day = week[dayIndex];
            if (!day) return <div key={dayIndex} className="w-3 h-3" />;

            const dateStr = day.toISOString().split('T')[0];
            const value = logMap.get(dateStr) ?? 0;
            const intensity = value === 0 ? 0 : Math.ceil((value / maxValue) * 4);

            return (
              <div
                key={dayIndex}
                className={cn(
                  'w-3 h-3 rounded-sm transition-colors cursor-default',
                  intensity === 0 && 'bg-muted',
                  intensity === 1 && 'opacity-30',
                  intensity === 2 && 'opacity-50',
                  intensity === 3 && 'opacity-75',
                  intensity >= 4 && 'opacity-100'
                )}
                style={{
                  backgroundColor: intensity > 0 ? color : undefined,
                }}
                title={`${dateStr}: ${value}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
