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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioPlayer } from '@/components/shared/radio-player';
import { useRadio } from '@/lib/hooks/use-radio';
import type { RadioStation } from '@/lib/db/schema';
import {
  Radio,
  Plus,
  Search,
  Globe,
  Trash2,
  Music,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  turkish: 'Türkçe',
  international: 'Uluslararası',
  custom: 'Özel',
};

const CATEGORY_ICONS: Record<string, typeof Radio> = {
  turkish: Globe,
  international: Music,
  custom: Radio,
};

function StationForm({
  onDone,
  onSave,
}: {
  onDone: () => void;
  onSave: (data: Omit<RadioStation, 'id' | 'createdAt' | 'updatedAt' | 'isDefault' | 'order'>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<RadioStation['category']>('custom');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !url) return;
    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }
    setSaving(true);
    try {
      await onSave({
        name,
        url: finalUrl,
        category,
        genre: genre || 'Diğer',
        country: country || null,
        faviconUrl: null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onDone()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni İstasyon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">İsim</label>
            <Input placeholder="Radyo ismi" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Yayın URL</label>
            <Input placeholder="https://stream.ornek.com/radio.mp3" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select value={category} onValueChange={(v) => v && setCategory(v as RadioStation['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="turkish">Türkçe</SelectItem>
                  <SelectItem value="international">Uluslararası</SelectItem>
                  <SelectItem value="custom">Özel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tür</label>
              <Input placeholder="Pop, Rock, Jazz..." value={genre} onChange={(e) => setGenre(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ülke (opsiyonel)</label>
            <Input placeholder="TR, UK, US..." value={country} onChange={(e) => setCountry(e.target.value)} className="w-24" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onDone()}>İptal</Button>
          <Button disabled={saving || !name || !url} onClick={handleSave}>
            {saving ? 'Kaydediliyor...' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RadioPage() {
  const { stations, addStation, deleteStation } = useRadio();
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const enabledStations = stations.filter((s) => s.order >= 0);
  const filtered = search
    ? enabledStations.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.genre.toLowerCase().includes(search.toLowerCase())
      )
    : enabledStations;

  const categories = ['turkish', 'international', 'custom'] as const;
  const grouped = categories
    .map((cat) => ({
      key: cat,
      label: CATEGORY_LABELS[cat],
      stations: filtered.filter((s) => s.category === cat),
    }))
    .filter((g) => g.stations.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-pink-500" />
            Radyo
          </h1>
          <p className="text-muted-foreground">{enabledStations.length} istasyon</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          İstasyon Ekle
        </Button>
      </div>

      {/* Player */}
      <RadioPlayer station={activeStation} />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="İstasyon ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Station List by Category */}
      {grouped.length === 0 ? (
        <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">İstasyon bulunamadı</h3>
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.key} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.stations.map((station) => {
                const isActive = activeStation?.id === station.id;
                return (
                  <Card
                    key={station.id}
                    onClick={() => setActiveStation(station)}
                    className={`border-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                        }`}>
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{station.name}</p>
                            {isActive && <Badge className="text-[10px] h-4 bg-primary">DINLENIYOR</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {station.genre}{station.country ? ` · ${station.country}` : ''}
                          </p>
                        </div>
                        {!station.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-destructive opacity-0 group-hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); deleteStation(station.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <StationForm
          onDone={() => setShowForm(false)}
          onSave={addStation}
        />
      )}
    </div>
  );
}
