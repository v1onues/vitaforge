'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderKanban, MoreHorizontal, Edit, Trash2, Archive, Flag, Calendar, Tag, Coins, Clock } from 'lucide-react';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { ProjectForm } from '@/components/projects/project-form';
import { Project } from '@/lib/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: 'Düşük', color: 'text-blue-500 bg-blue-500/10' },
  normal: { label: 'Normal', color: 'text-gray-500 bg-gray-500/10' },
  high: { label: 'Yüksek', color: 'text-orange-500 bg-orange-500/10' },
  urgent: { label: 'Acil', color: 'text-red-500 bg-red-500/10' },
};

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();

  const statusLabels: Record<string, string> = {
    active: 'Aktif', paused: 'Askıda', completed: 'Tamamlandı', archived: 'Arşivlendi',
  };
  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500', paused: 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-blue-500/10 text-blue-500', archived: 'bg-gray-500/10 text-gray-500',
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setEditProject(project); setShowForm(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (confirm('Bu projeyi silmek istediğine emin misin?')) await deleteProject(id);
  };

  const handleArchive = async (project: Project, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    await updateProject(project.id, { status: project.status === 'archived' ? 'active' : 'archived' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projeler</h1>
          <p className="text-muted-foreground">{projects.length} proje</p>
        </div>
        <Button onClick={() => { setEditProject(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Proje
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Henüz proje yok</h3>
              <p className="mb-4">İlk projeni oluşturarak başla</p>
              <Button onClick={() => { setEditProject(undefined); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Projeyi Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const completedCount = projectTasks.filter((t) => t.status === 'done').length;
            const taskCount = projectTasks.length;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                        <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className={`text-xs ${statusColors[project.status]}`}>
                            {statusLabels[project.status]}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${PRIORITY_CONFIG[project.priority]?.color}`}>
                            <Flag className="w-2.5 h-2.5 mr-1" />
                            {PRIORITY_CONFIG[project.priority]?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e: React.MouseEvent) => e.preventDefault()} />}>
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleEdit(project, e)}>
                          <Edit className="w-4 h-4 mr-2" /> Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleArchive(project, e)}>
                          <Archive className="w-4 h-4 mr-2" />
                          {project.status === 'archived' ? 'Geri Al' : 'Arşivle'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(project.id, e)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.startDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.startDate).toLocaleDateString('tr-TR')}
                          {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('tr-TR')}`}
                        </span>
                      )}
                      {project.budget && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          ₺{project.budget.toLocaleString('tr-TR')}
                        </span>
                      )}
                      {project.estimatedHours && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.estimatedHours}s
                        </span>
                      )}
                    </div>

                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-2.5 h-2.5 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{completedCount}/{taskCount} görev</span>
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${taskCount > 0 ? (completedCount / taskCount) * 100 : 0}%`,
                          backgroundColor: project.color,
                        }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <ProjectForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editProject ? (data) => updateProject(editProject.id, data) : addProject}
        initialData={editProject}
      />
    </div>
  );
}
