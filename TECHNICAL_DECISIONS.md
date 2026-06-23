# VitaForge — Teknik Kararlar ve Veri Modelleri

## 1. Veri Modelleri (IndexedDB Şeması)

### 1.1 Dexie.js Şema Tanımı

```typescript
// src/lib/db/schema.ts

import Dexie, { Table } from 'dexie';

// ============ TİPLER ============

export interface Profile {
  id: string;
  salt: string;           // PBKDF2 salt (base64)
  verifier: string;       // Şifre doğrulama hash'i (base64)
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'tr';
  lockTimeout: number;    // Dakika, varsayılan 15
  autoBackup: boolean;
  backupInterval: number; // Saat
  lastBackupAt: number | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;          // HEX renk kodu
  icon: string;           // Lucide ikon adı
  status: 'active' | 'paused' | 'completed' | 'archived';
  order: number;          // Sıralama
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  projectId: string | null;
  title: string;
  description: string;    // Markdown
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'waiting' | 'done';
  deadline: number | null;
  completedAt: number | null;
  parentId: string | null; // Alt görev için üst görev ID
  order: number;
  tags: string[];         // Etiket ID'leri
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays: number[];   // 0=Pazar, 6=Cumartesi (custom için)
  targetValue: number | null; // Hedef (örn: 8 bardak su)
  unit: string;           // Birim (örn: "bardak", "dk")
  color: string;
  icon: string;
  reminderTime: string | null; // "HH:mm" formatında
  archived: boolean;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;           // "YYYY-MM-DD" formatında
  value: number;          // Tamamlanan miktar
  notes: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;        // Markdown
  tags: string[];
  links: string[];        // Bağlantılı not ID'leri
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'objective' | 'key_result';
  parentId: string | null; // KR için Objective ID
  lifeArea: string | null; // Wheel of Life alanı
  targetValue: number | null;
  currentValue: number;
  unit: string;
  deadline: number | null;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: number;
  updatedAt: number;
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  currentScore: number;   // 1-10
  targetScore: number;    // 1-10
  notes: string;
  updatedAt: number;
}

export interface MoodLog {
  id: string;
  date: string;           // "YYYY-MM-DD"
  mood: number;           // 1-5
  energy: number;         // 1-5
  notes: string;
  createdAt: number;
}

export interface Backup {
  id: string;
  encrypted: boolean;
  size: number;
  createdAt: number;
  data: string;           // JSON string veya base64 encrypted
}

// ============ DATABASE ============

export class VitaForgeDB extends Dexie {
  profiles!: Table<Profile>;
  settings!: Table<Settings>;
  projects!: Table<Project>;
  tasks!: Table<Task>;
  tags!: Table<Tag>;
  habits!: Table<Habit>;
  habitLogs!: Table<HabitLog>;
  notes!: Table<Note>;
  goals!: Table<Goal>;
  lifeAreas!: Table<LifeArea>;
  moodLogs!: Table<MoodLog>;
  backups!: Table<Backup>;

  constructor() {
    super('VitaForgeDB');
    
    this.version(1).stores({
      profiles: 'id',
      settings: 'id',
      projects: 'id, status, order',
      tasks: 'id, projectId, parentId, status, deadline, *tags, order',
      tags: 'id, name',
      habits: 'id, archived',
      habitLogs: 'id, habitId, [habitId+date]',
      notes: 'id, *tags, *links, pinned',
      goals: 'id, type, parentId, lifeArea, status',
      lifeAreas: 'id',
      moodLogs: 'id, date',
      backups: 'id, createdAt'
    });
  }
}

export const db = new VitaForgeDB();
```

---

## 2. Güvenlik Akışı

### 2.1 Şifreleme Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                     GÜVENLİK AKIŞI                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. İLK KULLANIM                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Şifre    │───▶│ PBKDF2   │───▶│ Derived  │              │
│  │ Gir      │    │ + Salt   │    │ Key      │              │
│  └──────────┘    └──────────┘    └────┬─────┘              │
│                                       │                      │
│                                       ▼                      │
│                              ┌──────────────┐               │
│                              │ Verifier     │               │
│                              │ Oluştur      │               │
│                              └──────┬───────┘               │
│                                     │                        │
│                                     ▼                        │
│                              ┌──────────────┐               │
│                              │ Profile      │               │
│                              │ Kaydet       │               │
│                              │ (IndexedDB)  │               │
│                              └──────────────┘               │
│                                                              │
│  2. SONRAKI KULLANIMLAR                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Şifre    │───▶│ PBKDF2   │───▶│ Verify   │              │
│  │ Gir      │    │ + Salt   │    │ Compare  │              │
│  └──────────┘    └──────────┘    └────┬─────┘              │
│                                       │                      │
│                              ┌────────┴────────┐            │
│                              │                  │            │
│                         ┌────▼────┐       ┌────▼────┐      │
│                         │ Doğru   │       │ Yanlış  │      │
│                         └────┬────┘       └────┬────┘      │
│                              │                  │            │
│                              ▼                  ▼            │
│                     ┌──────────────┐   ┌──────────────┐    │
│                     │ Derived Key  │   │ Hata Say +   │    │
│                     │ Session'da   │   │ Yavaşlatma   │    │
│                     │ sakla        │   │              │    │
│                     └──────────────┘   └──────────────┘    │
│                                                              │
│  3. VERİ ŞİFRELEME / ÇÖZME                                  │
│                                                              │
│  Şifrelerken:                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Plain    │───▶│ AES-256  │───▶│ Encrypted│              │
│  │ Text     │    │ -GCM     │    │ + IV     │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                       │                                      │
│                  Derived Key                                 │
│                       │                                      │
│                  Random IV                                   │
│                       │                                      │
│                  ┌────▼────┐                                │
│                  │ Base64  │                                │
│                  │ Encode  │                                │
│                  └─────────┘                                │
│                                                              │
│  Çözerken:                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Base64   │───▶│ AES-256  │───▶│ Plain    │              │
│  │ Decode   │    │ -GCM     │    │ Text     │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                       │                                      │
│                  Derived Key                                 │
│                       │                                      │
│                  Extract IV                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Şifreleme Modülü

```typescript
// src/lib/crypto/encryption.ts

const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

export class EncryptionService {
  private key: CryptoKey | null = null;
  private salt: string | null = null;

  // Rastgele byte dizisi üret
  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  // Base64 encode/decode
  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // PBKDF2 ile key türet
  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Şifre hash'i oluştur (doğrulama için)
  private async createVerifier(
    password: string,
    salt: Uint8Array
  ): Promise<string> {
    const key = await this.deriveKey(password, salt);
    const encoder = new TextEncoder();
    const testData = encoder.encode('vitaforge-verify');
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: this.generateRandomBytes(IV_LENGTH) },
      key,
      testData
    );
    
    return this.bufferToBase64(encrypted);
  }

  // İlk kurulum - şifre belirle
  async setupPassword(password: string): Promise<{
    salt: string;
    verifier: string;
  }> {
    const salt = this.generateRandomBytes(SALT_LENGTH);
    const verifier = await this.createVerifier(password, salt);
    
    this.salt = this.bufferToBase64(salt.buffer);
    this.key = await this.deriveKey(password, salt);
    
    return {
      salt: this.salt,
      verifier
    };
  }

  // Giriş - şifre doğrula
  async verifyPassword(
    password: string,
    storedSalt: string,
    storedVerifier: string
  ): Promise<boolean> {
    try {
      const salt = new Uint8Array(this.base64ToBuffer(storedSalt));
      const key = await this.deriveKey(password, salt);
      
      // Test encrypt/decrypt
      const encoder = new TextEncoder();
      const testData = encoder.encode('vitaforge-verify');
      const iv = this.generateRandomBytes(IV_LENGTH);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        testData
      );
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decryptedText = new TextDecoder().decode(decrypted);
      if (decryptedText !== 'vitaforge-verify') {
        return false;
      }
      
      // Key'i session'da sakla
      this.key = key;
      this.salt = storedSalt;
      return true;
    } catch {
      return false;
    }
  }

  // Veri şifrele
  async encrypt(data: string): Promise<string> {
    if (!this.key) throw new Error('Key not initialized');
    
    const encoder = new TextEncoder();
    const iv = this.generateRandomBytes(IV_LENGTH);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encoder.encode(data)
    );
    
    // salt + iv + ciphertext'i birleştir
    const result = new Uint8Array(
      SALT_LENGTH + IV_LENGTH + encrypted.byteLength
    );
    result.set(new Uint8Array(this.base64ToBuffer(this.salt!)), 0);
    result.set(iv, SALT_LENGTH);
    result.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH);
    
    return this.bufferToBase64(result.buffer);
  }

  // Veri çöz
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.key) throw new Error('Key not initialized');
    
    const data = new Uint8Array(this.base64ToBuffer(encryptedData));
    
    // IV'yi çıkar
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  }

  // Session temizle
  clearSession(): void {
    this.key = null;
    this.salt = null;
  }
}

export const encryption = new EncryptionService();
```

### 2.3 Auth Store (Zustand)

```typescript
// src/lib/stores/auth-store.ts

import { create } from 'zustand';
import { db } from '../db/schema';
import { encryption } from '../crypto/encryption';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  
  // Actions
  setup: (password: string) => Promise<void>;
  login: (password: string) => Promise<void>;
  logout: () => void;
  checkTimeout: () => void;
  updateActivity: () => void;
}

const LOCK_TIMEOUT = 15 * 60 * 1000; // 15 dakika
const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY = 30000; // 30 saniye

let failedAttempts = 0;
let lastFailedAttempt = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),

  setup: async (password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Şifreleme servisini kur
      const { salt, verifier } = await encryption.setupPassword(password);
      
      // Profile kaydet
      await db.profiles.put({
        id: 'main',
        salt,
        verifier,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      // Varsayılan ayarları oluştur
      await db.settings.put({
        id: 'main',
        theme: 'dark',
        language: 'tr',
        lockTimeout: 15,
        autoBackup: false,
        backupInterval: 24,
        lastBackupAt: null
      });
      
      set({
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now()
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Kurulum başarısız oldu'
      });
    }
  },

  login: async (password: string) => {
    // Brute-force kontrolü
    if (failedAttempts >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - lastFailedAttempt;
      if (timeSinceLastAttempt < ATTEMPT_DELAY) {
        const remaining = Math.ceil(
          (ATTEMPT_DELAY - timeSinceLastAttempt) / 1000
        );
        set({ error: `Çok fazla deneme. ${remaining} sn bekleyin.` });
        return;
      }
      failedAttempts = 0;
    }

    set({ isLoading: true, error: null });
    
    try {
      const profile = await db.profiles.get('main');
      
      if (!profile) {
        set({
          isLoading: false,
          error: 'Profil bulunamadı'
        });
        return;
      }
      
      const isValid = await encryption.verifyPassword(
        password,
        profile.salt,
        profile.verifier
      );
      
      if (!isValid) {
        failedAttempts++;
        lastFailedAttempt = Date.now();
        set({
          isLoading: false,
          error: `Yanlış şifre (${failedAttempts}/${MAX_ATTEMPTS})`
        });
        return;
      }
      
      failedAttempts = 0;
      set({
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now()
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Giriş başarısız oldu'
      });
    }
  },

  logout: () => {
    encryption.clearSession();
    set({
      isAuthenticated: false,
      error: null
    });
  },

  checkTimeout: () => {
    const { lastActivity, isAuthenticated } = get();
    if (!isAuthenticated) return;
    
    if (Date.now() - lastActivity > LOCK_TIMEOUT) {
      get().logout();
    }
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  }
}));
```

---

## 3. Proje Klasör Yapısı

```
vitaforge/
├── .env.local                    # Ortam değişkenleri
├── .env.example                  # Örnek ortam değişkenleri
├── next.config.ts                # Next.js konfigürasyonu
├── tailwind.config.ts            # Tailwind konfigürasyonu
├── tsconfig.json                 # TypeScript konfigürasyonu
├── package.json
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── favicon.ico
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Kök layout
│   │   ├── page.tsx              # Ana sayfa (yönlendirme)
│   │   ├── globals.css           # Global stiller
│   │   ├── (auth)/               # Auth grupları
│   │   │   ├── layout.tsx        # Auth layout
│   │   │   ├── setup/page.tsx    # İlk kurulum
│   │   │   └── login/page.tsx    # Giriş sayfası
│   │   └── (dashboard)/          # Dashboard grubu
│   │       ├── layout.tsx        # Dashboard layout (sidebar)
│   │       ├── page.tsx          # Ana dashboard
│   │       ├── projects/
│   │       │   ├── page.tsx      # Proje listesi
│   │       │   └── [id]/page.tsx # Proje detay
│   │       ├── tasks/
│   │       │   ├── page.tsx      # Tüm görevler
│   │       │   └── kanban/page.tsx # Kanban görünümü
│   │       ├── habits/
│   │       │   └── page.tsx      # Alışkanlıklar
│   │       ├── notes/
│   │       │   ├── page.tsx      # Not listesi
│   │       │   └── [id]/page.tsx # Not detay
│   │       ├── goals/
│   │       │   └── page.tsx      # Hedefler
│   │       └── settings/
│   │           └── page.tsx      # Ayarlar
│   ├── components/
│   │   ├── ui/                   # shadcn/ui bileşenleri
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── command.tsx       # Command palette
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx       # Sol sidebar
│   │   │   ├── header.tsx        # Üst bar
│   │   │   └── mobile-nav.tsx    # Mobil navigasyon
│   │   ├── auth/
│   │   │   ├── password-input.tsx
│   │   │   └── lock-screen.tsx
│   │   ├── dashboard/
│   │   │   ├── today-summary.tsx
│   │   │   ├── active-projects.tsx
│   │   │   ├── streaks-panel.tsx
│   │   │   └── mood-tracker.tsx
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-form.tsx
│   │   │   └── project-list.tsx
│   │   ├── tasks/
│   │   │   ├── task-card.tsx
│   │   │   ├── task-form.tsx
│   │   │   ├── task-list.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   └── kanban-column.tsx
│   │   ├── habits/
│   │   │   ├── habit-card.tsx
│   │   │   ├── habit-form.tsx
│   │   │   ├── habit-grid.tsx    # GitHub tarzı grid
│   │   │   └── streak-display.tsx
│   │   ├── notes/
│   │   │   ├── note-card.tsx
│   │   │   ├── note-editor.tsx   # Markdown editör
│   │   │   ├── note-graph.tsx    # Bağlantı grafiği
│   │   │   └── note-search.tsx
│   │   ├── goals/
│   │   │   ├── wheel-of-life.tsx
│   │   │   ├── goal-card.tsx
│   │   │   ├── goal-form.tsx
│   │   │   └── okr-tree.tsx
│   │   └── shared/
│   │       ├── color-picker.tsx
│   │       ├── icon-picker.tsx
│   │       ├── tag-input.tsx
│   │       ├── markdown-editor.tsx
│   │       └── empty-state.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   └── schema.ts         # Dexie şeması
│   │   ├── crypto/
│   │   │   ├── encryption.ts     # Şifreleme servisi
│   │   │   └── keychain.ts       # Key yönetimi
│   │   ├── stores/
│   │   │   ├── auth-store.ts     # Auth state
│   │   │   ├── ui-store.ts       # UI state (sidebar, tema)
│   │   │   └── sync-store.ts     # Sync state
│   │   ├── hooks/
│   │   │   ├── use-projects.ts
│   │   │   ├── use-tasks.ts
│   │   │   ├── use-habits.ts
│   │   │   ├── use-notes.ts
│   │   │   ├── use-goals.ts
│   │   │   └── use-lock.ts       # Otomatik kilit
│   │   ├── utils/
│   │   │   ├── date.ts           # Tarih yardımcıları
│   │   │   ├── cn.ts             # clsx + tailwind-merge
│   │   │   └── export.ts         # Yedekleme yardımcıları
│   │   └── types/
│   │       └── index.ts          # Ortak tipler
│   └── styles/
│       └── fonts.css             # Font tanımları
├── prisma/                       # Gelecek için (SQLite)
│   └── schema.prisma
└── scripts/
    └── generate-icons.ts         # PWA ikon üretici
```

---

## 4. Deployment Rehberi

### 4.1 CloudPanel Kurulumu

```bash
# 1. SSH ile sunucuya bağlan
ssh root@kisisel.veliongelen.com.tr

# 2. CloudPanel'i kur (eğer yoksa)
curl -s https://raw.githubusercontent.com/stnkl/cloudpanel-install/main/install.sh | bash

# 3. CloudPanel paneline eriş
# https://sunucu-ip:8443
```

### 4.2 Nginx Konfigürasyonu

```nginx
# /etc/nginx/sites-available/vitaforge.conf

server {
    listen 443 ssl http2;
    server_name kisisel.veliongelen.com.tr;

    # SSL (CloudPanel otomatik yönetir)
    ssl_certificate /etc/letsencrypt/live/kisisel.veliongelen.com.tr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kisisel.veliongelen.com.tr/privkey.pem;

    # Güvenlik başlıkları
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;" always;

    # Gzip sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Next.js uygulaması
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Service Worker için cache ayarı
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_pass http://127.0.0.1:3000/sw.js;
    }

    # Statik dosyalar için cache
    location /_next/static/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
        proxy_pass http://127.0.0.1:3000/_next/static/;
    }

    # PWA manifest
    location /manifest.json {
        add_header Cache-Control "no-cache";
        proxy_pass http://127.0.0.1:3000/manifest.json;
    }
}

# HTTP → HTTPS yönlendirmesi
server {
    listen 80;
    server_name kisisel.veliongelen.com.tr;
    return 301 https://$server_name$request_uri;
}
```

### 4.3 PM2 Konfigürasyonu

```javascript
// ecosystem.config.js

module.exports = {
  apps: [{
    name: 'vitaforge',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/vitaforge',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/pm2/vitaforge-error.log',
    out_file: '/var/log/pm2/vitaforge-out.log',
    merge_logs: true
  }]
};
```

### 4.4 Deployment Scripti

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

APP_DIR="/var/www/vitaforge"
BACKUP_DIR="/var/backups/vitaforge"

echo "🚀 VitaForge deployment başlıyor..."

# Eski yedek
echo "📦 Eski versiyon yedekleniyor..."
mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)

# Kodu güncelle
echo "📥 Kod güncelleniyor..."
cd $APP_DIR
git pull origin main

# Bağımlılıkları güncelle
echo "📚 Bağımlılıklar güncelleniyor..."
npm ci --production

# Build al
echo "🔨 Build alınıyor..."
npm run build

# PM2'yi yeniden başlat
echo "🔄 PM2 yeniden başlatılıyor..."
pm2 restart vitaforge

# Nginx'i test et ve yeniden yükle
echo "🌐 Nginx test ediliyor..."
nginx -t
systemctl reload nginx

echo "✅ Deployment tamamlandı!"
echo "🌐 https://kisisel.veliongelen.com.tr"
```

---

## 5. PWA Konfigürasyonu

### 5.1 next.config.ts

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PWA için gerekli
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate'
        }
      ]
    }
  ],
  
  // Offline destek
  experimental: {
    pwa: true
  }
};

export default nextConfig;
```

### 5.2 manifest.json

```json
{
  "name": "VitaForge",
  "short_name": "VitaForge",
  "description": "Kişisel hayat ve proje yönetim uygulaması",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "utilities"],
  "lang": "tr",
  "dir": "ltr"
}
```

### 5.3 Service Worker (Workbox ile)

```typescript
// src/lib/sw/workbox.ts
// next-pwa kullanıyorsanız bu dosya gerekmez

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache (build zamanında oluşturulur)
precacheAndRoute(self.__WB_MANIFEST);

// API istekleri için Network First
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60 // 1 gün
      })
    ]
  })
);

// Statik dosyalar için Cache First
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new CacheFirst({
    cacheName: 'static-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 gün
      })
    ]
  })
);

// IndexedDB fallback (offline veri erişimi)
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/backup')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', offline: true }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        );
      })
    );
  }
});
```

---

## 6. Environment Variables

```env
# .env.local

# Uygulama
NEXT_PUBLIC_APP_NAME=VitaForge
NEXT_PUBLIC_APP_URL=https://kisisel.veliongelen.com.tr

# Güvenlik
NEXT_PUBLIC_SALT_ROUNDS=600000

# Yedekleme (opsiyonel)
BACKUP_SECRET_KEY=your-backup-secret-key-here
BACKUP_STORAGE_PATH=/var/backups/vitaforge

# PWA
NEXT_PUBLIC_VAPID_KEY=your-vapid-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

---

*Son Güncelleme: 2026-06-18*
*Versiyon: 1.0.0-draft*
