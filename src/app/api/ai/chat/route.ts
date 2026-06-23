import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, provider, apiKey, model, tool_choice } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key gerekli' }, { status: 400 });
    }

    let baseUrl: string;
    let requestModel: string;

    if (provider === 'groq') {
      baseUrl = 'https://api.groq.com/openai/v1';
      requestModel = model || 'llama-3.3-70b-versatile';
    } else {
      baseUrl = 'https://openrouter.ai/api/v1';
      requestModel = model || 'openai/gpt-4o-mini';
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://vitaforge.app' } : {}),
      },
      body: JSON.stringify({
        model: requestModel,
        messages,
        ...(tool_choice === 'none' ? {} : { tools: toolsDefinition, tool_choice: tool_choice || 'auto' }),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `API hatası: ${error}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: `Sunucu hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}` }, { status: 500 });
  }
}

const toolsDefinition = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Yeni bir görev oluşturur',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Görev başlığı' },
          description: { type: 'string', description: 'Görev açıklaması' },
          priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Öncelik' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'waiting', 'done'] },
          deadline: { type: 'string', description: 'Son teslim tarihi (ISO string veya null)' },
          projectId: { type: 'string', description: 'Proje ID veya null' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Etiketler' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Bir görevi günceller',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Görev ID' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
          status: { type: 'string', enum: ['todo', 'in_progress', 'waiting', 'done'] },
          deadline: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_task',
      description: 'Bir görevi siler',
      parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_project',
      description: 'Yeni bir proje oluşturur',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Proje adı' },
          description: { type: 'string' },
          color: { type: 'string', description: 'Renk kodu (#hex)' },
          status: { type: 'string', enum: ['active', 'paused', 'completed', 'archived'] },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_note',
      description: 'Yeni bir not oluşturur',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Not başlığı' },
          content: { type: 'string', description: 'Not içeriği (Markdown destekler)' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_habit',
      description: 'Bir alışkanlığı günlük olarak işaretler',
      parameters: {
        type: 'object',
        properties: {
          habitId: { type: 'string', description: 'Alışkanlık ID' },
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' },
          value: { type: 'number', description: 'Değer (genelde 1)' },
          notes: { type: 'string' },
        },
        required: ['habitId', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_habit',
      description: 'Yeni bir alışkanlık oluşturur',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Alışkanlık adı' },
          description: { type: 'string' },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'custom'] },
          color: { type: 'string' },
        },
        required: ['name', 'frequency'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_media',
      description: 'Film, dizi veya müzik ekler',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Başlık' },
          type: { type: 'string', enum: ['movie', 'series', 'music_album', 'music_song'] },
          status: { type: 'string', enum: ['planned', 'active', 'done', 'abandoned'] },
          metadata: { type: 'string', description: 'JSON string (ör: {"director":"...", "year":2024})' },
          rating: { type: 'number', description: '1-10 arası puan' },
          review: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_transaction',
      description: 'Gelir veya gider ekler',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['income', 'expense'] },
          amount: { type: 'number' },
          currency: { type: 'string', default: 'TRY' },
          category: { type: 'string', description: 'Kategori (yiyecek, fatura, maaş, vs.)' },
          description: { type: 'string' },
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' },
        },
        required: ['type', 'amount', 'category', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_reading',
      description: 'Okuma listesine öğe ekler',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          type: { type: 'string', enum: ['book', 'article', 'podcast', 'video'] },
          status: { type: 'string', enum: ['to_read', 'reading', 'finished'] },
          url: { type: 'string' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_journal',
      description: 'Günlüğe kayıt ekler',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' },
          whatIDid: { type: 'string', description: 'Bugün ne yaptım?' },
          whatILearned: { type: 'string', description: 'Ne öğrendim?' },
          tomorrowPlan: { type: 'string', description: 'Yarın ne yapacağım?' },
          mood: { type: 'number', description: '1-5 arası ruh hali', minimum: 1, maximum: 5 },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'log_activity',
      description: 'Önemli bir kullanıcı aktivitesini akışa kaydeder. Sadece anlamlı/değerli aktiviteler için kullan (görev tamamlama, film izleme, proje bitirme, vs.). Sohbet başlangıcı gibi basit şeyler için kullanma.',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Kısa özet' },
          details: { type: 'string', description: 'Detaylı açıklama' },
          type: { type: 'string', description: 'Aktivite tipi (task_done, media_watched, custom, vs.)' },
        },
        required: ['summary', 'type'],
      },
    },
  },
];
