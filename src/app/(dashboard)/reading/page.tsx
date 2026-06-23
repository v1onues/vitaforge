'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { BookMarked, Plus, Star, MoreHorizontal, Trash2, ExternalLink, Edit, Search, Loader2, BookOpen } from 'lucide-react';
import { useReading } from '@/lib/hooks/use-reading';
import { ReadingItem } from '@/lib/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { searchBooks, parseBook, type GBookResult } from '@/lib/api/books';

const TYPE_LABELS: Record<string, string> = {
  book: 'Kitap',
  article: 'Makale',
  podcast: 'Podcast',
  video: 'Video',
};

const STATUS_LABELS: Record<string, string> = {
  to_read: 'Okunacak',
  reading: 'Okunuyor',
  finished: 'Tamamlandı',
};

function BookSearch({ onSelect }: {
  onSelect: (data: { title: string; author: string; imageUrl: string | null; metadata: string; url: string | null }) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const r = await searchBooks(q);
      setResults(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arama hatası');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(query.trim()), 400);
    return () => clearTimeout(timer.current);
  }, [query, doSearch]);

  const handleSelect = (item: GBookResult) => {
    onSelect(parseBook(item));
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Google Books&apos;tan Ara (opsiyonel)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Kitap adı..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {results.length > 0 && (
        <div className="border rounded-lg max-h-64 overflow-y-auto">
          {results.map((r) => {
            const v = r.volumeInfo;
            return (
              <button
                key={r.id}
                type="button"
                className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 text-left transition-colors"
                onClick={() => handleSelect(r)}
              >
                {v.imageLinks?.thumbnail ? (
                  <img src={v.imageLinks.thumbnail.replace('http:', 'https:')} alt="" className="w-10 h-14 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{v.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.authors?.[0] ?? 'Bilinmeyen yazar'}{v.publishedDate ? ` · ${v.publishedDate.slice(0, 4)}` : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReadingForm({
  onDone,
  onSave,
  initialData,
}: {
  onDone: () => void;
  onSave: (data: Omit<ReadingItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: ReadingItem | null;
}) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [author, setAuthor] = useState(initialData?.author ?? '');
  const [type, setType] = useState<ReadingItem['type']>(initialData?.type ?? 'book');
  const [url, setUrl] = useState(initialData?.url ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [metadata, setMetadata] = useState(initialData?.metadata ?? '');
  const [saving, setSaving] = useState(false);

  const handleBookSelect = (data: { title: string; author: string; imageUrl: string | null; metadata: string; url: string | null }) => {
    setTitle(data.title);
    setAuthor(data.author);
    setImageUrl(data.imageUrl);
    setMetadata(data.metadata);
    setUrl(data.url ?? '');
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);
    try {
      await onSave({
        title,
        author,
        type,
        status: initialData?.status ?? 'to_read',
        progress: initialData?.progress ?? 0,
        currentPage: initialData?.currentPage ?? null,
        totalPages: initialData?.totalPages ?? null,
        rating: initialData?.rating ?? null,
        notes: initialData?.notes ?? '',
        url: url || null,
        imageUrl,
        metadata: metadata || '{}',
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
          <DialogTitle>{initialData ? 'Düzenle' : 'Yeni Ekle'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!initialData && <BookSearch onSelect={handleBookSelect} />}

          <Input placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />

          {imageUrl && (
            <div className="flex justify-center">
              <img src={imageUrl} alt="" className="h-32 object-cover rounded" />
            </div>
          )}

          <Input placeholder="Yazar / Kaynak" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <Select value={type} onValueChange={(v) => v && setType(v as ReadingItem['type'])}>
            <SelectTrigger>
              <SelectValue>{TYPE_LABELS[type] || type}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="book">Kitap</SelectItem>
              <SelectItem value="article">Makale</SelectItem>
              <SelectItem value="podcast">Podcast</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="URL (opsiyonel)" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onDone()}>İptal</Button>
          <Button disabled={saving || !title} onClick={handleSave}>{initialData ? 'Kaydet' : 'Ekle'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ReadingPage() {
  const [statusFilter, setStatusFilter] = useState<ReadingItem['status'] | undefined>();
  const { items, addItem, updateItem, deleteItem } = useReading(statusFilter);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ReadingItem | null>(null);

  const handleProgress = async (item: ReadingItem, progress: number) => {
    const status: ReadingItem['status'] = progress >= 100 ? 'finished' : progress > 0 ? 'reading' : 'to_read';
    await updateItem(item.id, { progress, status });
  };

  const handleRating = async (item: ReadingItem, rating: number) => {
    await updateItem(item.id, { rating: item.rating === rating ? null : rating });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-amber-500" />
            Okuma Listesi
          </h1>
          <p className="text-muted-foreground">{items.length} öğe</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ekle
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={statusFilter === undefined ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(undefined)}>
          Tümü ({items.length})
        </Button>
        <Button variant={statusFilter === 'to_read' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('to_read')}>
          Okunacak
        </Button>
        <Button variant={statusFilter === 'reading' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('reading')}>
          Okunuyor
        </Button>
        <Button variant={statusFilter === 'finished' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('finished')}>
          Tamamlandı
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Liste boş</h3>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Öğeyi Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = (() => { try { return JSON.parse(item.metadata || '{}'); } catch { return {}; } })();
            return (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-14 h-20 object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-14 h-20 bg-muted rounded flex items-center justify-center shrink-0">
                        <BookMarked className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${item.status === 'finished' ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABELS[item.type]}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${
                          item.status === 'finished' ? 'bg-green-500/10 text-green-500' :
                          item.status === 'reading' ? 'bg-blue-500/10 text-blue-500' : ''
                        }`}>
                          {STATUS_LABELS[item.status]}
                        </Badge>
                      </div>
                      {item.author && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.author}</p>
                      )}
                      {meta.pageCount && (
                        <p className="text-xs text-muted-foreground">{meta.pageCount} sayfa</p>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">%{item.progress}</span>
                      </div>

                      <div className="flex gap-1 mt-2">
                        {[0, 25, 50, 75, 100].map((p) => (
                          <Button
                            key={p}
                            variant={item.progress === p ? 'default' : 'outline'}
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleProgress(item, p)}
                          >
                            %{p}
                          </Button>
                        ))}
                      </div>

                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            onClick={() => handleRating(item, r)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                item.rating && r <= item.rating
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditItem(item); setShowForm(true); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <ReadingForm
          key={editItem?.id ?? 'new'}
          onDone={() => { setShowForm(false); setEditItem(null); }}
          onSave={editItem ? (data) => updateItem(editItem.id, data) : addItem}
          initialData={editItem}
        />
      )}
    </div>
  );
}
