'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, theme, setTheme } = useUIStore();
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  // Sync external commandPaletteOpen state with local open state
  useEffect(() => {
    if (commandPaletteOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      setCommandPaletteOpen(false);
    }
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (!open) {
      setCommandPaletteOpen(false);
    }
  }, [open, setCommandPaletteOpen]);

  const runCommand = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Komut veya sayfa ara..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı</CommandEmpty>

        <CommandGroup heading="Navigasyon">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projeler</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Görevler</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/habits'))}>
            <Repeat className="mr-2 h-4 w-4" />
            <span>Alışkanlıklar</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/notes'))}>
            <StickyNote className="mr-2 h-4 w-4" />
            <span>Notlar</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/goals'))}>
            <Target className="mr-2 h-4 w-4" />
            <span>Hedefler</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Ayarlar</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Hızlı Eylemler">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              router.push('/tasks');
              setTimeout(() => {
                document.dispatchEvent(new CustomEvent('open-new-task'));
              }, 100);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Yeni Görev Ekle</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              router.push('/projects');
              setTimeout(() => {
                document.dispatchEvent(new CustomEvent('open-new-project'));
              }, 100);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Yeni Proje Oluştur</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              router.push('/notes');
              setTimeout(() => {
                document.dispatchEvent(new CustomEvent('open-new-note'));
              }, 100);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Yeni Not Ekle</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Tema">
          <CommandItem onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Hesap">
          <CommandItem onSelect={() => runCommand(() => logout())}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Çıkış Yap</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
