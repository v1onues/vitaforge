import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, apiKey } = await request.json();
    if (!query || !apiKey) {
      return NextResponse.json({ error: 'Query ve API key gerekli' }, { status: 400 });
    }

    const params = new URLSearchParams({ query, language: 'tr-TR', api_key: apiKey });
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?${params}`, {
      headers: { accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `TMDB error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const results = (data.results ?? []).filter(
      (r: { media_type: string }) => r.media_type === 'movie' || r.media_type === 'tv'
    );
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
