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
        temperature: 0.5,
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
  // ===== GÖREVLER =====
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Yeni bir görev oluşturur. Proje bağlantısı, öncelik, deadline, etiket eklenebilir.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Görev başlığı (detaylı ve açık yazın)' },
          description: { type: 'string', description: 'Görev açıklaması' },
          priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'Öncelik' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'waiting', 'done'] },
          deadline: { type: 'string', description: 'Son teslim tarihi (ISO string veya YYYY-MM-DD)' },
          projectId: { type: 'string', description: 'Proje ID (boş bırakılabilir)' },
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
      description: 'Bir görevi günceller. Durum değiştirme, başlık/detay güncelleme.',
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
  // ===== PROJE =====
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
  // ===== NOT =====
  {
    type: 'function',
    function: {
      name: 'create_note',
      description: 'Yeni bir not oluşturur. Markdown destekler.',
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
  // ===== ALIŞKANLIKLAR =====
  {
    type: 'function',
    function: {
      name: 'log_habit',
      description: 'Bir alışkanlığı günlük olarak işaretler (ör: spor yaptım, kitap okudum, meditasyon)',
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
  // ===== MEDYA & FİLM =====
  {
    type: 'function',
    function: {
      name: 'search_tmdb',
      description: 'TMDB\'den film veya dizi arar. Medya eklemeden ÖNCE kullanılmalı. Dizi izliyor/gördü filmden bahseden kullanıcı için otomatik ara.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Film veya dizi adı (Türkçe veya orijinal dil)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_tmdb_details',
      description: 'TMDB\'den film/dizi detaylarını çeker. search_tmdb ile bulunan sonucun ID\'si ile kullanılır. Yönetmen, tür, süre, sezon/bölüm bilgisi getirir.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'TMDB ID' },
          type: { type: 'string', enum: ['movie', 'tv'], description: 'movie veya tv (dizi için tv)' },
        },
        required: ['id', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_media',
      description: 'Film, dizi, oyun, albüm veya şarkı ekler. TMDB detayları varsa metadata\'ya JSON olarak ekle. Dizi için sezon/bölüm bilgisi currentEpisode ve totalEpisodes alanlarına yazılır.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Başlık' },
          type: { type: 'string', enum: ['movie', 'series', 'music_album', 'music_song', 'game'] },
          status: { type: 'string', enum: ['planned', 'active', 'done', 'abandoned'], description: 'planned: izleyeceğim, active: izliyorum/oynuyorum, done: bitti, abandoned: bıraktım' },
          metadata: { type: 'string', description: 'JSON string. TMDB verilerini buraya koy: {"tmdb_id":123,"year":2024,"director":"...","genre":["..."],"overview":"...","number_of_seasons":8,"number_of_episodes":96}' },
          rating: { type: 'number', description: '1-10 arası puan' },
          review: { type: 'string', description: 'Kullanıcı yorumu' },
          imageUrl: { type: 'string', description: 'Poster URL (TMDB poster_path formatı)' },
          tags: { type: 'array', items: { type: 'string' } },
          currentEpisode: { type: 'number', description: 'Şu anki bölüm numarası (dizi için)' },
          totalEpisodes: { type: 'number', description: 'Toplam bölüm sayısı (dizi için)' },
        },
        required: ['title', 'type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_media',
      description: 'Mevcut bir medya öğesini günceller. Dizi izlerken bölüm ilerlemesi, film bitirdiğinde puanlama, durum değişikliği.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Medya öğesi ID' },
          status: { type: 'string', enum: ['planned', 'active', 'done', 'abandoned'] },
          rating: { type: 'number', description: '1-10 arası puan' },
          review: { type: 'string' },
          currentEpisode: { type: 'number', description: 'Şu anki bölüm numarası' },
          totalEpisodes: { type: 'number', description: 'Toplam bölüm sayısı' },
          progress: { type: 'number', description: '0-100 arası ilerleme yüzdesi' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_rawg',
      description: 'RAWG\'den oyun arar. Kullanıcı oyun oynadığından bahsederse otomatik ara.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Oyun adı' },
        },
        required: ['query'],
      },
    },
  },
  // ===== OKUMA =====
  {
    type: 'function',
    function: {
      name: 'add_reading',
      description: 'Okuma listesine kitap, makale, podcast veya video ekler',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          type: { type: 'string', enum: ['book', 'article', 'podcast', 'video'] },
          status: { type: 'string', enum: ['to_read', 'reading', 'finished'], description: 'to_read: okuyacağım, reading: okuyorum, finished: bitirdim' },
          url: { type: 'string' },
        },
        required: ['title'],
      },
    },
  },
  // ===== FİNANS =====
  {
    type: 'function',
    function: {
      name: 'add_transaction',
      description: 'Gelir veya gider ekler',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['income', 'expense'] },
          amount: { type: 'number', description: 'Tutar (TL)' },
          currency: { type: 'string', default: 'TRY' },
          category: { type: 'string', description: 'Kategori (yiyecek, ulaşım, fatura, maaş, alışveriş, eğlence, sağlık, eğitim, kira, abonelik, diğer)' },
          description: { type: 'string', description: 'Açıklama' },
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' },
        },
        required: ['type', 'amount', 'category', 'description'],
      },
    },
  },
  // ===== GÜNLÜK =====
  {
    type: 'function',
    function: {
      name: 'log_journal',
      description: 'Günlüğe kayıt ekler veya günceller. Aynı tarihe tekrar yazılırsa günceller.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' },
          whatIDid: { type: 'string', description: 'Bugün ne yaptım?' },
          whatILearned: { type: 'string', description: 'Ne öğrendim?' },
          tomorrowPlan: { type: 'string', description: 'Yarın ne yapacağım?' },
          mood: { type: 'number', description: '1-5 arası ruh hali (1: çok kötü, 3: normal, 5: harika)' },
        },
        required: ['date'],
      },
    },
  },
  // ===== UYKU =====
  {
    type: 'function',
    function: {
      name: 'log_sleep',
      description: 'Uyku kaydı ekler. Kullanıcı "gece 12 uyudum sabah 8 kalktım" derse parse et.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD)' },
          bedtime: { type: 'string', description: 'Uyuma saati (HH:MM)' },
          wakeTime: { type: 'string', description: 'Uyanma saati (HH:MM)' },
          quality: { type: 'number', description: '1-5 arası kalite' },
          notes: { type: 'string' },
        },
        required: ['date', 'bedtime', 'wakeTime'],
      },
    },
  },
  // ===== SPOR =====
  {
    type: 'function',
    function: {
      name: 'log_sport',
      description: 'Spor/egzersiz kaydı ekler. "1 saat koşu yaptım", "30 dk ağırlık" gibi ifadeleri parse et.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Spor türü (koşu, yürüyüş, ağırlık, yüzme, bisiklet, futbol, basketbol, yoga, pilates, diğer)' },
          duration: { type: 'number', description: 'Süre (dakika)' },
          calories: { type: 'number', description: 'Yakılan kalori (tahmini)' },
          notes: { type: 'string', description: 'Notlar' },
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD), varsayılan bugün' },
        },
        required: ['type', 'duration'],
      },
    },
  },
  // ===== MİNNETDARLIK =====
  {
    type: 'function',
    function: {
      name: 'log_gratitude',
      description: 'Minnettarlık kaydı ekler. "Şükran" sayfasına yazar.',
      parameters: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Minnet olunan şey (detaylı yaz)' },
          date: { type: 'string', description: 'Tarih (YYYY-MM-DD), varsayılan bugün' },
        },
        required: ['content'],
      },
    },
  },
  // ===== HEDEFLER =====
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Yeni bir hayat hedefi oluşturur',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Hedef başlığı' },
          description: { type: 'string' },
          category: { type: 'string', description: 'Kategori (sağlık, kariyer, finans, eğitim, sosyal, kişisel, diğer)' },
          deadline: { type: 'string', description: 'Hedef tarihi (YYYY-MM-DD)' },
        },
        required: ['title', 'category'],
      },
    },
  },
  // ===== AKTİVİTE =====
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
          type: { type: 'string', description: 'Aktivite tipi (task_done, media_watched, sport_done, custom, vs.)' },
        },
        required: ['summary', 'type'],
      },
    },
  },
];
