'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Repeat,
  StickyNote,
  Target,
  Settings,
  Plus,
  Moon,
  Sun,
  LogOut,
  Search,
  Radio,
  Film,
  BookOpen,
  DollarSign,
  MoonIcon,
  BarChart3,
  Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projeler', href: '/projects' },
  { icon: CheckSquare, label: 'Görevler', href: '/tasks' },
  { icon: Repeat, label: 'Alışkanlıklar', href: '/habits' },
  { icon: StickyNote, label: 'Notlar', href: '/notes' },
  { icon: Target, label: 'Hedefler', href: '/goals' },
  { icon: BookOpen, label: 'Günlük', href: '/journal' },
  { icon: Film, label: 'Medya', href: '/media' },
  { icon: Radio, label: 'Radyo', href: '/radio' },
  { icon: DollarSign, label: 'Bütçe', href: '/budget' },
  { icon: MoonIcon, label: 'Uyku', href: '/sleep' },
  { icon: BarChart3, label: 'Analitik', href: '/analytics' },
  { icon: Activity, label: 'Aktivite', href: '/activity' },
  { icon: Settings, label: 'Ayarlar', href: '/settings' },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, theme, setTheme } = useUIStore();
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setOpen(true);
      setCommandPaletteOpen(false);
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (fn: () => void) => {
    setOpen(false);
    setQuery('');
    fn();
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const filteredNav = query
    ? NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS;

  const filteredQuick = query
    ? [
        { icon: Plus, label: 'Yeni Görev', action: () => { router.push('/tasks'); setTimeout(() => document.dispatchEvent(new CustomEvent('open-new-task')), 100); } },
        { icon: Plus, label: 'Yeni Proje', action: () => { router.push('/projects'); setTimeout(() => document.dispatchEvent(new CustomEvent('open-new-project')), 100); } },
        { icon: Plus, label: 'Yeni Not', action: () => { router.push('/notes'); setTimeout(() => document.dispatchEvent(new CustomEvent('open-new-note')), 100); } },
      ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => { setOpen(false); setQuery(''); }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Komut veya sayfa ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filteredNav.length > 0 && (
            <div className="px-2 pb-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Navigasyon</p>
              {filteredNav.map((item) => (
                <button
                  key={item.href}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors"
                  onClick={() => runCommand(() => router.push(item.href))}
                >
                  <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {!query && filteredQuick.length === 0 && (
            <div className="px-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Hızlı Eylemler</p>
              {[
                { icon: Plus, label: 'Yeni Görev', href: '/tasks', event: 'open-new-task' as const },
                { icon: Plus, label: 'Yeni Proje', href: '/projects', event: 'open-new-project' as const },
                { icon: Plus, label: 'Yeni Not', href: '/notes', event: 'open-new-note' as const },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors"
                  onClick={() => runCommand(() => {
                    router.push(item.href);
                    setTimeout(() => document.dispatchEvent(new CustomEvent(item.event)), 100);
                  })}
                >
                  <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {filteredQuick.length > 0 && (
            <div className="px-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Hızlı Eylemler</p>
              {filteredQuick.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors"
                  onClick={() => runCommand(item.action)}
                >
                  <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="px-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Tema</p>
              <button
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left hover:bg-muted transition-colors"
                onClick={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span>{theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}</span>
              </button>
            </div>
          )}

          {!query && (
            <div className="px-2 pb-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Hesap</p>
              <button
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left hover:bg-destructive/10 text-destructive transition-colors"
                onClick={() => runCommand(() => logout())}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}

          {query && filteredNav.length === 0 && filteredQuick.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Sonuç bulunamadı</p>
          )}
        </div>
      </div>
    </div>
  );
}
