import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, apiKey } = await request.json();
    if (!query || !apiKey) {
      return NextResponse.json({ error: 'Query ve API key gerekli' }, { status: 400 });
    }

    const params = new URLSearchParams({ query, key: apiKey, page_size: '6' });
    const res = await fetch(`https://api.rawg.io/api/games?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: `RAWG error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data.results ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
