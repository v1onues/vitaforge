'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFitness } from '@/lib/hooks/use-fitness';
import {
  Dumbbell, Flame, Droplets, TrendingUp, Calendar, Zap,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Ağırlık', icon: Dumbbell },
  { value: 'cardio', label: 'Kardiyo', icon: Flame },
  { value: 'walk', label: 'Yürüyüş', icon: TrendingUp },
  { value: 'yoga', label: 'Yoga', icon: Zap },
];

export default function SportPage() {
  const { upsertLog, logs, getStreak, getWeightLogs } = useFitness();
  const [weekOffset, setWeekOffset] = useState(0);
  const streak = getStreak();
  const weightLogs = getWeightLogs();
  const lastWeight = weightLogs[weightLogs.length - 1]?.weight;
  const firstWeight = weightLogs[0]?.weight;
  const weightDiff = lastWeight && firstWeight ? (lastWeight - firstWeight).toFixed(1) : null;

  // Generate last 7 days starting from weekOffset
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i) - weekOffset * 7);
    return d;
  });
  const weekStart = days[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  const weekEnd = days[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  const weekLogs = days.map((d) => {
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === dateStr);
    return { date: dateStr, dayName: d.toLocaleDateString('tr-TR', { weekday: 'short' }), dayNum: d.getDate(), log };
  });

  const weekCalories = weekLogs.reduce((sum, d) => sum + (d.log?.calories ?? 0), 0);
  const weekWorkouts = weekLogs.filter((d) => d.log?.workoutDone).length;

  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find((l) => l.date === today);

  const todayWater = todayLog?.water ?? 0;
  const todayWorkout = todayLog?.workoutDone ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Spor & Saglik</h1>
      </div>

      {/* Today's Quick Entry */}
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardContent className="py-5 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bugun</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Workout toggle */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Antrenman</label>
              <div className="flex flex-wrap gap-1.5">
                {WORKOUT_TYPES.map((wt) => (
                  <Button
                    key={wt.value}
                    variant={todayLog?.workoutType === wt.value ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => upsertLog(today, {
                      workoutDone: true,
                      workoutType: todayLog?.workoutType === wt.value ? '' : wt.value,
                      workoutDuration: todayLog?.workoutDuration || 30,
                    })}
                  >
                    <wt.icon className="w-3 h-3 mr-1" />
                    {wt.label}
                  </Button>
                ))}
                {todayWorkout && (
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={() => upsertLog(today, { workoutDone: false, workoutType: '' })}>
                    Iptal
                  </Button>
                )}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Sure (dk)</label>
              <Input
                type="number"
                placeholder="30"
                value={todayLog?.workoutDuration || ''}
                onChange={(e) => upsertLog(today, { workoutDuration: Number(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>

            {/* Calories */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="w-3 h-3" /> Kalori</label>
              <Input
                type="number"
                placeholder="0"
                value={todayLog?.calories ?? ''}
                onChange={(e) => upsertLog(today, { calories: Number(e.target.value) || null })}
                className="h-8 text-xs"
              />
            </div>

            {/* Water */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3" /> Su (bardak)</label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 w-8" onClick={() => upsertLog(today, { water: Math.max(0, (todayLog?.water ?? 0) - 1) })}>-</Button>
                <span className="text-sm font-medium w-6 text-center">{todayWater}</span>
                <Button variant="outline" size="sm" className="h-8 w-8" onClick={() => upsertLog(today, { water: (todayLog?.water ?? 0) + 1 })}>+</Button>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Kilo (kg):</label>
            <Input
              type="number"
              step="0.1"
              placeholder="--"
              value={todayLog?.weight ?? ''}
              onChange={(e) => upsertLog(today, { weight: Number(e.target.value) || null })}
              className="h-8 text-xs w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <CardContent className="py-4 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold tabular-nums">{weekCalories}</p>
            <p className="text-xs text-muted-foreground">Haftalik Kalori</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <CardContent className="py-4 text-center">
            <Dumbbell className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold tabular-nums">{weekWorkouts}/7</p>
            <p className="text-xs text-muted-foreground">Antrenman</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <CardContent className="py-4 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold tabular-nums">{streak}</p>
            <p className="text-xs text-muted-foreground">Streak (gun)</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <CardContent className="py-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold tabular-nums">{lastWeight ?? '--'}</p>
            <p className="text-xs text-muted-foreground">Kilo {weightDiff ? `${weightDiff.startsWith('-') ? '' : '+'}${weightDiff}` : ''}</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Grid */}
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            {weekStart} - {weekEnd}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(weekOffset + 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekLogs.map((d) => (
              <div key={d.date} className="text-center space-y-1.5">
                <p className="text-xs text-muted-foreground">{d.dayName}</p>
                <p className="text-xs text-muted-foreground">{d.dayNum}</p>
                <div
                  className={`w-full aspect-square rounded-sm flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                    d.log?.workoutDone
                      ? d.log?.workoutType === 'strength' ? 'bg-blue-500 text-white'
                      : d.log?.workoutType === 'cardio' ? 'bg-orange-500 text-white'
                      : d.log?.workoutType === 'walk' ? 'bg-green-500 text-white'
                      : d.log?.workoutType === 'yoga' ? 'bg-purple-500 text-white'
                      : 'bg-primary text-primary-foreground'
                      : d.date === today ? 'bg-muted'
                      : 'bg-muted/30'
                  }`}
                  onClick={() => {
                    const l = logs.find((l) => l.date === d.date);
                    if (l) upsertLog(d.date, { workoutDone: !l.workoutDone });
                  }}
                >
                  {d.log?.workoutDone ? (
                    d.log?.workoutType === 'strength' ? <Dumbbell className="w-3.5 h-3.5" />
                    : d.log?.workoutType === 'cardio' ? <Flame className="w-3.5 h-3.5" />
                    : d.log?.workoutType === 'walk' ? <TrendingUp className="w-3.5 h-3.5" />
                    : d.log?.workoutType === 'yoga' ? <Zap className="w-3.5 h-3.5" />
                    : <Dumbbell className="w-3.5 h-3.5" />
                  ) : null}
                </div>
                <div className="flex items-center justify-center gap-0.5">
                  {Array.from({ length: d.log?.water ?? 0 }, (_, i) => (
                    <Droplets key={i} className="w-2 h-2 text-blue-400" />
                  ))}
                </div>
                {d.log?.calories ? <p className="text-[10px] text-muted-foreground">{d.log.calories}</p> : <p className="text-[10px]">&nbsp;</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      {weightLogs.length > 1 && (
        <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Kilo Ilerlemesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-24">
              {/* SVG line chart */}
              <svg viewBox={`0 0 ${weightLogs.length * 20} 100`} className="w-full h-full" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                  vectorEffect="non-scaling-stroke"
                  points={weightLogs.map((w, i) => {
                    const min = Math.min(...weightLogs.map((x) => x.weight));
                    const max = Math.max(...weightLogs.map((x) => x.weight));
                    const range = max - min || 1;
                    const y = 90 - ((w.weight - min) / range) * 80;
                    return `${i * 20 + 10},${y}`;
                  }).join(' ')}
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
