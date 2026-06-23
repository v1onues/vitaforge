'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, Save, Check, Frown, Meh, Smile, Sparkles, Loader2 } from 'lucide-react';
import { useJournal } from '@/lib/hooks/use-journal';
import { db } from '@/lib/db/schema';

const MOOD_ICONS = [Frown, Meh, Meh, Smile, Smile];

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { entry, allEntries, saveEntry } = useJournal(selectedDate);
  const [whatIDid, setWhatIDid] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [mood, setMood] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (entry) {
      setWhatIDid(entry.whatIDid); // eslint-disable-line react-hooks/set-state-in-effect
      setWhatILearned(entry.whatILearned);  
      setTomorrowPlan(entry.tomorrowPlan);  
      setMood(entry.mood);  
    } else {
      setWhatIDid('');  
      setWhatILearned('');  
      setTomorrowPlan('');  
      setMood(3);  
    }
  }, [entry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveEntry({ whatIDid, whatILearned, tomorrowPlan, mood });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const navigateDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const generateAiSummary = async () => {
    if (allEntries.length === 0) return;
    setAiLoading(true);
    setAiError('');
    try {
      const settings = await db.settings.get('main');
      if (!settings?.aiApiKey) {
        setAiError('Önce Ayarlar sayfasından AI API key girmelisin.');
        setAiLoading(false);
        return;
      }

      const recent = allEntries.slice(0, 14).map((e) => ({
        date: e.date,
        mood: e.mood,
        whatIDid: e.whatIDid?.slice(0, 100),
        whatILearned: e.whatILearned?.slice(0, 100),
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Son günlük kayıtlarına göre kısa, anlamlı bir özet çıkar. En fazla 3 cümle. Türkçe yanıtla. Motivasyonu yüksek tut.' },
            { role: 'user', content: JSON.stringify(recent) },
          ],
          provider: settings.aiProvider || 'openrouter',
          apiKey: settings.aiApiKey,
          model: settings.aiModel || '',
          tool_choice: 'none',
        }),
      });
      if (!res.ok) throw new Error('API hatası');
      const data = await res.json();
      setAiSummary(data.choices?.[0]?.message?.content || 'Özet alınamadı.');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Günlük
          </h1>
          <p className="text-muted-foreground">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
            Bugün
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* What I Did */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bugün Ne Yaptım?</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Bugün yaptığın şeyler... (görevler, projeler, öğrenmeler)"
                value={whatIDid}
                onChange={(e) => setWhatIDid(e.target.value)}
                className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
            </CardContent>
          </Card>

          {/* What I Learned */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ne Öğrendim?</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Bugün edindiğin bilgi, beceri veya farkındalık..."
                value={whatILearned}
                onChange={(e) => setWhatILearned(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
            </CardContent>
          </Card>

          {/* Tomorrow Plan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Yarın Ne Yapacağım?</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Yarın için planların, hedeflerin..."
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Kaydedildi!
              </>
            ) : saving ? (
              'Kaydediliyor...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mood */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bugünkü Ruh Halim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-center">
                {MOOD_ICONS.map((Icon, i) => (
                  <Button
                    key={i}
                    variant={mood === i + 1 ? 'default' : 'outline'}
                    size="lg"
                    className="w-14 h-14 p-0"
                    onClick={() => setMood(i + 1)}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Past Entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Geçmiş Kayıtlar</CardTitle>
            </CardHeader>
            <CardContent>
              {allEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz kayıt yok
                </p>
              ) : (
                <div className="space-y-2">
                  {allEntries.slice(0, 10).map((e) => (
                    <button
                      key={e.id}
                      className={`w-full text-left p-2 rounded-lg text-sm hover:bg-muted/50 transition-colors ${
                        e.date === selectedDate ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedDate(e.date)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {new Date(e.date + 'T12:00:00').toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <span className="text-muted-foreground">
                          {(() => {
                            const MIcon = MOOD_ICONS[e.mood - 1] ?? Meh;
                            return <MIcon className="w-4 h-4" />;
                          })()}
                        </span>
                      </div>
                      {e.whatIDid && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {e.whatIDid.substring(0, 60)}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Summary */}
          {allEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  AI Özet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiSummary ? (
                  <p className="text-sm text-muted-foreground">{aiSummary}</p>
                ) : aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Özet hazırlanıyor...
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={generateAiSummary}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Son Günlerin Özeti
                  </Button>
                )}
                {aiError && <p className="text-xs text-destructive mt-1">{aiError}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
