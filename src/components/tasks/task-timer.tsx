'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Plus, Trash2, Clock } from 'lucide-react';
import { useTimeTracking } from '@/lib/hooks/use-time-tracking';

interface TaskTimerProps {
  taskId: string;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}sa ${m}dk`;
  }
  return `${m}dk ${s}sn`;
}

export function TaskTimer({ taskId }: TaskTimerProps) {
  const { entries, activeEntry, totalTime, isRunning, startTimer, stopTimer, addManualEntry, deleteEntry } =
    useTimeTracking(taskId);
  const [elapsed, setElapsed] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    if (!activeEntry) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeEntry.startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  const handleManualAdd = async () => {
    const minutes = Number(manualMinutes);
    if (!minutes || minutes <= 0) return;
    await addManualEntry(minutes, manualNotes);
    setManualMinutes('');
    setManualNotes('');
    setShowManual(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Zaman Takibi
        </h3>
        <span className="text-sm text-muted-foreground">
          Toplam: {formatDuration(totalTime)}
        </span>
      </div>

      {/* Timer */}
      <Card className={isRunning ? 'border-green-500/50 bg-green-500/5' : ''}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-mono font-bold ${isRunning ? 'text-green-500' : ''}`}>
                {isRunning
                  ? `${Math.floor(elapsed / 3600)
                      .toString()
                      .padStart(2, '0')}:${Math.floor((elapsed % 3600) / 60)
                      .toString()
                      .padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`
                  : '00:00:00'}
              </div>
              {isRunning && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 animate-pulse">
                  Kaydediliyor...
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={isRunning ? 'destructive' : 'default'}
                size="sm"
                onClick={() => {
                  if (isRunning && activeEntry) {
                    stopTimer(activeEntry.id);
                  } else {
                    startTimer();
                  }
                }}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Durdur
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Başlat
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManual(!showManual)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ekle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry */}
      {showManual && (
        <Card>
          <CardContent className="py-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Dakika"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                className="w-24"
                min={1}
              />
              <Input
                placeholder="Not (opsiyonel)"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleManualAdd}>
                Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="space-y-1">
          {entries.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-1.5 px-2 text-sm rounded hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {new Date(entry.startTime).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
                {entry.notes && (
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {entry.notes}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{formatDuration(entry.duration)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
