'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FolderKanban,
  CheckSquare,
  Repeat,
  TrendingUp,
  Plus,
  Flag,
  Check,
  Clock,
  AlertCircle,
  Smile,
  Zap,
  Frown,
  Meh,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useHabits } from '@/lib/hooks/use-habits';
import { useMoodLog } from '@/lib/hooks/use-mood';
import { PomodoroTimer } from '@/components/shared/pomodoro-timer';
import { FocusMode } from '@/components/shared/focus-mode';
import { AiDashboardSummary } from '@/components/shared/ai-summary';
import { StoicQuote } from '@/components/shared/stoic-quote';
import { ServerMonitor } from '@/components/shared/server-monitor';
import Link from 'next/link';

const MOTIVATIONAL_QUOTES = [
  'Küçük adımlar büyük değişimlere yol açar.',
  'Bugün dünden daha iyi olman için bir fırsat.',
  'Tutarlılık yetenekten daha önemlidir.',
  'Hedefine giden yolculukta her adım sayar.',
  'Başarı, her gün tekrarlanan küçük çabaların toplamıdır.',
  'Kendine inan, yolculuğun zaten yarısını geçtin.',
  'En iyi zaman şimdi. İkinci en iyi zaman ise hiç.',
  'Disiplin, hayal ile gerçeklik arasındaki köprüdür.',
  'Bugün yapabileceğin şeyleri yarına bırakma.',
  'Her tamamlanan görev, hedefine bir adım daha yaklaştırır.',
];

export default function DashboardPage() {
  const { projects } = useProjects('active');
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { log: todayMood, setMood } = useMoodLog();

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => {
    if (!t.deadline) return false;
    const deadlineDate = new Date(t.deadline).toISOString().split('T')[0];
    return deadlineDate === today;
  });

  const completedToday = tasks.filter((t) => {
    if (!t.completedAt) return false;
    return new Date(t.completedAt).toISOString().split('T')[0] === today;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityConfig = {
    low: { label: 'Düşük', color: 'text-blue-500' },
    normal: { label: 'Normal', color: 'text-gray-500' },
    high: { label: 'Yüksek', color: 'text-orange-500' },
    urgent: { label: 'Acil', color: 'text-red-500' },
  };

  const statusConfig = {
    todo: { label: 'Yapılacak', icon: Clock, color: 'bg-gray-500/10 text-gray-500' },
    in_progress: { label: 'Devam Ediyor', icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-500' },
    waiting: { label: 'Beklemede', icon: Clock, color: 'bg-blue-500/10 text-blue-500' },
    done: { label: 'Tamamlandı', icon: Check, color: 'bg-green-500/10 text-green-500' },
  };

  const dailyQuote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <FocusMode />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Projeler</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length === 0 ? 'Henüz proje yok' : 'aktif proje'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Görevler</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedToday.length} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Streak</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habits.length}</div>
            <p className="text-xs text-muted-foreground">
              {habits.length === 0 ? 'Alışkanlık yok' : 'takip edilen'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanma</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? `%${completionRate}` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0
                ? `${completedTasks}/${totalTasks} görev`
                : 'Henüz veri yok'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Weekly Summary */}
      <AiDashboardSummary />

      {/* Motivational Quote */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4">
          <p className="text-sm italic text-center text-muted-foreground">
            &ldquo;{dailyQuote}&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Mood / Energy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5" />
            Bugünkü Ruh Halin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Ruh Hali</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Button
                    key={v}
                    variant={todayMood?.mood === v ? 'default' : 'outline'}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => setMood(v, todayMood?.energy ?? 3)}
                  >
                    {v === 1 ? <Frown className="w-5 h-5" /> : v === 2 ? <Meh className="w-5 h-5" /> : v === 3 ? <Meh className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Enerji
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Button
                    key={v}
                    variant={todayMood?.energy === v ? 'default' : 'outline'}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => setMood(todayMood?.mood ?? 3, v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bugünün Görevleri</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bugün için deadline olan görev yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                    <Badge variant="secondary" className={`text-xs ${priorityConfig[task.priority].color}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {priorityConfig[task.priority].label}
                    </Badge>
                    <span className={task.status === 'done' ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>
                      {task.title}
                    </span>
                    <Badge variant="secondary" className={statusConfig[task.status].color}>
                      {statusConfig[task.status].label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pomodoro Timer */}
        <PomodoroTimer />

        {/* Stoic Quote */}
        <StoicQuote />

        {/* Server Monitor */}
        <ServerMonitor />

        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktif Projeler</CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz proje yok</p>
                <Link href="/projects">
                  <Button variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Proje Oluştur
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: project.color + '20' }}
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: project.color }} />
                      </div>
                      <span className="font-medium truncate">{project.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Habits Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alışkanlık Takibi</CardTitle>
          <Link href="/habits">
            <Button variant="ghost" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Repeat className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Henüz alışkanlık yok</p>
              <Link href="/habits">
                <Button variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Alışkanlık Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {habits.slice(0, 6).map((habit) => (
                <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: habit.color + '20' }}
                  >
                    <Repeat className="w-4 h-4" style={{ color: habit.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{habit.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {habit.frequency === 'daily' ? 'Günlük' : habit.frequency === 'weekly' ? 'Haftalık' : 'Özel'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
