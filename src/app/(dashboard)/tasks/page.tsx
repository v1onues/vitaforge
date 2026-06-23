'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  CheckSquare,
  Calendar,
  Flag,
  MoreHorizontal,
  Check,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useTasks } from '@/lib/hooks/use-tasks';
import { TaskForm } from '@/components/tasks/task-form';
import { KanbanBoard } from '@/components/tasks/kanban-board';
import { Task } from '@/lib/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TasksPage() {
  const router = useRouter();
  const { tasks, addTask, updateTask, deleteTask, toggleDone } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();

  const priorityConfig = {
    low: { label: 'Düşük', icon: Flag, color: 'text-blue-500' },
    normal: { label: 'Normal', icon: Flag, color: 'text-gray-500' },
    high: { label: 'Yüksek', icon: Flag, color: 'text-orange-500' },
    urgent: { label: 'Acil', icon: AlertCircle, color: 'text-red-500' },
  };

  const statusConfig = {
    todo: { label: 'Yapılacak', icon: Clock, color: 'bg-gray-500/10 text-gray-500' },
    in_progress: { label: 'Devam Ediyor', icon: AlertCircle, color: 'bg-yellow-500/10 text-yellow-500' },
    waiting: { label: 'Beklemede', icon: Clock, color: 'bg-blue-500/10 text-blue-500' },
    done: { label: 'Tamamlandı', icon: Check, color: 'bg-green-500/10 text-green-500' },
  };

  const handleKanbanStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'done' ? Date.now() : null,
    });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Görevler</h1>
          <p className="text-muted-foreground">{tasks.length} görev</p>
        </div>
        <Button onClick={() => { setEditTask(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Görev
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <CheckSquare className="w-4 h-4 mr-2" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <Calendar className="w-4 h-4 mr-2" />
            Kanban
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Henüz görev yok</h3>
                  <p className="mb-4">İlk görevini ekleyerek başla</p>
                  <Button onClick={() => { setEditTask(undefined); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Görevi Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <Card
                  key={task.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-5 w-5 rounded-full shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDone(task.id);
                        }}
                      >
                        {task.status === 'done' && <Check className="h-3 w-3" />}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                            {task.title}
                          </span>
                          <Badge variant="secondary" className={`text-xs ${priorityConfig[task.priority].color}`}>
                            {priorityConfig[task.priority].label}
                          </Badge>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>

                      <Badge variant="secondary" className={statusConfig[task.status].color}>
                        {statusConfig[task.status].label}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e: React.MouseEvent) => e.stopPropagation()} />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTask(task);
                              setShowForm(true);
                            }}
                          >
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Henüz görev yok</h3>
                  <p className="mb-4">Kanban görünümünü kullanmak için görev ekle</p>
                  <Button onClick={() => { setEditTask(undefined); setShowForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Görevi Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleKanbanStatusChange}
              onClickTask={(task) => router.push(`/tasks/${task.id}`)}
            />
          )}
        </TabsContent>
      </Tabs>

      <TaskForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editTask ? (data) => updateTask(editTask.id, data) : addTask}
        initialData={editTask}
      />
    </div>
  );
}
