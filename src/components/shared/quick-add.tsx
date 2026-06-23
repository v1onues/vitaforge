'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useNotes } from '@/lib/hooks/use-notes';
import { Task } from '@/lib/db/schema';
import { CheckSquare, StickyNote, Flag } from 'lucide-react';

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'task' | 'note'>('task');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('normal');
  const [projectId, setProjectId] = useState('none');
  const [saving, setSaving] = useState(false);

  const PRIORITY_LABELS: Record<string, string> = { low: 'Düşük', normal: 'Normal', high: 'Yüksek', urgent: 'Acil' };

  const { projects } = useProjects();
  const { addTask } = useTasks();
  const { addNote } = useNotes();

  const handleOpen = useCallback((e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail?.type === 'note') {
      setMode('note');
    } else {
      setMode('task');
    }
    setOpen(true);
    setTitle('');
  }, []);

  useEffect(() => {
    const handler = (e: Event) => handleOpen(e);
    window.addEventListener('open-new-task', handler);
    window.addEventListener('open-new-note', handler);
    return () => {
      window.removeEventListener('open-new-task', handler);
      window.removeEventListener('open-new-note', handler);
    };
  }, [handleOpen]);

  const handleSave = async () => {
    if (!title || saving) return;
    setSaving(true);
    try {
      if (mode === 'task') {
        await addTask({
          title,
          description: '',
          priority: priority as Task['priority'],
          status: 'todo',
          projectId: projectId === 'none' ? null : projectId,
          groupId: null,
          deadline: null,
          completedAt: null,
          parentId: null,
          order: 0,
          tags: [],
          recurringPattern: null,
          lastRecurringAt: null,
          estimatedMinutes: null,
        });
      } else {
        await addNote({
          title,
          content: '',
          tags: [],
          links: [],
          pinned: false,
        });
      }
      setOpen(false);
      setTitle('');
    } catch (err) {
      console.error('Kaydetme hatası:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'task' ? (
              <>
                <CheckSquare className="w-5 h-5" />
                Hızlı Görev Ekle
              </>
            ) : (
              <>
                <StickyNote className="w-5 h-5" />
                Hızlı Not Ekle
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'task' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('task')}
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Görev
            </Button>
            <Button
              variant={mode === 'note' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('note')}
            >
              <StickyNote className="w-4 h-4 mr-1" />
              Not
            </Button>
          </div>

          {/* Title */}
          <Input
            placeholder={mode === 'task' ? 'Görev başlığı...' : 'Not başlığı...'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) handleSave();
            }}
          />

          {/* Task-only options */}
          {mode === 'task' && (
            <div className="flex gap-2">
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger className="w-32">
                  <Flag className="w-3 h-3 mr-1" />
                  <SelectValue>{PRIORITY_LABELS[priority]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectId} onValueChange={(v) => setProjectId(v ?? 'none')}>
                <SelectTrigger className="flex-1">
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
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button disabled={saving || !title} onClick={handleSave}>
              {saving ? 'Kaydediliyor...' : 'Ekle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
