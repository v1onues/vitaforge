<p align="center">
  <strong>VitaForge</strong>
</p>

<p align="center">
  Kişisel hayat ve proje yönetim uygulaması
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## VitaForge Nedir?

VitaForge, tüm kişisel yaşamınızı tek bir yerden yönetebileceğiniz açık kaynaklı bir web uygulamasıdır. Projeler, görevler, alışkanlıklar, günlük, finans, sağlık, medya ve daha fazlası — hepsi tek bir panelde.

Tüm verileriniz **cihazınızda (IndexedDB)** saklanır, harici sunuculara gönderilmez. Uygulama ana şifreniz ile AES-256-GCM şifreleme ile korunur.

---

## Özellikler

### Proje Yönetimi
- Projeler, görevler, alt görevler
- Proje grupları, renk ve ikon seçimi
- Öncelik ve deadline takibi
- Tekrarlayan görevler (günlük, haftalık, aylık)
- Zaman takibi (Pomodoro + manuel)

### Kişisel Takip
- **Günlük** — Yapılan, öğrenilen, yarının planı, ruh hali
- **Minnettarlık** — Her gün 3 şey için minnet
- **Uyku** — Uyku/uyanma saati, kalite takibi
- **Hedefler** — OKR formatında hedef ve anahtar sonuçlar

### Sağlık & Spor
- **Spor** — Haftalık antrenman grid'i, streak, kilo ilerlemesi, kalori/su takibi
- **Diksiyon** — 10 dakikalık countdown timer, pratik logu, streak

### Medya & İçerik
- **Kitap Okuma** — Google Books entegrasyonu, ilerleme, puanlama
- **Film & Dizi** — TMDB entegrasyonu, puanlama, yorum
- **Müzik** — Last.fm entegrasyonu (albüm/şarkı)
- **Oyun** — RAWG entegrasyonu, platform, playtime, başarılar, Metacritic
- **Stoacı Sözler** — Her gün rastgele stoacı söz

### Finans
- **Bütçe** — Gelir/gider takibi, kategori bütçeleri, tekrarlayan işlemler

### Araç & İzleme
- **Radyo** — Canlı yayın player (HLS desteği), Türkçe ve uluslararası istasyonlar, ses kontrolü
- **Sunucu İzleme** — Yapılandırılabilir endpoint'ler, uptime/ping takibi
- **Etiketler** — Genel etiket sistemi
- **Aktivite Logu** — Tüm hareketlerin kronolojik akışı

### AI Asistan
- Groq veya OpenRouter ile doğal dil yönetimi
- Görev, proje, not, alışkanlık, medya oluşturma
- TMDB'den film/dizi arayıp otomatik kaydetme
- "Dexter izliyorum, 2. sezon 7. bölümdeyim" → otomatik kayıt

### Güvenlik & Genel
- **SRP Şifreleme** — Uygulama ana şifresi ile korunur
- **Otomatik Kilit** — Hareketsizlik sonrası otomatik kilit
- **Yedekleme** — JSON veya şifreli dışa/içe aktarma
- **Klavye Kısayolları** — `Cmd+K` komut paleti, hızlı navigasyon
- **Hızlı Ekle** — Hızla görev, not, alışkanlık ekleme
- **Global Arama** — Tüm verilerde anlık arama
- **Odak Modu** — Görünümsüz çalışma modu
- **PWA** — Service Worker ile offline destek

---

## Teknolojiler

| Teknoloji | Kullanım |
|-----------|----------|
| Next.js 16 | App Router, Turbopack |
| React 19 + TypeScript | UI ve tip güvenliği |
| Tailwind CSS v4 | Styling |
| Dexie (IndexedDB) | Yerel veritabanı |
| Zustand | State yönetimi |
| shadcn/ui | UI bileşenleri |
| Lucide React | İkonlar |
| HLS.js | Radyo HLS yayın desteği |

## API Entegrasyonları

| Servis | Kullanım | API Key |
|--------|----------|---------|
| TMDB | Film/Dizi arama | Ayarlardan |
| Google Books | Kitap arama | Ayarlardan |
| Last.fm | Müzik arama | Ayarlardan |
| RAWG | Oyun arama | Ayarlardan |
| Groq / OpenRouter | AI asistan | Ayarlardan |

---

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3006` adresinde çalışır.

### Ortam Değişkenleri

Gerekli değildir. Tüm API key'ler uygulama içi ayarlardan girilir (Ayarlar sayfası).

---

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Giriş/kurulum sayfaları
│   ├── (dashboard)/        # Ana panel
│   │   ├── dashboard/      # Ana sayfa
│   │   ├── projects/       # Proje yönetimi
│   │   ├── tasks/          # Görev yönetimi
│   │   ├── habits/         # Alışkanlıklar
│   │   ├── notes/          # Notlar
│   │   ├── goals/          # Hedefler
│   │   ├── journal/        # Günlük
│   │   ├── gratitude/      # Minnettarlık
│   │   ├── sleep/          # Uyku takibi
│   │   ├── sport/          # Spor
│   │   ├── diction/        # Diksiyon
│   │   ├── reading/        # Kitap
│   │   ├── media/          # Film/dizi/müzik/oyun
│   │   ├── budget/         # Bütçe
│   │   ├── radio/          # Radyo
│   │   ├── monitor/        # Sunucu izleme
│   │   ├── tags/           # Etiketler
│   │   ├── analytics/      # İstatistikler
│   │   ├── activity/       # Aktivite logu
│   │   └── settings/       # Ayarlar
│   └── api/                # API route'ları
│       ├── ai/chat/        # AI asistan proxy
│       ├── tmdb/           # TMDB proxy (search, details)
│       ├── rawg/           # RAWG proxy (search, details)
│       ├── lastfm/         # Last.fm proxy (search, details)
│       └── monitor/        # Sunucu izleme
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── shared/             # Paylaşılan widget'lar (radyo player, AI, stoacı sözler...)
│   ├── goals/              # Hedef formu, yaşam çarkı
│   ├── habits/             # Alışkanlık formu, grid
│   ├── projects/           # Proje formu
│   ├── notes/              # Not formu
│   └── tasks/              # Görev formu, kanban, takvim
├── lib/
│   ├── api/                # Dış API istemcileri (tmdb, rawg, music, books)
│   ├── db/                 # Dexie veritabanı şeması ve migration'lar
│   ├── data/               # Statik veri (stoacı sözler)
│   ├── hooks/              # Custom React hook'ları
│   ├── stores/             # Zustand store'ları (auth, ui)
│   ├── crypto/             # SRP şifreleme
│   └── utils/              # Yardımcı fonksiyonlar (backup, recurring)
└── public/                 # Statik dosyalar (PWA manifest, SW)
```

---

## Ek Belgeler

- [PRD.md](PRD.md) — Ürün gereksinimleri dokümanı
- [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md) — Teknik mimari kararlar
- [MVP_PLAN.md](MVP_PLAN.md) — MVP geliştirme planı

---

## Lisans

MIT
