'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTask, useTasks } from '@/lib/hooks/use-tasks';
import { useProjects } from '@/lib/hooks/use-projects';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskTimer } from '@/components/tasks/task-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Flag,
  Check,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { task, subtasks, isLoading } = useTask(taskId);
  const { projects } = useProjects();
  const { updateTask, deleteTask, toggleDone, addTask } = useTasks();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Görev bulunamadı</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/tasks')}>
          Görevlere Dön
        </Button>
      </div>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);
  const completedSubtasks = subtasks.filter((s) => s.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{task.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {project && (
                <Badge variant="secondary" style={{ backgroundColor: project.color + '20', color: project.color }}>
                  {project.name}
                </Badge>
              )}
              <Badge variant="secondary" className={priorityConfig[task.priority].color}>
                <Flag className="w-3 h-3 mr-1" />
                {priorityConfig[task.priority].label}
              </Badge>
              <Badge variant="secondary" className={statusConfig[task.status].color}>
                {statusConfig[task.status].label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toggleDone(task.id)}>
            {task.status === 'done' ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Tekrar Aç
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Tamamla
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={async () => {
                  await deleteTask(task.id);
                  router.push('/tasks');
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {task.description && (
            <Card>
              <CardContent className="py-4">
                <h3 className="text-sm font-medium mb-2">Açıklama</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">
                Alt Görevler ({completedSubtasks}/{subtasks.length})
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowSubtaskForm(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Ekle
              </Button>
            </div>
            {subtasks.length > 0 ? (
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <Card key={subtask.id} className="hover:bg-accent/50">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-5 w-5 rounded-full shrink-0"
                          onClick={() => toggleDone(subtask.id)}
                        >
                          {subtask.status === 'done' && <Check className="h-3 w-3" />}
                        </Button>
                        <span className={subtask.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                          {subtask.title}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-muted-foreground text-sm">Alt görev yok</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Durum</span>
                <Badge variant="secondary" className={statusConfig[task.status].color}>
                  {statusConfig[task.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Öncelik</span>
                <span className="text-sm font-medium">{priorityConfig[task.priority].label}</span>
              </div>
              {task.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deadline</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.deadline).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Oluşturulma</span>
                <span className="text-sm">
                  {new Date(task.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </CardContent>
          </Card>

          <TaskTimer taskId={task.id} />
        </div>
      </div>

      <TaskForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={async (data) => {
          await updateTask(task.id, data);
        }}
        initialData={task}
      />

      <TaskForm
        open={showSubtaskForm}
        onOpenChange={setShowSubtaskForm}
        onSubmit={async (data) => {
          await addTask({
            ...data,
            parentId: task.id,
          });
        }}
        defaultProjectId={task.projectId ?? undefined}
      />
    </div>
  );
}
