'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Radio, Loader2 } from 'lucide-react';
import type { RadioStation } from '@/lib/db/schema';

interface RadioPlayerProps {
  station: RadioStation | null;
}

export function RadioPlayer({ station }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => { setLoading(false); setPlaying(true); setError(null); };
    const onWaiting = () => { setLoading(true); };
    const onError = () => { setLoading(false); setPlaying(false); setError('Yayın bağlantı hatası'); };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !station) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (currentSrc !== station.url) {
        audio.src = station.url;
        setCurrentSrc(station.url);
      }
      setLoading(true);
      setError(null);
      audio.play().catch(() => {
        setLoading(false);
        setError('Yayın başlatılamadı');
      });
    }
  }, [playing, station, currentSrc]);

  useEffect(() => {
    if (!station && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setCurrentSrc(null);
      setPlaying(false);
      setLoading(false);
      setError(null);
    }
  }, [station]);

  useEffect(() => {
    if (station && currentSrc && currentSrc !== station.url && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      setLoading(false);
      setError(null);
    }
  }, [station, currentSrc]);

  if (!station) {
    return (
      <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
        <CardContent className="py-6 text-center text-muted-foreground">
          <Radio className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Dinlemek için bir istasyon seç</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{station.name}</p>
            <p className="text-xs text-muted-foreground">{station.genre}{station.country ? ` · ${station.country}` : ''}</p>
          </div>
          {playing && (
            <div className="flex items-center gap-0.5 shrink-0">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 12}px`, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={togglePlay}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> :
              playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <div className="w-9" />
        </div>

        {!muted && (
          <div className="flex items-center gap-2 px-4">
            <Volume2 className="w-3 h-3 text-muted-foreground shrink-0" />
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 accent-primary cursor-pointer"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        )}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}
      </CardContent>
    </Card>
  );
}
