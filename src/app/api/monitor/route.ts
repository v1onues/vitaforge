import { NextResponse } from 'next/server';

interface MonitorResult {
  name: string;
  url: string;
  status: 'up' | 'down';
  latency: number | null;
  error: string | null;
  timestamp: number;
}

async function checkUrl(name: string, url: string): Promise<MonitorResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return {
      name,
      url,
      status: res.ok ? 'up' : 'down',
      latency: Date.now() - start,
      error: res.ok ? null : `HTTP ${res.status}`,
      timestamp: start,
    };
  } catch (err) {
    return {
      name,
      url,
      status: 'down',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: start,
    };
  }
}

export async function GET() {
  const results = await Promise.all([
    checkUrl('treas.net.tr', 'https://treas.net.tr'),
    checkUrl('PayTR', 'https://www.paytr.com'),
  ]);
  return NextResponse.json({ results, checkedAt: Date.now() });
}

export async function POST(request: Request) {
  let body: { endpoints?: Array<{ name: string; url: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ results: [], checkedAt: Date.now() });
  }

  const endpoints = body.endpoints ?? [];
  if (endpoints.length === 0) {
    return NextResponse.json({ results: [], checkedAt: Date.now() });
  }

  const results = await Promise.all(
    endpoints.map((ep) => checkUrl(ep.name, ep.url))
  );

  return NextResponse.json({ results, checkedAt: Date.now() });
}
