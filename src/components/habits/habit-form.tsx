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
import { Habit } from '@/lib/db/schema';
import { Palette, Bell } from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt'>) => Promise<unknown>;
  initialData?: Habit;
}

function HabitFormInner({
  onSubmit,
  onOpenChange,
  initialData,
}: {
  onSubmit: HabitFormProps['onSubmit'];
  onOpenChange: (open: boolean) => void;
  initialData?: Habit;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [frequency, setFrequency] = useState<Habit['frequency']>(initialData?.frequency ?? 'daily');
  const [targetValue, setTargetValue] = useState(initialData?.targetValue?.toString() ?? '');
  const [unit, setUnit] = useState(initialData?.unit ?? '');
  const [color, setColor] = useState(initialData?.color ?? PRESET_COLORS[0]);
  const [reminderTime, setReminderTime] = useState(initialData?.reminderTime ?? '');
  const [saving, setSaving] = useState(false);

  const FREQUENCY_LABELS: Record<string, string> = { daily: 'Günlük', weekly: 'Haftalık', custom: 'Özel' };

  const handleSave = async () => {
    if (!name || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        frequency,
        customDays: initialData?.customDays ?? [],
        targetValue: targetValue ? Number(targetValue) : null,
        unit,
        color,
        icon: 'Repeat',
        reminderTime: reminderTime || null,
        archived: false,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Alışkanlık kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Alışkanlık Adı</label>
        <Input
          placeholder="Örn: 8 bardak su iç"
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
          <label className="text-sm font-medium">Sıklık</label>
          <Select value={frequency} onValueChange={(v) => v && setFrequency(v as Habit['frequency'])}>
            <SelectTrigger>
              <SelectValue>{FREQUENCY_LABELS[frequency]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Günlük</SelectItem>
              <SelectItem value="weekly">Haftalık</SelectItem>
              <SelectItem value="custom">Özel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hedef (opsiyonel)</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Miktar"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              min={1}
            />
            <Input
              placeholder="Birim"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-24"
            />
          </div>
        </div>
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

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Hatırlatma Saati (opsiyonel)
        </label>
        <Input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          İptal
        </Button>
        <Button type="button" disabled={saving || !name} onClick={handleSave}>
          {saving ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Oluştur'}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function HabitForm({ open, onOpenChange, onSubmit, initialData }: HabitFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Alışkanlığı Düzenle' : 'Yeni Alışkanlık'}
          </DialogTitle>
        </DialogHeader>
        <HabitFormInner
          key={initialData?.id ?? 'new'}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
