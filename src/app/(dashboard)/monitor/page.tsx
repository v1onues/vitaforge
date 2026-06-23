'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ServerMonitor } from '@/components/shared/server-monitor';
import { useMonitor } from '@/lib/hooks/use-monitor';
import { MonitoredEndpoint } from '@/lib/db/schema';
import {
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

function EndpointForm({
  onDone,
  onSave,
  initialData,
}: {
  onDone: () => void;
  onSave: (data: { name: string; url: string; enabled: boolean }) => Promise<void>;
  initialData?: MonitoredEndpoint | null;
}) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !url) return;
    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }
    setSaving(true);
    try {
      await onSave({ name, url: finalUrl, enabled });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onDone()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Endpoint Düzenle' : 'Yeni Endpoint'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">İsim</label>
            <Input placeholder="örnek: treas.net.tr" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <Input placeholder="https://örnek.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="endpoint-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded border-muted"
            />
            <label htmlFor="endpoint-enabled" className="text-sm">Aktif (kontrol et)</label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onDone()}>İptal</Button>
          <Button disabled={saving || !name || !url} onClick={handleSave}>
            {saving ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MonitorPage() {
  const { endpoints, addEndpoint, updateEndpoint, deleteEndpoint, toggleEndpoint } = useMonitor();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MonitoredEndpoint | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sunucu İzleme</h1>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Endpoint Ekle
        </Button>
      </div>

      {/* Endpoint Management */}
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Endpoint Yönetimi
          </CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-3">
          {endpoints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Henüz endpoint eklenmedi</p>
          ) : (
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div key={ep.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <button
                    onClick={() => toggleEndpoint(ep.id)}
                    className="shrink-0"
                  >
                    {ep.enabled ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ep.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{ep.url}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] h-5 ${ep.enabled ? 'bg-green-500/10 text-green-500' : 'bg-muted'}`}>
                    {ep.enabled ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => { setEditItem(ep); setShowForm(true); }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive"
                    onClick={() => deleteEndpoint(ep.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Status */}
      <ServerMonitor />

      {/* Info */}
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Hakkında
          </CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-3 text-sm text-muted-foreground space-y-2">
          <p>Sunucu durumu her 60 saniyede bir otomatik kontrol edilir.</p>
          <p>Endpoint ekleyip çıkararak hangi sunucuları izleyeceğini seç.</p>
          <p>İsteği tıklayarak manuel kontrol yapabilirsin.</p>
        </CardContent>
      </Card>

      {showForm && (
        <EndpointForm
          key={editItem?.id ?? 'new'}
          onDone={() => { setShowForm(false); setEditItem(null); }}
          onSave={editItem
            ? (data) => updateEndpoint(editItem.id, data)
            : (data) => addEndpoint({ ...data, order: endpoints.length })
          }
          initialData={editItem}
        />
      )}
    </div>
  );
}
