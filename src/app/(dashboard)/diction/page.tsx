'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDiction } from '@/lib/hooks/use-diction';
import { Play, Square, RotateCcw, Clock, Zap, Calendar, ChevronDown } from 'lucide-react';

const DURATION = 600; // 10 minutes in seconds

export default function DictionPage() {
  const { logs, addLog, getStreak } = useDiction();
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streak = getStreak();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTimer = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(DURATION);
  };

  const handleComplete = async () => {
    const elapsed = DURATION - timeLeft;
    const today = new Date().toISOString().split('T')[0];
    await addLog({
      date: today,
      duration: elapsed,
      completed: elapsed >= DURATION * 0.8,
      notes,
    });
    resetTimer();
    setNotes('');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const elapsed = DURATION - timeLeft;
  const progress = (elapsed / DURATION) * 100;

  const displayLogs = showAll ? logs : logs.slice(0, 30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Diksiyon Pratiği</h1>
        <Badge variant="secondary" className="text-sm">
          <Zap className="w-3.5 h-3.5 mr-1" />
          {streak} gunluk streak
        </Badge>
      </div>

      {/* Timer */}
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardContent className="py-8 text-center space-y-6">
          {/* Progress ring */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-primary transition-all"
                strokeDasharray={`${progress * 2.827} 282.7`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums tracking-tight">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground mt-1">/ 10:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!running ? (
              <Button onClick={startTimer} disabled={timeLeft === 0} size="lg" className="rounded-full w-14 h-14">
                <Play className="w-6 h-6" />
              </Button>
            ) : (
              <Button onClick={stopTimer} variant="secondary" size="lg" className="rounded-full w-14 h-14">
                <Square className="w-5 h-5" />
              </Button>
            )}
            <Button variant="outline" size="icon" className="rounded-full w-10 h-10" onClick={resetTimer}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Complete */}
          {timeLeft < DURATION && (
            <div className="space-y-3 max-w-md mx-auto">
              <Textarea
                placeholder="Pratik notlari (zorlandigin kelimeler, vs.)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm min-h-[60px]"
              />
              <Button onClick={handleComplete} className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                {elapsed >= DURATION * 0.8 ? 'Tamamla ve Kaydet' : 'Erken Bitir ve Kaydet'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            Gecmis Pratikler
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Daralt' : 'Tumunu Goster'}
            <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="py-0 pb-3">
          {displayLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Henuz pratik kaydi yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left py-2 pr-4 font-medium">Tarih</th>
                    <th className="text-left py-2 pr-4 font-medium">Sure</th>
                    <th className="text-left py-2 pr-4 font-medium">Durum</th>
                    <th className="text-left py-2 font-medium">Notlar</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLogs.map((log) => {
                    const elapsedMin = Math.floor(log.duration / 60);
                    const elapsedSec = log.duration % 60;
                    return (
                      <tr key={log.id} className="border-b border-muted/30 hover:bg-muted/20">
                        <td className="py-2 pr-4 text-muted-foreground">
                          {new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' })}
                        </td>
                        <td className="py-2 pr-4 tabular-nums">{elapsedMin}:{String(elapsedSec).padStart(2, '0')}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={log.completed ? 'default' : 'secondary'} className="text-xs">
                            {log.completed ? 'Tamamlandi' : 'Eksik'}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground max-w-[200px] truncate">{log.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
