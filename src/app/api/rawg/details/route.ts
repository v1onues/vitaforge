import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id, apiKey } = await request.json();
    if (!id || !apiKey) {
      return NextResponse.json({ error: 'ID ve API key gerekli' }, { status: 400 });
    }

    const params = new URLSearchParams({ key: apiKey });
    const res = await fetch(`https://api.rawg.io/api/games/${id}?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: `RAWG error: ${res.status}` }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
