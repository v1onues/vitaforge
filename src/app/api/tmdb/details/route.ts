import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, type, apiKey } = await request.json();
    if (!id || !type || !apiKey) {
      return NextResponse.json({ error: 'ID, type ve API key gerekli' }, { status: 400 });
    }

    const params = new URLSearchParams({ language: 'tr-TR', append_to_response: 'credits', api_key: apiKey });
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?${params}`, {
      headers: { accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `TMDB error: ${res.status}` }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
