import { db } from '@/lib/db/schema';

const GB_BASE = 'https://www.googleapis.com/books/v1';

async function getKey(): Promise<string> {
  const s = await db.settings.get('main');
  return s?.googleBooksApiKey ?? '';
}

export interface GBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    publisher?: string;
    categories?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

export interface ParsedBook {
  title: string;
  author: string;
  imageUrl: string | null;
  metadata: string;
  url: string | null;
}

export async function searchBooks(query: string): Promise<GBookResult[]> {
  const key = await getKey();
  if (!key) throw new Error('Google Books API key not configured');

  const params = new URLSearchParams({ q: query, langRestrict: 'tr', maxResults: '8' });
  const url = `${GB_BASE}/volumes?${params}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books error: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

export function parseBook(item: GBookResult): ParsedBook {
  const v = item.volumeInfo;
  return {
    title: v.title,
    author: v.authors?.[0] ?? '',
    imageUrl: v.imageLinks?.thumbnail?.replace('http:', 'https:')?.replace('&edge=curl', '') ?? null,
    metadata: JSON.stringify({
      googleBooksId: item.id,
      pageCount: v.pageCount ?? null,
      publisher: v.publisher ?? null,
      categories: v.categories ?? [],
      publishedDate: v.publishedDate ?? null,
      description: v.description ?? '',
    }),
    url: `https://books.google.com/books?id=${item.id}`,
  };
}
