import { db } from '@/lib/db/schema';

async function getKey(): Promise<string> {
  const s = await db.settings.get('main');
  return s?.lastfmApiKey ?? '';
}

interface LastfmImage {
  size: 'small' | 'medium' | 'large' | 'extralarge';
  '#text': string;
}

export interface LastfmAlbumSearchResult {
  name: string;
  artist: string;
  image: LastfmImage[];
  url: string;
  mbid?: string;
}

export interface LastfmAlbumInfo {
  name: string;
  artist: string;
  image: LastfmImage[];
  url: string;
  mbid?: string;
  tracks?: { track: { name: string; duration: string }[] | { name: string; duration: string } };
  tags?: { tag: { name: string }[] | { name: string } };
  wiki?: { summary: string; content: string };
}

export interface ParsedMusic {
  title: string;
  type: 'music_album';
  metadata: string;
  imageUrl: string | null;
}

export interface ParsedTrack {
  title: string;
  type: 'music_song';
  metadata: string;
  imageUrl: string | null;
}

interface LastfmTrackSearchResult {
  name: string;
  artist: string;
  image: LastfmImage[];
  url: string;
  mbid?: string;
  streamable?: string;
  listeners?: string;
}

export async function searchAlbums(query: string): Promise<LastfmAlbumSearchResult[]> {
  const key = await getKey();
  if (!key) throw new Error('Last.fm API key not configured');

  const res = await fetch('/api/lastfm/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, type: 'album', apiKey: key }),
  });
  if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);
  return res.json();
}

export async function getAlbumInfo(artist: string, album: string): Promise<LastfmAlbumInfo | null> {
  const key = await getKey();
  if (!key) return null;

  const res = await fetch('/api/lastfm/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist, album, apiKey: key }),
  });
  if (!res.ok) return null;
  return res.json();
}

function getImage(images: LastfmImage[], size: 'small' | 'medium' | 'large' | 'extralarge' = 'large'): string | null {
  const img = images.find((i) => i.size === size) ?? images.find((i) => i.size === 'medium') ?? images[0];
  return img?.['#text'] || null;
}

export async function parseAlbum(item: LastfmAlbumSearchResult): Promise<ParsedMusic> {
  let tracks: { name: string; duration: string }[] = [];
  let tags: string[] = [];
  let wiki = '';

  try {
    const info = await getAlbumInfo(item.artist, item.name);
    if (info) {
      const t = info.tracks?.track;
      tracks = Array.isArray(t) ? t : t ? [t] : [];
      const tg = info.tags?.tag;
      tags = Array.isArray(tg) ? tg.map((t) => t.name) : tg ? [tg.name] : [];
      wiki = info.wiki?.summary ?? '';
    }
  } catch {}

  return {
    title: `${item.artist} — ${item.name}`,
    type: 'music_album',
    metadata: JSON.stringify({
      artist: item.artist,
      album: item.name,
      lastfmUrl: item.url,
      tracks: tracks.map((t) => ({ name: t.name, duration: t.duration })),
      tags,
      wiki: wiki.slice(0, 500),
    }),
    imageUrl: getImage(item.image),
  };
}

export async function searchTracks(query: string): Promise<LastfmTrackSearchResult[]> {
  const key = await getKey();
  if (!key) throw new Error('Last.fm API key not configured');

  const res = await fetch('/api/lastfm/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, type: 'track', apiKey: key }),
  });
  if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);
  return res.json();
}

export function parseTrack(item: LastfmTrackSearchResult): ParsedTrack {
  return {
    title: `${item.artist} — ${item.name}`,
    type: 'music_song',
    metadata: JSON.stringify({
      artist: item.artist,
      track: item.name,
      lastfmUrl: item.url,
      listeners: item.listeners,
    }),
    imageUrl: getImage(item.image, 'medium'),
  };
}
