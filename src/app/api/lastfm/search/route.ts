import { NextRequest, NextResponse } from 'next/server';

const LF_BASE = 'https://ws.audioscrobbler.com/2.0';

export async function POST(request: NextRequest) {
  try {
    const { query, type, apiKey } = await request.json();
    if (!query || !apiKey) {
      return NextResponse.json({ error: 'Query ve API key gerekli' }, { status: 400 });
    }

    const isTrack = type === 'track';
    const params = new URLSearchParams({
      method: isTrack ? 'track.search' : 'album.search',
      [isTrack ? 'track' : 'album']: query,
      api_key: apiKey,
      format: 'json',
      limit: '8',
    });

    const res = await fetch(`${LF_BASE}?${params}`);
    if (!res.ok) {
      return NextResponse.json({ error: `Last.fm error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    if (isTrack) {
      return NextResponse.json(data.results?.trackmatches?.track ?? []);
    }
    return NextResponse.json(data.results?.albummatches?.album ?? []);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
