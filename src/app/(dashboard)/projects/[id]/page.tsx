'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject, useProjects } from '@/lib/hooks/use-projects';
import { useProjectGroups } from '@/lib/hooks/use-project-groups';
import { useTasks } from '@/lib/hooks/use-tasks';
import { TaskForm } from '@/components/tasks/task-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Plus, Calendar, Check, Clock, MoreHorizontal, Trash2,
  Flag, Coins, Link, Tag, GripVertical, Edit3, X,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'text-blue-500' },
  normal: { label: 'Normal', color: 'text-gray-500' },
  high: { label: 'Yüksek', color: 'text-orange-500' },
  urgent: { label: 'Acil', color: 'text-red-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  todo: { label: 'Yapılacak', color: 'bg-gray-500/10 text-gray-500' },
  in_progress: { label: 'Devam Ediyor', color: 'bg-yellow-500/10 text-yellow-500' },
  waiting: { label: 'Beklemede', color: 'bg-blue-500/10 text-blue-500' },
  done: { label: 'Tamamlandı', color: 'bg-green-500/10 text-green-500' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading: projectLoading } = useProject(projectId);
  const { deleteProject } = useProjects();
  const { groups, addGroup, deleteGroup, updateGroup } = useProjectGroups(projectId);
  const { tasks, addTask, updateTask, toggleDone, deleteTask } = useTasks({ projectId });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  const getGroupTasks = (groupId: string | null) =>
    tasks.filter((t) => t.groupId === groupId).sort((a, b) => a.order - b.order);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await addGroup({
      projectId,
      name: newGroupName.trim(),
      description: '',
      order: groups.length,
      deadline: null,
    });
    setNewGroupName('');
    setAddingGroup(false);
  };

  const handleDeleteGroup = async (groupId: string) => {
    const groupTasks = getGroupTasks(groupId);
    if (groupTasks.length > 0 && !confirm(`Bu gruptaki ${groupTasks.length} görev gruba bağlı kalmaya devam edecek. Silmek istediğine emin misin?`)) return;
    await deleteGroup(groupId);
  };

  const moveTaskToGroup = async (taskId: string, groupId: string | null) => {
    await updateTask(taskId, { groupId });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Proje bulunamadı</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>
          Projelere Dön
        </Button>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const ungroupedTasks = getGroupTasks(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
              <div className="w-5 h-5 rounded" style={{ backgroundColor: project.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.description && <p className="text-muted-foreground">{project.description}</p>}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={`text-xs ${project.status === 'active' ? 'bg-green-500/10 text-green-500' : project.status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' : project.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                  {project.status === 'active' ? 'Aktif' : project.status === 'paused' ? 'Askıda' : project.status === 'completed' ? 'Tamamlandı' : 'Arşivlendi'}
                </Badge>
                <Badge variant="secondary" className={`text-xs ${PRIORITY_CONFIG[project.priority]?.color}`}>
                  <Flag className="w-3 h-3 mr-1" />
                  {PRIORITY_CONFIG[project.priority]?.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={async () => { await deleteProject(project.id); router.push('/projects'); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Projeyi Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {project.startDate && (
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(project.startDate).toLocaleDateString('tr-TR')}
            {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('tr-TR')}`}
          </span>
        )}
        {project.budget && (
          <span className="text-muted-foreground flex items-center gap-1">
            <Coins className="w-4 h-4" />
            ₺{project.budget.toLocaleString('tr-TR')}
          </span>
        )}
        {project.estimatedHours && (
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {project.estimatedHours} saat
          </span>
        )}
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <Link className="w-4 h-4" />
            {new URL(project.url).hostname}
          </a>
        )}
        {project.tags.length > 0 && project.tags.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            <Tag className="w-3 h-3 mr-1" />{t}
          </Badge>
        ))}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">İlerleme</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{tasks.length} görev</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
          </div>
        </CardContent>
      </Card>

      {/* Groups + Tasks */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Görevler</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddingGroup(!addingGroup)}>
            <Plus className="w-4 h-4 mr-1" /> Grup
          </Button>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Görev Ekle
          </Button>
        </div>
      </div>

      {addingGroup && (
        <Card>
          <CardContent className="py-3 flex items-center gap-2">
            <Input
              placeholder="Grup adı..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
              className="flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddGroup(); }}
            />
            <Button size="sm" onClick={handleAddGroup} disabled={!newGroupName.trim()}>Ekle</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingGroup(false); setNewGroupName(''); }}>
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grouped Tasks */}
      {groups.map((group) => {
        const groupTasks = getGroupTasks(group.id);
        const groupDone = groupTasks.filter((t) => t.status === 'done').length;
        return (
          <Card key={group.id}>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                {editingGroup === group.id ? (
                  <Input
                    value={group.name}
                    onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                    onBlur={() => setEditingGroup(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingGroup(null); }}
                    autoFocus
                    className="h-7 text-sm"
                  />
                ) : (
                  <CardTitle className="text-sm font-medium" onClick={() => setEditingGroup(group.id)}>
                    {group.name}
                  </CardTitle>
                )}
                <Badge variant="secondary" className="text-xs">{groupTasks.length}</Badge>
                {groupTasks.length > 0 && (
                  <span className="text-xs text-muted-foreground">{groupDone}/{groupTasks.length}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingGroup(group.id === editingGroup ? null : group.id)}>
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteGroup(group.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              {groupTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Bu grupta henüz görev yok</p>
              ) : (
                <TaskList
                  tasks={groupTasks}
                  toggleDone={toggleDone}
                  deleteTask={deleteTask}
                  onMoveTask={moveTaskToGroup}
                  groups={groups}
                />
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Ungrouped Tasks */}
      {ungroupedTasks.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gruplanmamış Görevler ({ungroupedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <TaskList
              tasks={ungroupedTasks}
              toggleDone={toggleDone}
              deleteTask={deleteTask}
              onMoveTask={moveTaskToGroup}
              groups={groups}
            />
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && groups.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Bu projede henüz görev yok</p>
            </div>
          </CardContent>
        </Card>
      )}

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={addTask}
        defaultProjectId={projectId}
      />
    </div>
  );
}

function TaskList({
  tasks,
  toggleDone,
  deleteTask,
  onMoveTask,
  groups,
}: {
  tasks: import('@/lib/db/schema').Task[];
  toggleDone: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  onMoveTask: (taskId: string, groupId: string | null) => Promise<void>;
  groups: import('@/lib/db/schema').ProjectGroup[];
}) {
  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors group">
          <Button variant="outline" size="icon" className="h-5 w-5 rounded-full shrink-0" onClick={() => toggleDone(task.id)}>
            {task.status === 'done' && <Check className="h-3 w-3" />}
          </Button>
          <div className="flex-1 min-w-0">
            <span className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
              {task.title}
            </span>
          </div>
          <Badge variant="secondary" className={`text-xs ${PRIORITY_CONFIG[task.priority]?.color}`}>
            {PRIORITY_CONFIG[task.priority]?.label}
          </Badge>
          <Badge variant="secondary" className={STATUS_CONFIG[task.status]?.color}>
            {STATUS_CONFIG[task.status]?.label}
          </Badge>
          {task.estimatedMinutes && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.ceil(task.estimatedMinutes / 60)}s
            </span>
          )}
          {task.deadline && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.deadline).toLocaleDateString('tr-TR')}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" />}>
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {groups.map((g) => (
                <DropdownMenuItem key={g.id} onClick={() => onMoveTask(task.id, g.id)}>
                  <GripVertical className="w-3.5 h-3.5 mr-2" />
                  {g.name}
                </DropdownMenuItem>
              ))}
              {task.groupId && (
                <DropdownMenuItem onClick={() => onMoveTask(task.id, null)}>
                  <X className="w-3.5 h-3.5 mr-2" />
                  Gruplandırma
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteTask(task.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
