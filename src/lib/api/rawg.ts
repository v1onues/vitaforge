import { db } from '@/lib/db/schema';

async function getKey(): Promise<string> {
  const s = await db.settings.get('main');
  return s?.rawgApiKey ?? '';
}

export interface RawgSearchResult {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  platforms: { platform: { id: number; name: string; slug: string } }[];
  genres: { id: number; name: string; slug: string }[];
}

export interface RawgDetails {
  id: number;
  name: string;
  description_raw: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  metacritic: number | null;
  playtime: number;
  platforms: { platform: { id: number; name: string; slug: string } }[];
  genres: { id: number; name: string; slug: string }[];
  developers: { id: number; name: string }[];
  website: string | null;
  achievements_count: number;
}

export async function searchRawg(query: string): Promise<RawgSearchResult[]> {
  const key = await getKey();
  if (!key) throw new Error('RAWG API key not configured');

  const res = await fetch('/api/rawg/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, apiKey: key }),
  });
  if (!res.ok) throw new Error(`RAWG error: ${res.status}`);
  return res.json();
}

export async function getRawgDetails(id: number): Promise<RawgDetails> {
  const key = await getKey();
  if (!key) throw new Error('RAWG API key not configured');

  const res = await fetch('/api/rawg/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, apiKey: key }),
  });
  if (!res.ok) throw new Error(`RAWG error: ${res.status}`);
  return res.json();
}

export function parseRawgResult(result: RawgSearchResult): {
  title: string;
  type: 'game';
  metadata: string;
  imageUrl: string | null;
} {
  return {
    title: result.name,
    type: 'game',
    metadata: JSON.stringify({
      rawg_id: result.id,
      year: result.released?.slice(0, 4) ?? null,
      platforms: result.platforms.map((p) => p.platform.name),
      genres: result.genres.map((g) => g.name),
      rawg_rating: result.rating,
    }),
    imageUrl: result.background_image,
  };
}

export function parseRawgDetails(details: RawgDetails) {
  return {
    title: details.name,
    type: 'game' as const,
    metadata: JSON.stringify({
      rawg_id: details.id,
      year: details.released?.slice(0, 4) ?? null,
      platforms: details.platforms.map((p) => p.platform.name),
      genres: details.genres.map((g) => g.name),
      developers: details.developers.map((d) => d.name),
      playtime: details.playtime,
      achievements: details.achievements_count,
      metacritic: details.metacritic,
      overview: details.description_raw?.slice(0, 1000),
      website: details.website,
    }),
    imageUrl: details.background_image,
  };
}
