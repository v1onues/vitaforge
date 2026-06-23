'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Save, Check, Trash2, Smile, Frown } from 'lucide-react';
import { useSleep } from '@/lib/hooks/use-sleep';

export default function SleepPage() {
  const { logs, todayLog, saveLog, deleteLog, avgQuality } = useSleep();
  const [bedtime, setBedtime] = useState(todayLog?.bedtime ?? '');
  const [wakeTime, setWakeTime] = useState(todayLog?.wakeTime ?? '');
  const [quality, setQuality] = useState(todayLog?.quality ?? 3);
  const [notes, setNotes] = useState(todayLog?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function calcDuration(bed: string, wake: string): string {
    if (!bed || !wake) return '—';
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    const start = bh * 60 + bm;
    let end = wh * 60 + wm;
    if (end <= start) end += 24 * 60;
    const diff = end - start;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}sa ${m}dk`;
  }

  const duration = calcDuration(bedtime, wakeTime);

  const handleSave = async () => {
    if (!bedtime || !wakeTime) return;
    setSaving(true);
    try {
      await saveLog({ bedtime, wakeTime, quality, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="w-6 h-6 text-indigo-500" />
          Uyku Takibi
        </h1>
        <p className="text-muted-foreground">Uyku kaliteni takip et</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bugünkü Uykum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yatma Saati</label>
                    <Input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kalkma Saati</label>
                    <Input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                    />
                  </div>
                </div>
                {bedtime && wakeTime && (
                  <p className="text-center text-sm text-muted-foreground">
                    Toplam uyku: <span className="font-medium text-foreground">{duration}</span>
                  </p>
                )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Kalite</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Button
                      key={v}
                      variant={quality === v ? 'default' : 'outline'}
                      size="lg"
                      className="w-14 h-14 text-2xl p-0"
                      onClick={() => setQuality(v)}
                    >
                      {v <= quality ? <Moon className="w-5 h-5 text-indigo-500" /> : <Frown className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notlar</label>
                <Input
                  placeholder="Uyku hakkında not..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button onClick={handleSave} disabled={saving || !bedtime || !wakeTime} className="w-full">
                {saved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Kaydedildi!
                  </>
                ) : saving ? 'Kaydediliyor...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold">{logs.length}</div>
                <p className="text-xs text-muted-foreground">Toplam gece</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{avgQuality}</div>
                <p className="text-xs text-muted-foreground">Ortalama kalite</p>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Geçmiş</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz kayıt yok
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 14).map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1.5 text-sm">
                      <div>
                        <span className="font-medium">
                          {new Date(log.date + 'T12:00:00').toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {log.bedtime} - {log.wakeTime}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({calcDuration(log.bedtime, log.wakeTime)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {log.quality >= 4 ? <Moon className="w-4 h-4 text-indigo-500" /> : log.quality >= 3 ? <Smile className="w-4 h-4" /> : <Frown className="w-4 h-4" />}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteLog(log.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
