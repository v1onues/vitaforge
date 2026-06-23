'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODES: Record<TimerMode, { label: string; duration: number; icon: typeof Play }> = {
  work: { label: 'Çalışma', duration: 25 * 60, icon: Zap },
  shortBreak: { label: 'Kısa Mola', duration: 5 * 60, icon: Coffee },
  longBreak: { label: 'Uzun Mola', duration: 15 * 60, icon: Coffee },
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalDuration = MODES[mode].duration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 300);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          playNotification();

          if (mode === 'work') {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            if (newSessions % 4 === 0) {
              switchMode('longBreak');
            } else {
              switchMode('shortBreak');
            }
          } else {
            switchMode('work');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, sessions, playNotification, switchMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const ModeIcon = MODES[mode].icon;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Mode Selector */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(Object.keys(MODES) as TimerMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchMode(m)}
                disabled={isRunning}
              >
                {MODES[m].label}
              </Button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="relative w-40 h-40">
            {/* Progress Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                className="stroke-muted"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="currentColor"
                className={mode === 'work' ? 'stroke-primary' : 'stroke-green-500'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - progress / 100)}
              />
            </svg>
            {/* Time Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold">{formatTime(timeLeft)}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ModeIcon className="w-3 h-3" />
                {MODES[mode].label}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(MODES[mode].duration);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="w-24"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Duraklat
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Başlat
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Session Counter */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Seri: {sessions}</span>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < sessions % 4 ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
