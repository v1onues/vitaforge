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
import { Goal } from '@/lib/db/schema';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: Goal;
  objectives?: Goal[];
}

function GoalFormInner({
  onSubmit,
  onOpenChange,
  initialData,
  objectives,
}: {
  onSubmit: GoalFormProps['onSubmit'];
  onOpenChange: (open: boolean) => void;
  initialData?: Goal;
  objectives?: Goal[];
}) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [type, setType] = useState<Goal['type']>(initialData?.type ?? 'objective');
  const [parentId, setParentId] = useState<string>(initialData?.parentId ?? 'none');
  const [targetValue, setTargetValue] = useState(initialData?.targetValue?.toString() ?? '');
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue?.toString() ?? '0');
  const [unit, setUnit] = useState(initialData?.unit ?? '');
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);

  const TYPE_LABELS: Record<string, string> = { objective: 'Objective (Amaç)', key_result: 'Key Result (Sonuç)' };

  const handleSave = async () => {
    if (!title || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        title,
        description,
        type,
        parentId: type === 'key_result' && parentId !== 'none' ? parentId : null,
        lifeArea: null,
        targetValue: targetValue ? Number(targetValue) : null,
        currentValue: Number(currentValue) || 0,
        unit,
        deadline: deadline ? new Date(deadline).getTime() : null,
        status: 'active',
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Hedef kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Hedef Adı</label>
        <Input
          placeholder="Hedef adı gir..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          <label className="text-sm font-medium">Tür</label>
          <Select value={type} onValueChange={(v) => v && setType(v as Goal['type'])}>
            <SelectTrigger>
              <SelectValue>{TYPE_LABELS[type]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="objective">Objective (Amaç)</SelectItem>
              <SelectItem value="key_result">Key Result (Sonuç)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === 'key_result' && objectives && objectives.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Bağlı Olduğu Objective</label>
            <Select value={parentId} onValueChange={(v) => setParentId(v ?? 'none')}>
              <SelectTrigger>
                <SelectValue placeholder="Objective seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yok</SelectItem>
                {objectives.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    {obj.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mevcut Değer</label>
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hedef Değer</label>
          <Input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Birim</label>
          <Input
            placeholder="Örn: kitap, km"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Deadline (opsiyonel)</label>
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
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

export function GoalForm({ open, onOpenChange, onSubmit, initialData, objectives }: GoalFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Hedefi Düzenle' : 'Yeni Hedef'}
          </DialogTitle>
        </DialogHeader>
        <GoalFormInner
          key={initialData?.id ?? 'new'}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          initialData={initialData}
          objectives={objectives}
        />
      </DialogContent>
    </Dialog>
  );
}
