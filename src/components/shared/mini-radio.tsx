'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Radio, Loader2, X, ChevronUp } from 'lucide-react';
import { db } from '@/lib/db/schema';
import { useRadioStore } from '@/lib/stores/radio-store';
import type { RadioStation } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

export function MiniRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<unknown>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [localStation, setLocalStation] = useState<RadioStation | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [showList, setShowList] = useState(false);
  const { activeStation: storeStation, setActiveStation: setStoreStation } = useRadioStore();

  const barHeights = useMemo(() => [8 + Math.random() * 12, 8 + Math.random() * 12, 8 + Math.random() * 12], []);

  const activeStation = localStation;

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      try { (hlsRef.current as { destroy: () => void }).destroy(); } catch {}
      hlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    return () => {
      destroyHls();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    };
  }, [destroyHls]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => { setLoading(false); setPlaying(true); setError(null); };
    const onWaiting = () => { setLoading(true); };
    const onError = () => { setLoading(false); setPlaying(false); setError('Bağlantı hatası'); };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, []);

  useEffect(() => {
    const loadStations = async () => {
      const s = await db.radioStations.orderBy('order').toArray();
      setStations(s.filter((st) => st.order >= 0));
    };
    loadStations();
  }, []);

  // React to external station changes (from radio page)
  useEffect(() => {
    if (storeStation && (!activeStation || activeStation.id !== storeStation.id)) {
      setLocalStation(storeStation);
      setStoreStation(null);
    }
  }, [storeStation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStream = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    destroyHls();
    setError(null);

    if (/\.m3u8(\?.*)?$/.test(url)) {
      import('hls.js').then((HlsModule) => {
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => { audio.play().catch(() => {}); });
          hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal: boolean; type: string }) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setError('Bağlantı hatası');
                setPlaying(false);
                setLoading(false);
              }
            }
          });
          hlsRef.current = hls;
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = url;
          audio.play().catch(() => {});
        } else {
          setError('Bu yayın tarayıcınızda desteklenmiyor');
          setLoading(false);
        }
      }).catch(() => {
        setError('HLS kütüphanesi yüklenemedi');
        setLoading(false);
      });
    } else {
      audio.src = url;
      audio.play().catch(() => {
        setError('Başlatılamadı');
        setLoading(false);
      });
    }
  }, [destroyHls]);

  const playStation = useCallback((station: RadioStation) => {
    setLocalStation(station);
    setStoreStation(station);
    setCurrentSrc(station.url);
    setLoading(true);
    setExpanded(true);
    setShowList(false);
    loadStream(station.url);
  }, [loadStream, setStoreStation]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeStation) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      setError(null);
      audio.play().catch(() => loadStream(activeStation.url));
    }
  }, [playing, activeStation, loadStream]);

  const stopAndClear = useCallback(() => {
    destroyHls();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    setPlaying(false);
    setLoading(false);
    setError(null);
    setLocalStation(null);
    setCurrentSrc(null);
    setExpanded(false);
  }, [destroyHls]);

  useEffect(() => {
    if (activeStation && activeStation.url && currentSrc !== activeStation.url) {
      setCurrentSrc(activeStation.url);
      setLoading(true);
      loadStream(activeStation.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStation?.url]);

  const categories = ['turkish', 'international', 'custom'] as const;
  const categoryLabels: Record<string, string> = { turkish: 'Türkçe', international: 'Uluslararası', custom: 'Özel' };
  const grouped = categories
    .map((cat) => ({ key: cat, label: categoryLabels[cat], items: stations.filter((s) => s.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {showList && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-h-64 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl">
          <div className="p-2">
            {grouped.map((g) => (
              <div key={g.key}>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">{g.label}</p>
                {g.items.map((s) => (
                  <button
                    key={s.id}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left hover:bg-muted transition-colors',
                      activeStation?.id === s.id && 'bg-primary/10'
                    )}
                    onClick={() => playStation(s)}
                  >
                    <Radio className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{s.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{s.genre}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={cn('mx-auto transition-all duration-300', expanded ? 'max-w-2xl p-2 pb-2' : 'max-w-sm p-2 pb-2')}>
        <div className={cn(
          'bg-card border border-border rounded-xl shadow-lg flex items-center transition-all duration-300',
          expanded ? 'gap-3 px-3 py-2.5' : 'gap-2 px-3 py-2'
        )}>
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-2 min-w-0 shrink-0 hover:bg-muted/50 rounded-lg px-1.5 py-1 transition-colors"
          >
            <Radio className={cn('w-4 h-4 shrink-0', activeStation ? 'text-pink-500' : 'text-muted-foreground')} />
            <span className="text-sm truncate max-w-[120px]">
              {activeStation ? activeStation.name : 'Radyo Seç'}
            </span>
            {activeStation && playing && (
              <div className="flex items-center gap-0.5 shrink-0">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-0.5 bg-pink-500 rounded-full animate-pulse" style={{ height: `${barHeights[i]}px`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </button>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMuted(!muted)}>
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
            {activeStation ? (
              <Button size="icon" className="h-7 w-7 rounded-full" onClick={togglePlay} disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                  playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </Button>
            ) : (
              <Button size="icon" className="h-7 w-7 rounded-full" onClick={() => setShowList(!showList)}>
                <Play className="w-3.5 h-3.5" />
              </Button>
            )}
            {expanded && (
              <div className="flex items-center gap-1.5 ml-1">
                <input type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 accent-primary cursor-pointer" />
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
              <ChevronUp className={cn('w-3.5 h-3.5 transition-transform', !expanded && 'rotate-180')} />
            </Button>
            {activeStation && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={stopAndClear}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-destructive text-center mt-1">{error}</p>}
      </div>
    </div>
  );
}
