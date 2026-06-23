'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, MediaItem } from '@/lib/db/schema';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Film, Tv, Music, Star, Plus, Search, MoreHorizontal, Trash2, Edit,
  Loader2, AlertCircle, Gamepad2, Clock, Trophy,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { searchTmdb, getTmdbDetails, posterUrl, parseTmdbDetails, type TmdbSearchResult } from '@/lib/api/tmdb';
import { searchAlbums, parseAlbum, searchTracks, parseTrack, type LastfmAlbumSearchResult } from '@/lib/api/music';
import { searchRawg, getRawgDetails, parseRawgResult, type RawgSearchResult } from '@/lib/api/rawg';

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Film; color: string }> = {
  movie: { label: 'Film', icon: Film, color: 'text-blue-500' },
  series: { label: 'Dizi', icon: Tv, color: 'text-purple-500' },
  music_album: { label: 'Albüm', icon: Music, color: 'text-green-500' },
  music_song: { label: 'Şarkı', icon: Music, color: 'text-rose-500' },
  game: { label: 'Oyun', icon: Gamepad2, color: 'text-orange-500' },
};

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planlandı', active: 'Oynanıyor', done: 'Tamamlandı', abandoned: 'Bırakıldı',
};

function TmdbSearch({ onSelect, mediaType }: {
  onSelect: (data: { title: string; type: 'movie' | 'series'; metadata: string; imageUrl: string | null }) => void;
  mediaType: string;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const r = await searchTmdb(q);
      setResults(r.slice(0, 6));
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

  const handleSelect = async (r: TmdbSearchResult) => {
    const mediaTypeInner = r.media_type === 'tv' ? 'series' as const : 'movie' as const;
    try {
      const details = await getTmdbDetails(r.id, r.media_type);
      const parsed = parseTmdbDetails(details);
      onSelect(parsed);
    } catch {
      onSelect({
        title: r.title ?? r.name ?? '',
        type: mediaTypeInner,
        metadata: JSON.stringify({
          tmdb_id: r.id,
          year: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
          overview: r.overview,
        }),
        imageUrl: posterUrl(r.poster_path, 'w500'),
      });
    }
    setQuery('');
    setResults([]);
  };

  const disabled = mediaType === 'music_album' || mediaType === 'music_song' || mediaType === 'game';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">TMDB&apos;den Ara (opsiyonel)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={mediaType === 'series' ? 'Dizi adı...' : 'Film adı...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {results.length > 0 && (
        <div className="border rounded-lg max-h-64 overflow-y-auto">
          {results.map((r) => {
            const isMovie = r.media_type === 'movie';
            const year = (isMovie ? r.release_date : r.first_air_date)?.slice(0, 4) ?? '';
            return (
              <button
                key={r.id}
                type="button"
                className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 text-left transition-colors"
                onClick={() => handleSelect(r)}
              >
                {r.poster_path ? (
                  <img src={posterUrl(r.poster_path, 'w92')!} alt="" className="w-10 h-14 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{r.title ?? r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {year} · <Badge variant="outline" className="text-xs">{isMovie ? 'Film' : 'Dizi'}</Badge>
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

function MusicSearch({ onSelect, mediaType }: {
  onSelect: (data: { title: string; type: MediaItem['type']; metadata: string; imageUrl: string | null }) => void;
  mediaType: string;
}) {
  const [query, setQuery] = useState('');
  const [albumResults, setAlbumResults] = useState<LastfmAlbumSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isSong = mediaType === 'music_song';

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setAlbumResults([]); return; }
    setLoading(true);
    setError('');
    try {
      if (isSong) {
        const r = await searchTracks(q);
        setAlbumResults(r as unknown as LastfmAlbumSearchResult[]);
      } else {
        const r = await searchAlbums(q);
        setAlbumResults(r);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arama hatası');
      setAlbumResults([]);
    } finally {
      setLoading(false);
    }
  }, [isSong]);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(query.trim()), 400);
    return () => clearTimeout(timer.current);
  }, [query, doSearch]);

  const handleSelect = async (item: LastfmAlbumSearchResult) => {
    if (isSong) {
      onSelect(parseTrack(item));
    } else {
      const parsed = await parseAlbum(item);
      onSelect(parsed);
    }
    setQuery('');
    setAlbumResults([]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Last.fm&apos;ten Ara (opsiyonel)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={isSong ? 'Şarkı adı...' : 'Albüm adı...'} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {albumResults.length > 0 && (
        <div className="border rounded-lg max-h-64 overflow-y-auto">
          {albumResults.map((r, i) => (
            <button
              key={`${r.mbid ?? r.name}-${i}`}
              type="button"
              className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 text-left transition-colors"
              onClick={() => handleSelect(r)}
            >
              {r.image?.[0]?.['#text'] ? (
                <img src={r.image[0]['#text']} alt="" className="w-10 h-10 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GameSearch({ onSelect }: {
  onSelect: (data: { title: string; type: 'game'; metadata: string; imageUrl: string | null }) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RawgSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    setError('');
    try {
      const r = await searchRawg(q);
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

  const handleSelect = async (r: RawgSearchResult) => {
    try {
      const details = await getRawgDetails(r.id);
      const parsed = parseRawgResult(r);
      onSelect({
        ...parsed,
        metadata: JSON.stringify({
          ...JSON.parse(parsed.metadata),
          playtime: details.playtime,
          achievements: details.achievements_count,
          metacritic: details.metacritic,
          developers: details.developers.map((d) => d.name),
        }),
      });
    } catch {
      onSelect(parseRawgResult(r));
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">RAWG&apos;den Ara (opsiyonel)</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Oyun adı..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>
      {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {results.length > 0 && (
        <div className="border rounded-lg max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 text-left transition-colors"
              onClick={() => handleSelect(r)}
            >
              {r.background_image ? (
                <img src={r.background_image} alt="" className="w-16 h-10 object-cover rounded shrink-0" />
              ) : (
                <div className="w-16 h-10 bg-muted rounded flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.released?.slice(0, 4) ?? ''}
                  {r.platforms.length > 0 && ` · ${r.platforms.slice(0, 3).map((p) => p.platform.name).join(', ')}`}
                </p>
                {r.rating > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-[10px] text-muted-foreground">{r.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaForm({ onDone, onSave, initialData }: {
  onDone: () => void;
  onSave: (data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<unknown>;
  initialData?: MediaItem | null;
}) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState<MediaItem['type']>(initialData?.type ?? 'movie');
  const [status, setStatus] = useState<MediaItem['status']>(initialData?.status ?? 'planned');
  const [metadata, setMetadata] = useState(initialData?.metadata ?? '');
  const [rating, setRating] = useState<number | null>(initialData?.rating ?? null);
  const [review, setReview] = useState(initialData?.review ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);

  const handleSearchSelect = (data: { title: string; type: MediaItem['type']; metadata: string; imageUrl: string | null }) => {
    setTitle(data.title);
    setType(data.type);
    setMetadata(data.metadata);
    setImageUrl(data.imageUrl);
  };

  const handleSave = async () => {
    if (!title) return;
    setSaving(true);
    try {
      await onSave({
        title,
        type,
        status,
        metadata: metadata || '{}',
        rating,
        review,
        progress: initialData?.progress ?? 0,
        totalEpisodes: null,
        currentEpisode: null,
        url: null,
        imageUrl,
        tags: [],
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
          {!initialData && (type === 'movie' || type === 'series') && <TmdbSearch onSelect={handleSearchSelect} mediaType={type} />}
          {!initialData && (type === 'music_album' || type === 'music_song') && <MusicSearch onSelect={handleSearchSelect} mediaType={type} />}
          {!initialData && type === 'game' && <GameSearch onSelect={handleSearchSelect} />}

          <Input placeholder="Başlık" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />

          {imageUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-32 object-cover rounded" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Select value={type} onValueChange={(v) => v && setType(v as MediaItem['type'])}>
              <SelectTrigger><SelectValue>{TYPE_CONFIG[type]?.label || type}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="movie">Film</SelectItem>
                <SelectItem value="series">Dizi</SelectItem>
                <SelectItem value="music_album">Albüm</SelectItem>
                <SelectItem value="music_song">Şarkı</SelectItem>
                <SelectItem value="game">Oyun</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => v && setStatus(v as MediaItem['status'])}>
              <SelectTrigger><SelectValue>{STATUS_LABELS[status] || status}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planlandı</SelectItem>
                <SelectItem value="active">Oynanıyor</SelectItem>
                <SelectItem value="done">Tamamlandı</SelectItem>
                <SelectItem value="abandoned">Bırakıldı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Puan:</span>
            {[1,2,3,4,5,6,7,8,9,10].map((r) => (
              <button key={r} onClick={() => setRating(rating === r ? null : r)}>
                <Star className={`w-5 h-5 ${rating && r <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>

          <Textarea placeholder="Yorum..." value={review} onChange={(e) => setReview(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onDone()}>İptal</Button>
          <Button disabled={saving || !title} onClick={handleSave}>{initialData ? 'Kaydet' : 'Ekle'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MediaPage() {
  const [typeFilter, setTypeFilter] = useState<MediaItem['type'] | undefined>();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);

  const items = useLiveQuery(async () => {
    let results = await db.mediaItems.toArray();
    if (typeFilter) results = results.filter((i) => i.type === typeFilter);
    if (search) results = results.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [typeFilter, search]);

  const addItem = async (data: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    await db.mediaItems.add({ ...data, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() });
  };

  const updateItem = async (id: string, data: Partial<Omit<MediaItem, 'id'>>) => {
    await db.mediaItems.update(id, { ...data, updatedAt: Date.now() });
  };

  const deleteItem = async (id: string) => {
    await db.mediaItems.delete(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medya & Oyunlar</h1>
          <p className="text-muted-foreground">{(items ?? []).length} öğe</p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Ekle
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          <Button variant={typeFilter === undefined ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(undefined)}>Tümü</Button>
          {(['movie', 'series', 'game', 'music_album'] as const).map((t) => (
            <Button key={t} variant={typeFilter === t ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(typeFilter === t ? undefined : t)}>
              {TYPE_CONFIG[t].label}
            </Button>
          ))}
        </div>
      </div>

      {(items ?? []).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Henüz öğe yok</h3>
          <Button onClick={() => { setEditItem(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />İlk Öğeyi Ekle</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items ?? []).map((item) => {
            const config = TYPE_CONFIG[item.type];
            const Icon = config.icon;
            const meta = (() => { try { return JSON.parse(item.metadata); } catch { return {}; } })();
            return (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {item.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.imageUrl} alt="" className="w-14 h-20 object-cover rounded shrink-0" />
                    ) : (
                      <Icon className={`w-8 h-8 mt-1 shrink-0 ${config.color}`} />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{item.title}</h3>
                            <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                            <Badge variant="secondary" className={`text-xs ${
                              item.status === 'done' ? 'bg-green-500/10 text-green-500' :
                              item.status === 'active' ? 'bg-blue-500/10 text-blue-500' : ''
                            }`}>{STATUS_LABELS[item.status]}</Badge>
                          </div>
                          {meta.year && <p className="text-xs text-muted-foreground">{meta.year}{meta.director ? ` · ${meta.director}` : ''}{meta.artist ? ` · ${meta.artist}` : ''}</p>}

                          {/* Game-specific info */}
                          {item.type === 'game' && meta.platforms && meta.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {meta.platforms.slice(0, 4).map((p: string) => (
                                <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                              ))}
                            </div>
                          )}
                          {item.type === 'game' && meta.playtime > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {meta.playtime} saat
                            </p>
                          )}
                          {item.type === 'game' && meta.achievements > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Trophy className="w-3 h-3" /> {meta.achievements} başarı
                            </p>
                          )}
                          {item.type === 'game' && meta.metacritic && (
                            <p className="text-xs text-muted-foreground mt-0.5">Metacritic: {meta.metacritic}</p>
                          )}

                          {item.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{item.rating}/10</span>
                            </div>
                          )}
                          {item.review && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.review}</p>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" />}>
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditItem(item); setShowForm(true); }}>
                              <Edit className="w-4 h-4 mr-2" />Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteItem(item.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <MediaForm
          key={editItem?.id ?? 'new'}
          onDone={() => { setShowForm(false); setEditItem(null); }}
          onSave={editItem ? (data) => updateItem(editItem.id, data) : addItem}
          initialData={editItem}
        />
      )}
    </div>
  );
}
