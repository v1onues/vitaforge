'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { useMonitor } from '@/lib/hooks/use-monitor';

interface MonitorResult {
  name: string;
  url: string;
  status: 'up' | 'down';
  latency: number | null;
  error: string | null;
  timestamp: number;
}

interface MonitorData {
  results: MonitorResult[];
  checkedAt: number;
}

export function ServerMonitor() {
  const { endpoints, isLoading } = useMonitor();
  const enabledEndpoints = endpoints.filter((e) => e.enabled);
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    if (enabledEndpoints.length === 0) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoints: enabledEndpoints.map((e) => ({ name: e.name, url: e.url })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check');
    } finally {
      setLoading(false);
    }
  }, [enabledEndpoints]);

  useEffect(() => {
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [check]);

  return (
    <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            Sunucu Durumu
          </h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={check} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading && <p className="text-xs text-muted-foreground">Yükleniyor...</p>}

        {!isLoading && enabledEndpoints.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Henüz endpoint eklenmedi</p>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {data?.results.map((r) => (
          <div key={r.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {r.status === 'up' ? (
                <Wifi className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
              )}
              <span>{r.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {r.status === 'up' ? (
                <Badge variant="default" className="text-[10px] h-5 bg-green-500/10 text-green-500 hover:bg-green-500/10">
                  {r.latency}ms
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] h-5 bg-red-500/10 text-red-500">
                  HATA
                </Badge>
              )}
            </div>
          </div>
        ))}

        {data && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Son kontrol: {new Date(data.checkedAt).toLocaleTimeString('tr-TR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
