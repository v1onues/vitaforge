import { db } from '@/lib/db/schema';

async function getKey(): Promise<string> {
  const s = await db.settings.get('main');
  return s?.tmdbApiKey ?? '';
}

export interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
  overview: string;
}

export interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genres: { id: number; name: string }[];
  credits?: { crew: { job: string; name: string }[] };
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export async function searchTmdb(query: string): Promise<TmdbSearchResult[]> {
  const key = await getKey();
  if (!key) throw new Error('TMDB API key not configured');

  const res = await fetch('/api/tmdb/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, apiKey: key }),
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function getTmdbDetails(id: number, type: 'movie' | 'tv'): Promise<TmdbDetails> {
  const key = await getKey();
  if (!key) throw new Error('TMDB API key not configured');

  const res = await fetch('/api/tmdb/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type, apiKey: key }),
  });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export function posterUrl(path: string | null, size: 'w92' | 'w185' | 'w500' = 'w185'): string | null {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function parseTmdbDetails(details: TmdbDetails) {
  const isMovie = !!details.title;
  const title = isMovie ? details.title! : details.name!;
  const year = isMovie
    ? details.release_date?.slice(0, 4)
    : details.first_air_date?.slice(0, 4);
  const director = details.credits?.crew?.find((c) => c.job === 'Director')?.name ?? null;
  const genres = details.genres?.map((g) => g.name) ?? [];
  const runtime = isMovie ? details.runtime : details.episode_run_time?.[0] ?? null;

  return {
    title,
    type: (isMovie ? 'movie' : 'series') as 'movie' | 'series',
    metadata: JSON.stringify({
      tmdb_id: details.id,
      year: year ? Number(year) : null,
      director,
      genre: genres,
      overview: details.overview,
      runtime,
      number_of_seasons: details.number_of_seasons ?? null,
      number_of_episodes: details.number_of_episodes ?? null,
    }),
    imageUrl: posterUrl(details.poster_path, 'w500'),
  };
}
