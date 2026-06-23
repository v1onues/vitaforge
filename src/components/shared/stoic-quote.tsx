'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Quote, BookMarked, BookOpen } from 'lucide-react';
import { getDailyQuote } from '@/lib/data/stoic-quotes';
import { useReading } from '@/lib/hooks/use-reading';

export function StoicQuote() {
  const quote = getDailyQuote();
  const { items, updateItem } = useReading();
  const mindsetBook = items.find(
    (i) => i.title.toLowerCase().includes('mindset') && i.type === 'book'
  );
  const [pageInput, setPageInput] = useState(mindsetBook?.currentPage?.toString() ?? '');
  const [saved, setSaved] = useState(false);

  const handleSavePage = async () => {
    if (!mindsetBook || !pageInput) return;
    const page = Number(pageInput);
    if (isNaN(page)) return;
    await updateItem(mindsetBook.id, {
      currentPage: page,
      progress: mindsetBook.totalPages ? Math.min(100, Math.round((page / mindsetBook.totalPages) * 100)) : mindsetBook.progress,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="border-0 bg-black/[0.02] dark:bg-white/[0.02]">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Quote className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Stoaci Soz</span>
        </div>

        <blockquote className="text-sm leading-relaxed italic border-l-2 border-primary/30 pl-3">
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        <p className="text-xs text-muted-foreground text-right">&mdash; {quote.author}</p>

        {mindsetBook && (
          <div className="border-t border-muted/30 pt-3 mt-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <BookMarked className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">{mindsetBook.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                type="number"
                placeholder="Sayfa"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="h-7 text-xs w-20"
                min={1}
              />
              <span className="text-xs text-muted-foreground">
                / {mindsetBook.totalPages ?? '?'}
              </span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSavePage} disabled={!pageInput}>
                {saved ? 'Kaydedildi' : 'Kaydet'}
              </Button>
            </div>
          </div>
        )}

        {!mindsetBook && (
          <div className="border-t border-muted/30 pt-3 mt-3">
            <p className="text-xs text-muted-foreground">
              Okuma listene &quot;Mindset&quot; kitabini ekle, sayfa takibi burada gorunsun.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
