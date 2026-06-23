'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { Activity, CheckSquare, Film, BookMarked, Repeat, StickyNote, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const TYPE_ICONS: Record<string, typeof Activity> = {
  task_done: CheckSquare,
  media_watched: Film,
  reading: BookMarked,
  habit_logged: Repeat,
  note_created: StickyNote,
  transaction: TrendingDown,
  custom: Sparkles,
};

const TYPE_LABELS: Record<string, string> = {
  task_done: 'Görev',
  media_watched: 'Medya',
  reading: 'Okuma',
  habit_logged: 'Alışkanlık',
  note_created: 'Not',
  transaction: 'Finans',
  custom: 'Aktivite',
};

export default function ActivityPage() {
  const [showForm, setShowForm] = useState(false);
  const [newSummary, setNewSummary] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const logs = useLiveQuery(
    () => db.activityLogs.orderBy('timestamp').reverse().toArray(),
    []
  );

  const addLog = async () => {
    if (!newSummary) return;
    await db.activityLogs.add({
      id: crypto.randomUUID(),
      summary: newSummary,
      details: newDetails,
      type: 'custom',
      relatedId: null,
      relatedType: null,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });
    setNewSummary('');
    setNewDetails('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />Aktivite Akışı
          </h1>
          <p className="text-muted-foreground">{(logs ?? []).length} kayıt</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Sparkles className="w-4 h-4 mr-2" />Yeni Kayıt
        </Button>
      </div>

      {(logs ?? []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Henüz kayıt yok</h3>
          <p className="mb-4">AI asistan veya manuel olarak aktivite ekleyebilirsin</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {(logs ?? []).map((log) => {
            const Icon = TYPE_ICONS[log.type] || Sparkles;
            const label = TYPE_LABELS[log.type] || 'Aktivite';
            return (
              <Card key={log.id}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString('tr-TR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.summary}</p>
                      {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Yeni Aktivite Kaydı</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Özet (örn: 2 saat çalıştım)" value={newSummary} onChange={(e) => setNewSummary(e.target.value)} autoFocus />
            <Textarea placeholder="Detay (isteğe bağlı)" value={newDetails} onChange={(e) => setNewDetails(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
            <Button disabled={!newSummary} onClick={addLog}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
