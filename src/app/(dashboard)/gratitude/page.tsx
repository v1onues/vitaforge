'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, ChevronLeft, ChevronRight, Save, Check, Star, Sparkles } from 'lucide-react';
import { useGratitude } from '@/lib/hooks/use-gratitude';

export default function GratitudePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { entry, allEntries, saveEntry } = useGratitude(selectedDate);
  const [items, setItems] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (entry) {
      setItems([...entry.items, '', '', ''].slice(0, 3)); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setItems(['', '', '']);  
    }
  }, [entry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveEntry(items);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const navigateDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            Günlük Notlar
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bugün güzel geçen 3 şey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {i === 0 ? <Heart className="w-5 h-5 text-pink-500" /> : i === 1 ? <Star className="w-5 h-5 text-yellow-500" /> : <Sparkles className="w-5 h-5 text-purple-500" />}
                  </span>
                  <Input
                    placeholder={`${i + 1}. şey...`}
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                  />
                </div>
              ))}
              <Button onClick={handleSave} disabled={saving} className="w-full">
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Geçmiş</CardTitle>
            </CardHeader>
            <CardContent>
              {allEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz kayıt yok
                </p>
              ) : (
                <div className="space-y-3">
                  {allEntries.slice(0, 14).map((e) => (
                    <button
                      key={e.id}
                      className={`w-full text-left p-2 rounded-lg text-sm hover:bg-muted/50 transition-colors ${
                        e.date === selectedDate ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedDate(e.date)}
                    >
                      <div className="font-medium text-xs text-muted-foreground mb-1">
                        {new Date(e.date + 'T12:00:00').toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                      {e.items.map((item, i) => (
                        <p key={i} className="text-xs truncate">{item}</p>
                      ))}
                    </button>
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
