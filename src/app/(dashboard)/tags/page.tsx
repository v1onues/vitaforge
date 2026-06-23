'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tags, Plus, Trash2, Palette } from 'lucide-react';
import { useTags } from '@/lib/hooks/use-tags';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#78716c', '#6b7280',
];

export default function TagsPage() {
  const { tags, addTag, deleteTag } = useTags();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addTag(newName.trim(), newColor);
    setNewName('');
    setNewColor('#3b82f6');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="w-6 h-6" />
            Etiketler
          </h1>
          <p className="text-muted-foreground">{tags.length} etiket</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Etiket
        </Button>
      </div>

      {tags.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Tags className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Henüz etiket yok</h3>
              <p className="mb-4">İlk etiketini oluşturarak başla</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Etiketi Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteTag(tag.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Etiket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Etiket adı"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Renk
              </p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
            <Button disabled={!newName.trim()} onClick={handleAdd}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
