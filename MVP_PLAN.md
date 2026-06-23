# VitaForge — MVP Geliştirme Planı

## Genel Bakış

Bu belge, VitaForge MVP'sinin adım adım geliştirme planını içerir. Her adım somut task'lara bölünmüştür.

---

## Hafta 1: Temel Altyapı

### 1.1 Proje Kurulumu
```bash
# Next.js 15 projesi oluştur
npx create-next-app@latest vitaforge --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Bağımlılıkları kur
npm install dexie zustand @tanstack/react-query
npm install lucide-react clsx tailwind-merge
npm install react-hook-form zod @hookform/resolvers
npm install next-pwa

# shadcn/ui kurulumu
npx shadcn@latest init
npx shadcn@latest add button input dialog dropdown-menu command card badge tabs separator tooltip sheet popover
```

### 1.2 Dexie.js Şeması
- Dosya: `src/lib/db/schema.ts`
- Tüm tabloları tanımla (PRD'deki şemaya göre)
- IndexedDB versioning ayarla

### 1.3 Şifreleme Modülü
- Dosya: `src/lib/crypto/encryption.ts`
- Web Crypto API ile AES-256-GCM
- PBKDF2 key derivation (600K iterasyon)
- encrypt/decrypt fonksiyonları
- Base64 encode/decode yardımcıları

### 1.4 Auth Store
- Dosya: `src/lib/stores/auth-store.ts`
- Zustand ile auth state yönetimi
- setup(), login(), logout() actions
- Brute-force koruması (5 deneme → 30sn bekleme)
- Otomatik kilit (15 dk hareketsizlik)

### 1.5 Auth Sayfaları
- `src/app/(auth)/setup/page.tsx` — İlk şifre belirleme
- `src/app/(auth)/login/page.tsx` — Giriş ekranı
- `src/components/auth/password-input.tsx` — Şifre inputu
- `src/components/auth/lock-screen.tsx` — Kilit ekranı

### 1.6 Root Layout
- `src/app/layout.tsx` — Kök layout (font, tema)
- `src/app/(auth)/layout.tsx` — Auth layout (merkezi)
- `src/app/(dashboard)/layout.tsx` — Dashboard layout (sidebar)
- `src/app/globals.css` — Tailwind + shadcn tema

---

## Hafta 2: Dashboard & Görevler

### 2.1 Dashboard
- `src/app/(dashboard)/page.tsx` — Ana dashboard
- `src/components/dashboard/today-summary.tsx` — Bugünün özeti
- `src/components/dashboard/active-projects.tsx` — Aktif projeler
- `src/components/dashboard/streaks-panel.tsx` — Streak'ler
- `src/components/dashboard/mood-tracker.tsx` — Mood/Energy seçimi

### 2.2 Layout Bileşenleri
- `src/components/layout/sidebar.tsx` — Sol sidebar
- `src/components/layout/header.tsx` — Üst bar
- `src/components/layout/mobile-nav.tsx` — Mobil navigasyon
- `src/components/shared/command-palette.tsx` — Ctrl+K command palette

### 2.3 Proje Yönetimi
- `src/lib/hooks/use-projects.ts` — Proje hook'u
- `src/app/(dashboard)/projects/page.tsx` — Proje listesi
- `src/app/(dashboard)/projects/[id]/page.tsx` — Proje detay
- `src/components/projects/project-card.tsx` — Proje kartı
- `src/components/projects/project-form.tsx` — Proje formu

### 2.4 Görev Yönetimi
- `src/lib/hooks/use-tasks.ts` — Görev hook'u
- `src/app/(dashboard)/tasks/page.tsx` — Tüm görevler
- `src/components/tasks/task-card.tsx` — Görev kartı
- `src/components/tasks/task-form.tsx` — Görev formu
- `src/components/tasks/task-list.tsx` — Liste görünümü

### 2.5 Kanban Görünümü
- `src/app/(dashboard)/tasks/kanban/page.tsx` — Kanban sayfası
- `src/components/tasks/kanban-board.tsx` — Kanban board
- `src/components/tasks/kanban-column.tsx` — Kanban sütunu
- `@dnd-kit/core` + `@dnd-kit/sortable` kurulumu (sürükle-bırak)

---

## Hafta 3: Alışkanlıklar & Notlar

### 3.1 Alışkanlık Takipçisi
- `src/lib/hooks/use-habits.ts` — Alışkanlık hook'u
- `src/app/(dashboard)/habits/page.tsx` — Alışkanlıklar sayfası
- `src/components/habits/habit-card.tsx` — Alışkanlık kartı
- `src/components/habits/habit-form.tsx` — Alışkanlık formu
- `src/components/habits/habit-grid.tsx` — GitHub tarzı grid
- `src/components/habits/streak-display.tsx` — Streak göstergesi

### 3.2 Streak Hesaplama
- `src/lib/utils/streak.ts` — Streak hesaplama mantığı
- Zincir kırılma kontrolü
- Haftalık/aylık istatistik

### 3.3 Bildirim Sistemi
- `src/lib/notifications.ts` — PWA bildirim servisi
- Service Worker bildirim handling
- Hatırlatma zamanlayıcı
- `src/app/api/notifications/route.ts` — Bildirim API (opsiyonel)

### 3.4 Not Yönetimi
- `src/lib/hooks/use-notes.ts` — Not hook'u
- `src/app/(dashboard)/notes/page.tsx` — Not listesi
- `src/app/(dashboard)/notes/[id]/page.tsx` — Not detay
- `src/components/notes/note-card.tsx` — Not kartı
- `src/components/notes/note-editor.tsx` — Markdown editör
- `src/components/notes/note-search.tsx` — Tam metin arama

### 3.5 Not Bağlantıları
- `[[not-başlığı]]` syntax parsing
- Backlink gösterimi
- Basit graf görünümü (opsiyonel: `react-force-graph`)

---

## Hafta 4: Hedefler & Yedekleme

### 4.1 Hedef Yönetimi
- `src/lib/hooks/use-goals.ts` — Hedef hook'u
- `src/app/(dashboard)/goals/page.tsx` — Hedefler sayfası
- `src/components/goals/goal-card.tsx` — Hedef kartı
- `src/components/goals/goal-form.tsx` — Hedef formu
- `src/components/goals/okr-tree.tsx` — OKR ağacı

### 4.2 Wheel of Life
- `src/components/goals/wheel-of-life.tsx` — Wheel of Life bileşeni
- SVG ile 8 alan görselleştirmesi
- Slider ile puanlama
- Radar grafik

### 4.3 Yedekleme Sistemi
- `src/lib/utils/backup.ts` — Yedekleme yardımcıları
- `src/lib/utils/export.ts` — Export yardımcıları
- JSON export
- Şifreli JSON export
- Markdown export (notlar için)
- Geri yükleme fonksiyonu

### 4.4 Ayarlar Sayfası
- `src/app/(dashboard)/settings/page.tsx` — Ayarlar
- Tema seçimi (light/dark/system)
- Kilitleme timeout ayarı
- Yedekleme ayarları
- Veri yönetimi (export/import)

### 4.5 PWA Kurulumu
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service Worker
- `next-pwa` yapılandırması
- Offline fallback sayfası
- İkon oluşturma scripti

### 4.6 Deployment
- Build optimizasyonu
- PM2 konfigürasyonu
- Nginx config
- SSL/Let's Encrypt
- Deployment scripti
- Monitoring (opsiyonel: PM2 Plus)

---

## Component Örnekleri

### Task Card
```tsx
// src/components/tasks/task-card.tsx

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Task } from '@/lib/db/schema';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (status: Task['status']) => void;
}

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500',
  normal: 'bg-gray-500/10 text-gray-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500'
};

const statusLabels = {
  todo: 'Yapılacak',
  in_progress: 'Devam Ediyor',
  waiting: 'Beklemede',
  done: 'Tamamlandı'
};

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn('text-xs', priorityColors[task.priority])}
          >
            <Flag className="w-3 h-3 mr-1" />
            {task.priority === 'urgent' ? 'Acil' : 
             task.priority === 'high' ? 'Yüksek' :
             task.priority === 'low' ? 'Düşük' : 'Normal'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {statusLabels[task.status]}
          </Badge>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="font-medium line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        {task.deadline && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(task.deadline).toLocaleDateString('tr-TR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Habit Grid (GitHub Tarzı)
```tsx
// src/components/habits/habit-grid.tsx

'use client';

import { cn } from '@/lib/utils/cn';
import { HabitLog } from '@/lib/db/schema';

interface HabitGridProps {
  logs: HabitLog[];
  startDate: Date;
  endDate: Date;
}

export function HabitGrid({ logs, startDate, endDate }: HabitGridProps) {
  // Son 365 günün verisini hesapla
  const days = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    days.push({
      date: dateStr,
      value: log?.value || 0,
      completed: log ? log.value > 0 : false
    });
    current.setDate(current.getDate() + 1);
  }

  // Haftalık grupla (7 günlük satırlar)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              className={cn(
                'w-3 h-3 rounded-sm transition-colors',
                day.value === 0 && 'bg-muted',
                day.value === 1 && 'bg-green-200 dark:bg-green-900',
                day.value === 2 && 'bg-green-400 dark:bg-green-700',
                day.value >= 3 && 'bg-green-600 dark:bg-green-500'
              )}
              title={`${day.date}: ${day.value}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Wheel of Life
```tsx
// src/components/goals/wheel-of-life.tsx

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface LifeArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  currentScore: number;
  targetScore: number;
}

interface WheelOfLifeProps {
  areas: LifeArea[];
  onScoreChange?: (areaId: string, score: number) => void;
}

export function WheelOfLife({ areas, onScoreChange }: WheelOfLifeProps) {
  const center = 150;
  const radius = 120;
  const levels = 10;

  const angleStep = (2 * Math.PI) / areas.length;

  const polygonPoints = useMemo(() => {
    return areas.map((area, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const currentRadius = (area.currentScore / levels) * radius;
      const targetRadius = (area.targetScore / levels) * radius;
      
      return {
        current: {
          x: center + currentRadius * Math.cos(angle),
          y: center + currentRadius * Math.sin(angle)
        },
        target: {
          x: center + targetRadius * Math.cos(angle),
          y: center + targetRadius * Math.sin(angle)
        },
        label: {
          x: center + (radius + 30) * Math.cos(angle),
          y: center + (radius + 30) * Math.sin(angle)
        },
        area
      };
    });
  }, [areas, angleStep]);

  return (
    <div className="relative">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Arka plan daireleri */}
        {[...Array(levels)].map((_, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={((i + 1) / levels) * radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
          />
        ))}

        {/* Hedef polygon */}
        <polygon
          points={polygonPoints
            .map(p => `${p.target.x},${p.target.y}`)
            .join(' ')}
          fill="currentColor"
          fillOpacity={0.1}
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeDasharray="4 4"
        />

        {/* Mevcut polygon */}
        <polygon
          points={polygonPoints
            .map(p => `${p.current.x},${p.current.y}`)
            .join(' ')}
          fill="currentColor"
          fillOpacity={0.3}
          stroke="currentColor"
          strokeWidth={2}
        />

        {/* Noktalar */}
        {polygonPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.current.x}
            cy={point.current.y}
            r={4}
            fill="currentColor"
            className="cursor-pointer hover:scale-150 transition-transform"
            onClick={() => {
              if (onScoreChange) {
                const newScore = point.area.currentScore % 10 + 1;
                onScoreChange(point.area.id, newScore);
              }
            }}
          />
        ))}

        {/* Etiketler */}
        {polygonPoints.map((point, index) => (
          <text
            key={index}
            x={point.label.x}
            y={point.label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-current"
          >
            {point.area.name}
          </text>
        ))}
      </svg>

      {/* Skor göstergesi */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/30 rounded" />
          <span>Mevcut</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/10 border border-dashed border-primary/30 rounded" />
          <span>Hedef</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Kısayol Entegrasyonu

```typescript
// src/lib/hooks/use-keyboard-shortcuts.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth-store';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Ctrl+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Command palette aç
        document.dispatchEvent(new CustomEvent('toggle-command-palette'));
      }

      // Yeni görev (Ctrl+N)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Yeni görev formu aç
        document.dispatchEvent(new CustomEvent('open-new-task'));
      }

      // Yeni not (Ctrl+Shift+N)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        // Yeni not formu aç
        document.dispatchEvent(new CustomEvent('open-new-note'));
      }

      // Sidebar toggle (Ctrl+B)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }

      // Kısayollar yardımı (Ctrl+/)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('show-shortcuts'));
      }

      // Escape
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-modal'));
      }

      // Hızlı navigasyon (1-4)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const shortcuts: Record<string, string> = {
          '1': '/projects',
          '2': '/tasks',
          '3': '/habits',
          '4': '/notes'
        };
        if (shortcuts[e.key]) {
          router.push(shortcuts[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, router]);
}
```

---

## Sonraki Adımlar

1. **Hafta 1'i tamamla** — Temel altyapı + auth sistemi
2. **Demo yap** — İlk working demo'yu test et
3. **Feedback al** — Kullanıcı deneyimini değerlendir
4. **Iterasyon** — Geri bildirime göre geliştir

---

*Son Güncelleme: 2026-06-18*
*Versiyon: 1.0.0-draft*
