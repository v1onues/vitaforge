'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Maximize2, Check, Clock, Flag, X } from 'lucide-react';
import { useTasks } from '@/lib/hooks/use-tasks';
import { Task } from '@/lib/db/schema';

export function FocusMode() {
  const [active, setActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks, toggleDone } = useTasks({ status: 'in_progress' });
  const { tasks: todoTasks } = useTasks({ status: 'todo' });

  const availableTasks = [...tasks, ...todoTasks].filter((t) => !t.parentId);

  useEffect(() => {
    if (active) {
      document.documentElement.requestFullscreen?.();
    } else {
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } catch {
        // Ignore fullscreen exit errors
      }
    }
  }, [active]);

  if (!active) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setActive(true)}
        className="gap-1"
      >
        <Maximize2 className="w-3 h-3" />
        Odaklan
      </Button>
    );
  }

  const priorityColor = {
    low: 'text-blue-500',
    normal: 'text-gray-500',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      <div className="w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Odaklanma Modu</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setActive(false);
              setSelectedTask(null);
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {selectedTask ? (
          <Card className="border-2 border-primary">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className={`text-sm ${priorityColor[selectedTask.priority]}`}>
                  <Flag className="w-4 h-4 inline mr-1" />
                  {selectedTask.priority === 'urgent' ? 'Acil' :
                   selectedTask.priority === 'high' ? 'Yüksek' :
                   selectedTask.priority === 'normal' ? 'Normal' : 'Düşük'}
                </div>
                <h2 className="text-3xl font-bold">{selectedTask.title}</h2>
                {selectedTask.description && (
                  <p className="text-muted-foreground text-lg">{selectedTask.description}</p>
                )}
                {selectedTask.deadline && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(selectedTask.deadline).toLocaleDateString('tr-TR')}
                  </p>
                )}
                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={async () => {
                      await toggleDone(selectedTask.id);
                      setSelectedTask(null);
                    }}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Tamamlandı
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSelectedTask(null)}
                  >
                    Başka Görev Seç
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-center mb-4">
              Odaklanmak istediğin görevi seç
            </p>
            {availableTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Devam eden veya yapılacak görev yok
              </p>
            ) : (
              availableTasks.slice(0, 6).map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="py-4 flex items-center gap-3">
                    <Flag className={`w-4 h-4 ${priorityColor[task.priority]}`} />
                    <span className="font-medium">{task.title}</span>
                    {task.deadline && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(task.deadline).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
