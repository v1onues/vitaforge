'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task } from '@/lib/db/schema';
import { useProjects } from '@/lib/hooks/use-projects';
import { TagInput } from '@/components/shared/tag-input';
import { Flag, Calendar, Clock, Repeat } from 'lucide-react';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: Task;
  defaultProjectId?: string;
}

function TaskFormInner({
  onSubmit,
  onOpenChange,
  initialData,
  defaultProjectId,
}: {
  onSubmit: TaskFormProps['onSubmit'];
  onOpenChange: (open: boolean) => void;
  initialData?: Task;
  defaultProjectId?: string;
}) {
  const { projects } = useProjects();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priority, setPriority] = useState<Task['priority']>(initialData?.priority ?? 'normal');
  const [status, setStatus] = useState<Task['status']>(initialData?.status ?? 'todo');
  const [projectId, setProjectId] = useState<string>(initialData?.projectId ?? defaultProjectId ?? 'none');
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [recurringPattern, setRecurringPattern] = useState(initialData?.recurringPattern ?? 'none');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialData?.estimatedMinutes?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  const PRIORITY_LABELS: Record<string, string> = { low: 'Düşük', normal: 'Normal', high: 'Yüksek', urgent: 'Acil' };
  const STATUS_LABELS: Record<string, string> = { todo: 'Yapılacak', in_progress: 'Devam Ediyor', waiting: 'Beklemede', done: 'Tamamlandı' };
  const RECURRING_LABELS: Record<string, string> = {
    none: 'Yok', daily: 'Her gün', 'weekly:1': 'Her Pazartesi', 'weekly:1,3,5': 'Pzt-Çar-Cum',
    'weekly:2,4': 'Sal-Per', 'monthly:1': 'Her ayın 1\'i', 'monthly:1,15': 'Her ayın 1\'i ve 15\'i',
  };

  const handleSave = async () => {
    if (!title || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        title,
        description,
        priority,
        status,
        projectId: projectId === 'none' ? null : projectId,
        groupId: initialData?.groupId ?? null,
        deadline: deadline ? new Date(deadline).getTime() : null,
        completedAt: status === 'done' ? Date.now() : null,
        parentId: initialData?.parentId ?? null,
        order: initialData?.order ?? 0,
        tags,
        recurringPattern: recurringPattern === 'none' ? null : recurringPattern,
        lastRecurringAt: initialData?.lastRecurringAt ?? null,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Görev kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <label className="text-sm font-medium">Görev Başlığı</label>
        <Input
          placeholder="Görev başlığı gir..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSave();
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Açıklama</label>
        <textarea
          placeholder="Açıklama (opsiyonel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Etiketler</label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Flag className="w-3 h-3" />
            Öncelik
          </label>
          <Select value={priority} onValueChange={(v) => v && setPriority(v as Task['priority'])}>
            <SelectTrigger>
              <SelectValue>{PRIORITY_LABELS[priority]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="urgent">Acil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Durum</label>
          <Select value={status} onValueChange={(v) => v && setStatus(v as Task['status'])}>
            <SelectTrigger>
              <SelectValue>{STATUS_LABELS[status]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Yapılacak</SelectItem>
              <SelectItem value="in_progress">Devam Ediyor</SelectItem>
              <SelectItem value="waiting">Beklemede</SelectItem>
              <SelectItem value="done">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Proje</label>
          <Select value={projectId} onValueChange={(v) => setProjectId(v ?? 'none')}>
            <SelectTrigger>
              <SelectValue placeholder="Proje seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Projesiz</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Deadline
          </label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Tahmini Süre (dk)
          </label>
          <Input
            type="number"
            placeholder="dk"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Repeat className="w-3 h-3" />
            Tekrarlama
          </label>
          <Select value={recurringPattern} onValueChange={(v) => setRecurringPattern(v ?? 'none')}>
            <SelectTrigger>
              <SelectValue>{RECURRING_LABELS[recurringPattern] || recurringPattern}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Yok</SelectItem>
              <SelectItem value="daily">Her gün</SelectItem>
              <SelectItem value="weekly:1">Her Pazartesi</SelectItem>
              <SelectItem value="weekly:1,3,5">Pzt-Çar-Cum</SelectItem>
              <SelectItem value="weekly:2,4">Sal-Per</SelectItem>
              <SelectItem value="monthly:1">Her ayın 1&apos;i</SelectItem>
              <SelectItem value="monthly:1,15">Her ayın 1&apos;i ve 15&apos;i</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          İptal
        </Button>
        <Button type="button" disabled={saving || !title} onClick={handleSave}>
          {saving ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function TaskForm({ open, onOpenChange, onSubmit, initialData, defaultProjectId }: TaskFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Görevi Düzenle' : 'Yeni Görev'}
          </DialogTitle>
        </DialogHeader>
        <TaskFormInner
          key={initialData?.id ?? 'new'}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          initialData={initialData}
          defaultProjectId={defaultProjectId}
        />
      </DialogContent>
    </Dialog>
  );
}
