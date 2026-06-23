'use client';

import { Flame, TrendingUp } from 'lucide-react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  color: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  completionRate,
  color,
}: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4" style={{ color }} />
        <span className="font-medium">{currentStreak}</span>
        <span className="text-muted-foreground">gün seri</span>
      </div>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">En uzun: {longestStreak}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">%{completionRate} tamamlanma</span>
      </div>
    </div>
  );
}
