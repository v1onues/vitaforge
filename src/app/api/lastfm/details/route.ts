import { NextRequest, NextResponse } from 'next/server';

const LF_BASE = 'https://ws.audioscrobbler.com/2.0';

export async function POST(request: NextRequest) {
  try {
    const { artist, album, apiKey } = await request.json();
    if (!artist || !album || !apiKey) {
      return NextResponse.json({ error: 'Artist, album ve API key gerekli' }, { status: 400 });
    }

    const params = new URLSearchParams({
      method: 'album.getinfo',
      artist,
      album,
      api_key: apiKey,
      format: 'json',
    });

    const res = await fetch(`${LF_BASE}?${params}`);
    if (!res.ok) return NextResponse.json(null);
    const data = await res.json();
    return NextResponse.json(data.album ?? null);
  } catch (err) {
    return NextResponse.json(null);
  }
}
