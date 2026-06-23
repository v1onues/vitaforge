# VitaForge

Kisisel hayat ve proje yonetim uygulamasi. Tum veriler cihazinda saklanir, disariya gonderilmez.

## Ozellikler

### Proje Yonetimi
- Projeler, gorevler, alt gorevler
- Proje gruplari, renk ve ikon secimi
- Oncelik ve deadline takibi
- Tekrarlayan gorevler (gunluk, haftalik, aylik)
- Zaman takibi (Pomodoro + manuel)

### Kisisel Takip
- **Gunluk** — Yapilan, ogrenilen, yarinin plani, ruh hali
- **Sikayet/Minnettar** — Her gun 3 sey icin minnettar ol
- **Uyku** — Uyku/guc ucu saati, kalite takibi
- **Hedefler** — OKR: Hedefler ve anahtar sonuclar
- **Ruh Hali & Enerji** — Gunluk mood takibi

### Saglik & Spor
- **Spor** — Haftalik antrenman grid'i, streak, kilo ilerlemesi, kalori/su takibi
- **Diksiyon** — 10 dakikalik countdown timer, pratik logu, streak

### Medya & Icerik
- **Kitap Okuma** — Google Books entegrasyonu, ilerleme, puanlama
- **Film & Dizi** — TMDB entegrasyonu, puanlama, yorum
- **Muzik** — Last.fm entegrasyonu (album/sarki)
- **Oyun** — RAWG entegrasyonu, platform, playtime, basarilar, Metacritic
- **Stoaci Sozler** — Her gun rastgele stoaci soz, Mindset kitabi sayfa takibi

### Finans
- **Butce** — Gelir/gider takibi, kategori butceleri, tekrarlayan islemler

### Arac & Monitoring
- **Radyo** — Canli yayin player, Turkce ve uluslararasi istasyonlar, ses kontrolu
- **Sunucu Izleme** — Configurable endpoint'ler, uptime/ping takibi
- **Etiketler** — Genel etiket sistemi
- **Aktivite Logu** — Tum hareketlerin kronolojik akisi

### AI Asistan
- Groq veya OpenRouter ile dogal dil yonetimi
- Gorev, proje, not, aliskanlik olusturma ve sorgulama

### Genel
- **SRP Sifreleme** — Uygulama ana sifresi ile korunur
- **Otomatik Kilit** — Hareketsizlik sonrasi auto-logout
- **Yedekleme** — JSON veya sifreli disa aktarma/ice aktarma
- **Klavye Kisayollari** — Cmd+K komut paleti, hizli navigasyon
- **Hizli Ekle** — Hizla gorev, not, aliskanlik ekleme
- **Global Arama** — Tum verilerde anlik arama
- **Odak Modu** — Gorunumsuz calisma modu

## Teknolojiler

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Dexie** (IndexedDB) — Yerel veritabani
- **Zustand** — State yonetimi
- **shadcn/ui** — UI bilesenleri
- **Lucide React** — Ikonlar
- **React Hook Form + Zod** — Form yonetimi

## API Entegrasyonlari

| Servis | Kullanim | Api Key Gerekli |
|--------|----------|-----------------|
| TMDB | Film/Dizi arama | Evet |
| Google Books | Kitap arama | Evet |
| Last.fm | Muzik arama | Evet |
| RAWG | Oyun arama | Evet |
| Groq / OpenRouter | AI asistan | Evet |

## Kurulum

```bash
# Bagimlilikleri yukle
npm install

# Gelistirme sunucusunu baslat
npm run dev
```

Uygulama `http://localhost:3006` adresinde calisir.

## Yapi

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Giris/kurulum sayfalari
│   ├── (dashboard)/        # Ana panel
│   │   ├── dashboard/     # Dashboard ana sayfa
│   │   ├── projects/      # Proje yonetimi
│   │   ├── tasks/         # Gorev yonetimi
│   │   ├── habits/        # Aliskanliklar
│   │   ├── notes/         # Notlar
│   │   ├── goals/         # Hedefler
│   │   ├── journal/       # Gunluk
│   │   ├── gratitude/     # Minnet
│   │   ├── sleep/         # Uyku
│   │   ├── sport/         # Spor
│   │   ├── diction/       # Diksiyon
│   │   ├── reading/       # Kitap
│   │   ├── media/         # Film/dizi/muzik/oyun
│   │   ├── budget/        # Butce
│   │   ├── radio/         # Radyo
│   │   ├── monitor/       # Sunucu izleme
│   │   ├── tags/          # Etiketler
│   │   ├── analytics/     # Istatistikler
│   │   ├── activity/      # Aktivite logu
│   │   └── settings/      # Ayarlar
│   └── api/               # API route'lari
├── components/             # React bilesenleri
│   ├── layout/            # Sidebar, Header
│   ├── shared/            # Paylasilan widget'lar
│   ├── goals/             # Hedef formu
│   ├── habits/            # Aliskanlik formu
│   ├── projects/         # Proje formu
│   └── tasks/             # Gorev formu
├── lib/
│   ├── api/               # Dis API istemcilileri
│   ├── db/                # Dexie veritabani semasi
│   ├── data/              # Statik veri (stoaci sozler)
│   ├── hooks/             # Custom React hook'lari
│   ├── stores/            # Zustand store'lari
│   ├── crypto/            # Sifreleme
│   └── utils/             # Yardimci fonksiyonlar
└── public/                # Statik dosyalar
```

## Lisans

MIT
