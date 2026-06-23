'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Note } from '@/lib/db/schema';
import { Tag, X } from 'lucide-react';

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: Note;
}

function NoteFormInner({
  onSubmit,
  onOpenChange,
  initialData,
}: {
  onSubmit: NoteFormProps['onSubmit'];
  onOpenChange: (open: boolean) => void;
  initialData?: Note;
}) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        title,
        content,
        tags,
        links: initialData?.links ?? [],
        pinned: initialData?.pinned ?? false,
      });
      onOpenChange(false);
    } catch (err) {
      console.error('Not kaydedilemedi:', err);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Başlık</label>
        <Input
          placeholder="Not başlığı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSave();
          }}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">İçerik</label>
        <textarea
          placeholder="Markdown destekli içerik..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[200px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="w-3 h-3" />
          Etiketler
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Etiket ekle"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Ekle
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
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

export function NoteForm({ open, onOpenChange, onSubmit, initialData }: NoteFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Notu Düzenle' : 'Yeni Not'}
          </DialogTitle>
        </DialogHeader>
        <NoteFormInner
          key={initialData?.id ?? 'new'}
          onSubmit={onSubmit}
          onOpenChange={onOpenChange}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
