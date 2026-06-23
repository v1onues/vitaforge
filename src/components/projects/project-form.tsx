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
import { Project } from '@/lib/db/schema';
import { TagInput } from '@/components/shared/tag-input';
import { Palette, Flag, Calendar, Link, Coins, Clock } from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

const PRIORITY_LABELS: Record<string, string> = { low: 'Düşük', normal: 'Normal', high: 'Yüksek', urgent: 'Acil' };

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: Project;
}

function ProjectFormInner({
  onSubmit,
  onOpenChange,
  initialData,
}: {
  onSubmit: ProjectFormProps['onSubmit'];
  onOpenChange: (open: boolean) => void;
  initialData?: Project;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [color, setColor] = useState(initialData?.color ?? PRESET_COLORS[0]);
  const [status, setStatus] = useState<Project['status']>(initialData?.status ?? 'active');
  const [priority, setPriority] = useState<Project['priority']>(initialData?.priority ?? 'normal');
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [budget, setBudget] = useState(initialData?.budget?.toString() ?? '');
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [estimatedHours, setEstimatedHours] = useState(initialData?.estimatedHours?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        color,
        icon: 'FolderKanban',
        status,
        priority,
        startDate: startDate ? new Date(startDate).getTime() : null,
        endDate: endDate ? new Date(endDate).getTime() : null,
        tags,
        budget: budget ? Number(budget) : null,
        url: url || null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        order: initialData?.order ?? 0,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Proje kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Proje Adı</label>
        <Input
          placeholder="Proje adı gir..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Açıklama</label>
        <Input
          placeholder="Opsiyonel açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Flag className="w-3 h-3" />
            Öncelik
          </label>
          <Select value={priority} onValueChange={(v) => v && setPriority(v as Project['priority'])}>
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
          <label className="text-sm font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Tahmini Süre (saat)
          </label>
          <Input
            type="number"
            placeholder="saat"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            min={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Başlangıç
          </label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Bitiş
          </label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Coins className="w-3 h-3" />
            Bütçe (TRY)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min={0}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Link className="w-3 h-3" />
            URL
          </label>
          <Input
            placeholder="https://github.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Etiketler</label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Renk
        </label>
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {initialData && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Durum</label>
          <div className="flex gap-2">
            {(['active', 'paused', 'completed', 'archived'] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={status === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatus(s)}
              >
                {s === 'active' ? 'Aktif' : s === 'paused' ? 'Askıda' : s === 'completed' ? 'Tamamlandı' : 'Arşiv'}
              </Button>
            ))}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
        <Button type="button" disabled={saving || !name} onClick={handleSave}>
          {saving ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function ProjectForm({ open, onOpenChange, onSubmit, initialData }: ProjectFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Projeyi Düzenle' : 'Yeni Proje'}
          </DialogTitle>
        </DialogHeader>
        <ProjectFormInner
          key={initialData?.id ?? 'new'}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
