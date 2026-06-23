# VitaForge — Ürün Gereksinim Belgesi (PRD)

## 1. Ürün Tanımı

**VitaForge**, kişisel hayat ve proje yönetim uygulamasıdır. Tamamen self-hosted, local-first çalışır. Tek bir master şifre ile korunur, tüm veriler client-side şifrlenir.

### Misyon
Kullanıcının hayatını tek bir uygulamada organize etmesini sağlamak — projeler, alışkanlıklar, notlar, hedefler — hepsi bir arada, offline çalışır, gizlilik odaklı.

### Hedef Kullanıcı
- Tek başına çalışan geliştirici /_freelancer_
- Verilerinin kontrolünü elinde tutmak isteyen birey
- Basit ama güçlü araçlar arayan kişi

---

## 2. Temel İlkeler

|İlke|Açıklama|
|---|---|
|**Local-First**|Tüm veriler IndexedDB'de saklanır. İnternet olmadan tam çalışır.|
|**Privacy-First**|Sunucuya şifresiz veri gitmez. AES-256-GCM ile client-side şifreleme.|
|**Minimal Backend**|Sunucu sadece yedekleme ve opsiyonel sync için. Veritabanı yok.|
|**PWA**|Yüklenebilir, offline çalışabilir, bildirim gönderebilir.|
|**Türkçe Arayüz**|Tüm menü, buton, mesaj Türkçe olacak.|

---

## 3. Kullanıcı Akışları

### 3.1 İlk Kullanım
```
Uygulama açılır → Hoş geldin ekranı → Master şifre belirle → Ana ekrana geç
```

### 3.2 Sonraki Kullanımlar
```
Uygulama açılır → Şifre ekranı → Şifre doğru → Ana ekrana geç
```

### 3.3 Ana Ekran (Dashboard)
```
Bugünün özeti:
  - Yapılacaklar (bugüne deadline'ı olan görevler)
  - Aktif projeler (son durum)
  - Streak'ler (bugün tamamlanan alışkanlıklar)
  - Energy/Mood seçimi (opsiyonel)
  - Hızlı ekleme butonu (görev, not, alışkanlık)
```

---

## 4. Özellik Detayları

### 4.1 Master Şifre Sistemi
- İlk açılışta şifre belirleme (min 6 karakter veya 4 haneli PIN)
- Şifre, Web Crypto API ile derive edilir (PBKDF2 + salt)
- Derived key, verileri şifrelemek/çözmek için kullanılır
- Şifre Tarayıcı belleğinde tutulur (session scope)
- Hareketsizlik sonrası otomatik kilit (varsayılan: 15 dk)
- Yanlış şifre girişinde yavaşlatma (brute-force koruması)

### 4.2 Dashboard
- **Bugün Özeti**: Tarih, günün görevleri, tamamlanma oranı
- **Aktif Projeler**: İlerleme çubuğu ile proje listesi
- **Streak Paneli**: Aktif alışkanlık zincirleri
- **Mood/Energy**: Günlük ruh hali / enerji seviyesi seçimi (1-5)
- **Hızlı Ekleme**: `Ctrl+K` ile command palette (Linear/Notion tarzı)

### 4.3 Projects & Tasks

#### Proje
- İsim, açıklama, renk, ikon
- Durum: Aktif / Askıya Alınmış / Tamamlandı / Arşivlendi
- Oluşturma tarihi, bitiş tarihi (opsiyonel)

#### Görev (Task)
- Başlık, açıklama (Markdown destekli)
- Projeye ait
- Alt görevler (subtask) — max 3 seviye
- Etiketler (renkli, çoklu seçim)
- Öncelik: Düşük / Normal / Yüksek / Acil
- Deadline (tarih + saat)
- Durum: Yapılacak / Devam Ediyor / Beklemede / Tamamlandı
- Atama (tek kişilik ama ileride multi-user için hazır)

#### Görünümler
- **Kanban**: Sütunlara sürükle-bırak (Duruma göre)
- **Liste**: Filtrelenebilir tablo görünümü
- **Takvim**: Deadline'a göre takvim görünümü (opsiyonel, 2. aşama)

### 4.4 Habit Tracker
- Alışkanlık oluşturma: İsim, sıklık (günlük/haftalık/özelleştirilmiş), hedef türü (sayısal/bool)
- **Zincir (Chain)**: Her tamamlanan gün için zincir halkası
- **Streak**: Ardışık gün sayısı
- **İstatistik**: Haftalık/aylık tamamlanma oranı
- **Bildirim**: PWA bildirimi ile hatırlatma (saat seçimi)
- **Takvim Görünümü**: GitHub contribution tarzı grid

### 4.5 Notes (Zettelkasten)
- Not oluşturma: Başlık, içerik (Markdown + Zengin metin)
- **Etiketleme**: Çoklu etiket
- **Bağlantı**: `[[not-başlığı]]` syntax ile notlar arası link
- **Graf Görünümü**: Notlar arası bağlantıları görselleştirme
- **Arama**: Tam metin arama (IndexedDB full-text)
- **Versiyonlama**: Not geçmişini tutma (son 10 değişiklik)

### 4.6 Goals / Life Areas
- **Wheel of Life**: 8 hayat alanı (Kariyer, Finans, Sağlık, İlişkiler, Eğitim, Eğlence, Ruh Hali, Çevre)
- Her alan için: Mevcut durum (1-10), hedef durum, notlar
- **OKR Tarzı Hedefler**: 
  - Objective (Amaç): Büyük hedef
  - Key Results (Sonuçlar): Ölçülebilir alt hedefler
  - İlerleme yüzdesi
- **Yıllık/Aylık Hedefler**: Zaman bazlı hedef belirleme

### 4.7 Yedekleme & Export
- **Manuel Yedekleme**: Tek tıkla tüm verileri indir
- **Şifreli Yedek**: AES-256 ile şifrelenmiş JSON
- **Düz JSON**: Okunabilir format (şifreli anahtarlar dahil)
- **Markdown Export**: Notları markdown olarak dışa aktar
- **Otomatik Yedekleme**: Belirli aralıklarla sunucuya şifreli yedek (opsiyonel)
- **Geri Yükleme**: Yedek dosyasından verileri geri yükleme

---

## 5. Güvenlik Gereksinimleri

### 5.1 Şifreleme
- **Algoritma**: AES-256-GCM (Web Crypto API)
- **Key Derivation**: PBKDF2 (600,000 iterasyon, SHA-256)
- **Salt**: Kullanıcı başına benzersiz, rastgele 16 byte
- **IV/Nonce**: Her şifreleme işlemi için rastgele 12 byte
- **Format**: `base64(salt + iv + ciphertext + tag)`

### 5.2 Veri Saklama
- Tüm hassas veriler IndexedDB'de şifreli olarak saklanır
- Şifre asla kalıcı olarak saklanmaz (session scope)
- LocalStorage sadece non-hassas ayarlar için (tema, dil)
- ClearText asla disk'e yazmaz

### 5.3 Erişim Kontrolü
- Uygulama açılışında şifre zorunlu
- Hareketsizlik kilidi (varsayılan 15 dk, ayarlanabilir)
- Maksimum deneme sayısı (5 başarısız → 30 sn bekleme)
- Çıkış yapıldığında tüm hassas veriler bellekten temizlenir

---

## 6. Teknik Mimari

### 6.1 Stack
| Katman|Teknoloji|
|---|---|
|**Framework**|Next.js 15 (App Router)|
|**Dil**|TypeScript (strict mode)|
|**Stil**|Tailwind CSS + shadcn/ui|
|**Veri**|Dexie.js (IndexedDB wrapper)|
|**State**|Zustand (global) + Tanstack Query (cache)|
|**Şifreleme**|Web Crypto API (AES-256-GCM)|
|**PWA**|next-pwa (serbest) veya manual service worker|
|**Form**|React Hook Form + Zod|
|**İkonlar**|Lucide React|
|**Graf**|D3.js veya react-force-graph (not grafı için)|

### 6.2 Deployment
- **Platform**: CloudPanel + Nginx
- **Çalıştırma**: PM2 ile Node.js process
- **SSL**: Let's Encrypt (CloudPanel otomatik)
- **Domain**: kisisel.veliongelen.com.tr

---

## 7. MVP Kapsamı (İlk Versiyon)

### Hafta 1: Temel Altyapı
- [ ] Proje kurulumu (Next.js + Tailwind + shadcn)
- [ ] Dexie.js kurulumu + şema tanımı
- [ ] Şifreleme modülü (Web Crypto API)
- [ ] Master şifre akışı (belirleme + giriş)

### Hafta 2: Dashboard & Görevler
- [ ] Dashboard sayfası
- [ ] Proje CRUD
- [ ] Görev CRUD
- [ ] Kanban görünümü
- [ ] Liste görünümü

### Hafta 3: Alışkanlıklar & Notlar
- [ ] Habit Tracker (CRUD + zincir + streak)
- [ ] Bildirim sistemi (PWA)
- [ ] Notes (CRUD + etiket + arama)

### Hafta 4: Hedefler & Yedekleme
- [ ] Goals / Life Areas
- [ ] Wheel of Life
- [ ] Yedekleme & Export
- [ ] PWA kurulumu
- [ ] Deployment (CloudPanel + PM2)

---

## 8. Gelecek Aşamalar

### v1.1
- Journal / Reflection günlükleri
- Takvim görünümü (görevler + zaman blokları)
- Daha gelişmiş graf görünümü

### v1.2
- Basit finans takibi
- Bütçe planlama
- Harcama kategorileri

### v2.0
- AI destek (local LLM entegrasyonu)
- Akıllı görev önerileri
- Otomatik rutin analizi
- Multi-device sync (şifreli)

---

## 9. UI/UX Prensipleri

- **Minimalist**: Gereksiz element yok, sade ve temiz
- **Linear/Notion Tarzı**: Modern, koyu tema ağırlıklı
- **Responsive**: Mobilde tam çalışır, dokunmatik uyumlu
- **Klavye Dostu**: Kısayollar, command palette (`Ctrl+K`)
- **Animasyonlu**: subtle geçişler, micro-interactions
- **Erişilebilirlik**: WCAG 2.1 AA uyumlu

---

## 10. Kısayollar (MVP)

| Kısayol|İşlem|
|---|---|
|`Ctrl+K`|Command Palette aç|
|`Ctrl+N`|Yeni görev ekle|
|`Ctrl+Shift+N`|Yeni not ekle|
|`Ctrl+B`|Sidebar aç/kapat|
|`Ctrl+/`|Kısayolları göster|
|`Escape`|Modal/pencere kapat|
|`1-4`|Hızlı proje seçimi|

---

## 11. Metrikler

- **Kullanım**: Günlük aktif kullanım (DAU)
- **Görev Tamamlama**: Tamamlanan/görev oranı
- **Alışkanlık Tutarlılığı**: Ortalama streak uzunluğu
- **Not Bağlantıları**: Ortalama bağlantı sayısı per not

---

*Son Güncelleme: 2026-06-18*
*Versiyon: 1.0.0-draft*
