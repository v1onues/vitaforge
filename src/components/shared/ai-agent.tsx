'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, X, Loader2, Sparkles } from 'lucide-react';
import { db } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  toolCalls?: unknown[];
  toolResults?: unknown[];
}

const SYSTEM_PROMPT = `Sen VitaForge kişisel yönetim asistanısın. Türkçe konuşuyorsun ve kullanıcının hayatının her alanını yönetmesine yardımcı oluyorsun.

## YETENEKLERİN
- Görev/task ekleme, güncelleme, silme
- Proje oluşturma
- Not alma (Markdown destekler)
- Film/dizi/oyun/müzik ekleme ve güncelleme (TMDB, RAWG, Last.fm entegrasyonu)
- Kitap/okuma listesi
- Günlük yazma
- Alışkanlık oluşturma ve takip
- Finansal kayıt (gelir/gider)
- Uyku takibi
- Spor/egzersiz kaydı
- Minnettarlık günlüğü
- Hedef belirleme

## MEDYA İŞLEMLERİ (ÖNEMLİ)
Kullanıcı bir film, dizi veya oyundan bahsederse:
1. Önce search_tmdb veya search_rawg ile ara (orijinal isimle)
2. Bulduğunda get_tmdb_details ile detayları çek
3. Sonra add_media ile kaydet (metadata'ya TMDB verilerini JSON olarak koy)
4. Poster için imageUrl ekle (https://image.tmdb.org/t/p/w500 + poster_path)

Örnek akış — kullanıcı "Dexter izliyorum 2. sezon 7. bölümdeyim" derse:
1. search_tmdb("Dexter") → sonuç bul
2. get_tmdb_details(id, "tv") → sezon/bölüm bilgisi al
3. add_media(title="Dexter", type="series", status="active", metadata={tmdb detayları}, currentEpisode=7, totalEpisodes=toplam, imageUrl=poster)

## TÜRKÇE ANLAMA
Kullanıcı günlük dilde yazar, sen parsesin:
- "bugün 3 saat proje çalıştım" → create_task + log_activity
- "500 TL market harcadım" → add_transaction(type="expense", amount=500, category="yiyecek")
- "dune 2 izledim 8/10" → search_tmdb("Dune") → add_media(movie, done, rating=8)
- "gece 12 uyudum sabah 8 kalktım" → log_sleep(bedtime="00:00", wakeTime="08:00")
- "30 dk koşu yaptım" → log_sport(type="koşu", duration=30)
- "şükran: sağlıklı olmaktan" → log_gratitude

## KURALLAR
- Kullanıcı işlem isterse → uygun fonksiyonu çağır ve sonucu Türkçe, kısa açıkla
- Sadece sohbet ederse → fonksiyon çağırmadan doğrudan cevap ver
- Birden fazla işlem gerekiyorsa → sırayla çağır (medya eklemede search → details → add zinciri)
- Medya eklerken TMDB verilerini metadata'ya JSON string olarak koy
- Yararlı ve özet tut. Uzun lafı uzatma.`;

export function AiAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'assistant',
      content: 'Merhaba! Ben VitaForge AI asistanıyım. Bana doğal Türkçe olarak ne yapmak istediğini söyle, ben hallederim.\n\nÖrnekler:\n• "Dexter izliyorum, 2. sezon 7. bölümdeyim"\n• "Bugün 500 TL market harcadım"\n• "Dune 2 izledim, 8/10 puan verdim"\n• "Gece 12 uyudum, sabah 8 kalktım"\n• "30 dakika koşu yaptım"\n• "Yeni görev: API entegrasyonu, öncelik yüksek"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const posterUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w500${path}` : null;

  const executeTool = async (toolCall: { id: string; function: { name: string; arguments: string } }) => {
    const args = JSON.parse(toolCall.function.arguments);
    const name = toolCall.function.name;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    try {
      switch (name) {
        case 'create_task': {
          const id = crypto.randomUUID();
          await db.tasks.add({
            id,
            title: args.title,
            description: args.description || '',
            priority: args.priority || 'normal',
            status: args.status || 'todo',
            deadline: args.deadline ? new Date(args.deadline).getTime() : null,
            projectId: args.projectId || null,
            groupId: null,
            tags: args.tags || [],
            completedAt: null,
            parentId: null,
            order: 0,
            recurringPattern: null,
            lastRecurringAt: null,
            estimatedMinutes: null,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, title: args.title });
        }
        case 'update_task': {
          await db.tasks.update(args.id, {
            ...(args.title && { title: args.title }),
            ...(args.description !== undefined && { description: args.description }),
            ...(args.priority && { priority: args.priority }),
            ...(args.status && { status: args.status, completedAt: args.status === 'done' ? now : null }),
            ...(args.deadline !== undefined && { deadline: args.deadline ? new Date(args.deadline).getTime() : null }),
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id: args.id });
        }
        case 'delete_task': {
          await db.tasks.delete(args.id);
          return JSON.stringify({ success: true, id: args.id });
        }
        case 'create_project': {
          const id = crypto.randomUUID();
          await db.projects.add({
            id,
            name: args.name,
            description: args.description || '',
            color: args.color || '#3b82f6',
            icon: 'FolderKanban',
            status: args.status || 'active',
            priority: 'normal',
            startDate: null,
            endDate: null,
            tags: [],
            budget: null,
            url: null,
            estimatedHours: null,
            order: 0,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, name: args.name });
        }
        case 'create_note': {
          const id = crypto.randomUUID();
          await db.notes.add({
            id,
            title: args.title,
            content: args.content,
            tags: args.tags || [],
            links: [],
            pinned: false,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, title: args.title });
        }
        case 'log_habit': {
          const id = crypto.randomUUID();
          await db.habitLogs.add({
            id,
            habitId: args.habitId,
            date: args.date,
            value: args.value ?? 1,
            notes: args.notes || '',
            createdAt: now,
          });
          return JSON.stringify({ success: true, id });
        }
        case 'create_habit': {
          const id = crypto.randomUUID();
          await db.habits.add({
            id,
            name: args.name,
            description: args.description || '',
            frequency: args.frequency,
            customDays: [],
            targetValue: null,
            unit: '',
            color: args.color || '#22c55e',
            icon: 'Repeat',
            reminderTime: null,
            archived: false,
            createdAt: now,
          });
          return JSON.stringify({ success: true, id, name: args.name });
        }

        // ===== MEDYA & TMDB =====
        case 'search_tmdb': {
          const settings = await db.settings.get('main');
          const apiKey = settings?.tmdbApiKey;
          if (!apiKey) return JSON.stringify({ error: 'TMDB API key ayarlarda tanımlı değil. Lütfen Ayarlar > Medya bölümünden ekleyin.' });

          const res = await fetch('/api/tmdb/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: args.query, apiKey }),
          });
          if (!res.ok) return JSON.stringify({ error: `TMDB arama hatası: ${res.status}` });
          const results = await res.json();
          return JSON.stringify({ success: true, results: results.slice(0, 5), query: args.query });
        }

        case 'get_tmdb_details': {
          const settings = await db.settings.get('main');
          const apiKey = settings?.tmdbApiKey;
          if (!apiKey) return JSON.stringify({ error: 'TMDB API key ayarlarda tanımlı değil.' });

          const res = await fetch('/api/tmdb/details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: args.id, type: args.type, apiKey }),
          });
          if (!res.ok) return JSON.stringify({ error: `TMDB detay hatası: ${res.status}` });
          const details = await res.json();
          const isMovie = !!details.title;
          return JSON.stringify({
            success: true,
            title: isMovie ? details.title : details.name,
            type: isMovie ? 'movie' : 'series',
            metadata: JSON.stringify({
              tmdb_id: details.id,
              year: (isMovie ? details.release_date : details.first_air_date)?.slice(0, 4) || null,
              director: details.credits?.crew?.find((c: { job: string }) => c.job === 'Director')?.name || null,
              genre: details.genres?.map((g: { name: string }) => g.name) || [],
              overview: details.overview || '',
              runtime: isMovie ? details.runtime : details.episode_run_time?.[0] || null,
              number_of_seasons: details.number_of_seasons || null,
              number_of_episodes: details.number_of_episodes || null,
            }),
            imageUrl: posterUrl(details.poster_path),
            number_of_seasons: details.number_of_seasons || null,
            number_of_episodes: details.number_of_episodes || null,
          });
        }

        case 'add_media': {
          const id = crypto.randomUUID();
          await db.mediaItems.add({
            id,
            title: args.title,
            type: args.type,
            status: args.status || 'planned',
            metadata: args.metadata || '{}',
            rating: args.rating ?? null,
            review: args.review || '',
            progress: 0,
            totalEpisodes: args.totalEpisodes ?? null,
            currentEpisode: args.currentEpisode ?? null,
            url: null,
            imageUrl: args.imageUrl || null,
            tags: args.tags || [],
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, title: args.title, type: args.type });
        }

        case 'update_media': {
          await db.mediaItems.update(args.id, {
            ...(args.status && { status: args.status }),
            ...(args.rating !== undefined && { rating: args.rating }),
            ...(args.review !== undefined && { review: args.review }),
            ...(args.currentEpisode !== undefined && { currentEpisode: args.currentEpisode }),
            ...(args.totalEpisodes !== undefined && { totalEpisodes: args.totalEpisodes }),
            ...(args.progress !== undefined && { progress: args.progress }),
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id: args.id });
        }

        case 'search_rawg': {
          const settings = await db.settings.get('main');
          const apiKey = settings?.rawgApiKey;
          if (!apiKey) return JSON.stringify({ error: 'RAWG API key ayarlarda tanımlı değil.' });

          const res = await fetch('/api/rawg/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: args.query, apiKey }),
          });
          if (!res.ok) return JSON.stringify({ error: `RAWG arama hatası: ${res.status}` });
          const results = await res.json();
          return JSON.stringify({ success: true, results: results.slice(0, 5) });
        }

        // ===== OKUMA =====
        case 'add_reading': {
          const id = crypto.randomUUID();
          await db.readingItems.add({
            id,
            title: args.title,
            author: args.author || '',
            type: args.type || 'book',
            status: args.status || 'to_read',
            progress: 0,
            currentPage: null,
            totalPages: null,
            rating: null,
            notes: '',
            url: args.url || null,
            imageUrl: null,
            metadata: '{}',
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, title: args.title });
        }

        // ===== FİNANS =====
        case 'add_transaction': {
          const id = crypto.randomUUID();
          const validAmount = args.type === 'expense' ? -Math.abs(args.amount) : Math.abs(args.amount);
          await db.transactions.add({
            id,
            type: args.type,
            amount: validAmount,
            currency: args.currency || 'TRY',
            category: args.category,
            description: args.description,
            date: args.date || today,
            tags: [],
            recurringPattern: null,
            lastRecurringAt: null,
            budgetLimit: null,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, amount: validAmount, category: args.category });
        }

        // ===== GÜNLÜK =====
        case 'log_journal': {
          const existingEntry = await db.journalEntries.where('date').equals(args.date).first();
          if (existingEntry) {
            await db.journalEntries.update(existingEntry.id, {
              ...(args.whatIDid !== undefined && { whatIDid: args.whatIDid }),
              ...(args.whatILearned !== undefined && { whatILearned: args.whatILearned }),
              ...(args.tomorrowPlan !== undefined && { tomorrowPlan: args.tomorrowPlan }),
              ...(args.mood !== undefined && { mood: args.mood }),
              updatedAt: now,
            });
            return JSON.stringify({ success: true, id: existingEntry.id, updated: true });
          }
          const id = crypto.randomUUID();
          await db.journalEntries.add({
            id,
            date: args.date,
            whatIDid: args.whatIDid || '',
            whatILearned: args.whatILearned || '',
            tomorrowPlan: args.tomorrowPlan || '',
            mood: args.mood || 3,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, created: true });
        }

        // ===== UYKU =====
        case 'log_sleep': {
          const id = crypto.randomUUID();
          await db.sleepLogs.add({
            id,
            date: args.date,
            bedtime: args.bedtime,
            wakeTime: args.wakeTime,
            quality: args.quality ?? 3,
            notes: args.notes || '',
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id });
        }

        // ===== SPOR =====
        case 'log_sport': {
          const id = crypto.randomUUID();
          await db.fitnessLogs.add({
            id,
            date: args.date || today,
            workoutDone: true,
            workoutType: args.type || 'other',
            workoutDuration: args.duration,
            weight: null,
            calories: args.calories ?? null,
            water: 0,
            notes: args.notes || '',
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id });
        }

        // ===== MİNNETDARLIK =====
        case 'log_gratitude': {
          const id = crypto.randomUUID();
          await db.gratitudeEntries.add({
            id,
            items: [args.content],
            date: args.date || today,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id });
        }

        // ===== HEDEFLER =====
        case 'create_goal': {
          const id = crypto.randomUUID();
          await db.goals.add({
            id,
            title: args.title,
            description: args.description || '',
            type: 'objective',
            parentId: null,
            lifeArea: args.category || null,
            targetValue: null,
            currentValue: 0,
            unit: '',
            deadline: args.deadline ? new Date(args.deadline).getTime() : null,
            status: 'active',
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, title: args.title });
        }

        // ===== AKTİVİTE =====
        case 'log_activity': {
          const id = crypto.randomUUID();
          await db.activityLogs.add({
            id,
            summary: args.summary,
            details: args.details || '',
            type: args.type || 'custom',
            relatedId: null,
            relatedType: null,
            timestamp: now,
            createdAt: now,
          });
          return JSON.stringify({ success: true, id });
        }

        default:
          return JSON.stringify({ error: `Bilinmeyen fonksiyon: ${name}` });
      }
    } catch (err) {
      return JSON.stringify({ error: `Hata: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    const newMessage: Message = { id: crypto.randomUUID(), role: 'user', content: userMsg };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const settings = await db.settings.get('main');
      const provider = settings?.aiProvider || 'openrouter';
      const apiKey = settings?.aiApiKey || '';
      const model = settings?.aiModel || '';

      if (!apiKey) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Lütfen önce Ayarlar sayfasından AI API key\'inizi girin.',
        }]);
        setLoading(false);
        return;
      }

      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.filter((m) => m.role !== 'tool').concat(newMessage).map((m) => ({
          role: m.role, content: m.content,
        })),
      ];

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, provider, apiKey, model }),
      });

      if (!res.ok) {
        const err = await res.json();
        const errorMsg = err.error || 'API isteği başarısız oldu.';

        if (errorMsg.includes('tool_use_failed') || errorMsg.includes('failed_generation')) {
          const retryRes = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages, provider, apiKey, model, tool_choice: 'none' }),
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const retryContent = retryData.choices?.[0]?.message?.content;
            if (retryContent) {
              setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: retryContent }]);
              setLoading(false);
              return;
            }
          }
        }

        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Hata: ${errorMsg}`,
        }]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const choice = data.choices?.[0];

      if (!choice) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'AI yanıt vermedi. Lütfen tekrar dene.',
        }]);
        setLoading(false);
        return;
      }

      const assistantMsg = choice.message;

      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
        const toolResults = await Promise.all(
          assistantMsg.tool_calls.map((tc: { id: string; function: { name: string; arguments: string } }) =>
            executeTool(tc).then((result) => ({
              tool_call_id: tc.id,
              role: 'tool' as const,
              content: result,
            }))
          )
        );

        // Check if any tool failed
        const failedTools = toolResults.filter((r) => {
          try { return JSON.parse(r.content).error; } catch { return false; }
        });

        // If some tools failed, retry without tools for a text response
        if (failedTools.length === assistantMsg.tool_calls.length) {
          const allErrors = failedTools.map((r) => JSON.parse(r.content).error).join(', ');
          const retryRes = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                ...apiMessages,
                { role: 'assistant', content: `Tool çağrıları başarısız oldu: ${allErrors}` },
                { role: 'user', content: 'Hata aldım, ne yapmalıyım?' },
              ],
              provider, apiKey, model, tool_choice: 'none',
            }),
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const retryContent = retryData.choices?.[0]?.message?.content;
            if (retryContent) {
              setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: retryContent }]);
              setLoading(false);
              return;
            }
          }
        }

        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantMsg.content || 'İşlem yapılıyor...',
        }]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const followUpMessages: any[] = [
          ...apiMessages,
          { role: 'assistant', content: assistantMsg.content || '', tool_calls: assistantMsg.tool_calls },
          ...toolResults,
        ];

        const followUpRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: followUpMessages, provider, apiKey, model }),
        });

        if (followUpRes.ok) {
          const followUpData = await followUpRes.json();
          const followUpContent = followUpData.choices?.[0]?.message?.content;
          if (followUpContent) {
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { id: crypto.randomUUID(), role: 'assistant', content: followUpContent },
            ]);
          }
        }
      } else if (assistantMsg.content) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantMsg.content,
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Bağlantı hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* FAB Button */}
      <Button
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Bot className="w-6 h-6" />
      </Button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Asistan</p>
                <p className="text-xs text-muted-foreground">VitaForge</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ne yapmak istersin?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
