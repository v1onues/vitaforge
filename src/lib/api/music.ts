import { db } from '@/lib/db/schema';

const LF_BASE = 'https://ws.audioscrobbler.com/2.0';

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

  const params = new URLSearchParams({
    method: 'album.search', album: query, api_key: key, format: 'json', limit: '8',
  });
  const res = await fetch(`${LF_BASE}?${params}`);
  if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);
  const data = await res.json();
  return data.results?.albummatches?.album ?? [];
}

export async function getAlbumInfo(artist: string, album: string): Promise<LastfmAlbumInfo | null> {
  const key = await getKey();
  if (!key) return null;

  const params = new URLSearchParams({
    method: 'album.getinfo', artist, album, api_key: key, format: 'json',
  });
  const res = await fetch(`${LF_BASE}?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.album ?? null;
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

  const params = new URLSearchParams({
    method: 'track.search', track: query, api_key: key, format: 'json', limit: '8',
  });
  const res = await fetch(`${LF_BASE}?${params}`);
  if (!res.ok) throw new Error(`Last.fm error: ${res.status}`);
  const data = await res.json();
  return data.results?.trackmatches?.track ?? [];
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
