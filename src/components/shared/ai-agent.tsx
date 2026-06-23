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

export function AiAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'assistant',
      content: 'Merhaba! Ben VitaForge AI asistanıyım. Bana ne yapmak istediğini söyle, ben de senin için ekleyeyim, güncelleyeyim veya sorgulayayım. Örneğin:\n\n• "Bugün 3 saat proje çalıştım, task ekle: API entegrasyonu"\n• "Yeni film izledim: Dune 2, 9/10"\n• "Bugünkü giderler: market 500TL, yol 50TL"\n• "Haftalık hedeflerimi göster"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeTool = async (toolCall: { id: string; function: { name: string; arguments: string } }) => {
    const args = JSON.parse(toolCall.function.arguments);
    const name = toolCall.function.name;
    const now = Date.now();

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
            totalEpisodes: null,
            currentEpisode: null,
            url: null,
            imageUrl: null,
            tags: args.tags || [],
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, title: args.title, type: args.type });
        }
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
            date: args.date || new Date().toISOString().split('T')[0],
            tags: args.tags || [],
            recurringPattern: null,
            lastRecurringAt: null,
            budgetLimit: null,
            createdAt: now,
            updatedAt: now,
          });
          return JSON.stringify({ success: true, id, amount: validAmount, category: args.category });
        }
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
          content: 'Lütfen önce Ayarlar sayfasından API key\'inizi girin.',
        }]);
        setLoading(false);
        return;
      }

      const apiMessages = messages
        .filter((m) => m.role !== 'tool')
        .concat(newMessage)
        .map((m) => ({ role: m.role, content: m.content }));

      apiMessages.unshift({
        role: 'system',
        content: `Sen VitaForge kişisel yönetim asistanısın. Kullanıcının hayatının her alanını yönetmesine yardımcı oluyorsun.

YANITLAMA KURALLARI:
- Kullanıcı bir işlem yapmanı isterse (görev ekle, proje oluştur, not al, vs.), uygun fonksiyonu çağır ve sonucu Türkçe açıkla.
- Kullanıcı sadece soru sorar veya sohbet ederse (ör: "nasılsın?", "ne yapmam gerekiyor?"), fonksiyon çağırmadan doğrudan yanıtla.
- Bir işlem yaptıktan sonra önemli işlemler için log_activity fonksiyonunu kullan. Basit/günlük işlemler için kullanma.`,
      });

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
