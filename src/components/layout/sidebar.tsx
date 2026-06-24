'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Repeat,
  StickyNote,
  Target,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  BookMarked,
  BarChart3,
  Heart,
  Moon,
  Tags,
  Film,
  Wallet,
  Activity,
  Dumbbell,
  Mic,
  Radio,
  Monitor,
  Briefcase,
  Sparkles,
  Gamepad2,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: 'Üretkenlik',
    icon: Briefcase,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Projeler', href: '/projects', icon: FolderKanban },
      { name: 'Görevler', href: '/tasks', icon: CheckSquare },
      { name: 'Alışkanlıklar', href: '/habits', icon: Repeat },
      { name: 'Notlar', href: '/notes', icon: StickyNote },
    ],
  },
  {
    label: 'Sağlık',
    icon: Dumbbell,
    items: [
      { name: 'Spor', href: '/sport', icon: Dumbbell },
      { name: 'Uyku', href: '/sleep', icon: Moon },
      { name: 'Diksiyon', href: '/diction', icon: Mic },
    ],
  },
  {
    label: 'Kişisel',
    icon: Sparkles,
    items: [
      { name: 'Günlük', href: '/journal', icon: BookOpen },
      { name: 'Günlük Notlar', href: '/gratitude', icon: Heart },
      { name: 'Hedefler', href: '/goals', icon: Target },
      { name: 'Okuma', href: '/reading', icon: BookMarked },
    ],
  },
  {
    label: 'Eğlence',
    icon: Gamepad2,
    items: [
      { name: 'Medya', href: '/media', icon: Film },
      { name: 'Radyo', href: '/radio', icon: Radio },
    ],
  },
  {
    label: 'Araçlar',
    icon: Settings,
    items: [
      { name: 'Bütçe', href: '/budget', icon: Wallet },
      { name: 'Etiketler', href: '/tags', icon: Tags },
      { name: 'İstatistikler', href: '/analytics', icon: BarChart3 },
      { name: 'Sunucu', href: '/monitor', icon: Monitor },
      { name: 'Aktivite', href: '/activity', icon: Activity },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const hasActiveInGroup = (group: NavGroup) =>
    group.items.some((item) => isActive(item.href));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-border">
          {sidebarOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              VitaForge
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 space-y-1 px-2 overflow-y-auto">
          {sidebarOpen ? (
            // Açık mod: gruplandırılmış menü
            navigation.map((group) => {
              const collapsed = collapsedGroups[group.label];
              return (
                <div key={group.label} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors',
                      collapsed
                        ? 'text-muted-foreground/70'
                        : hasActiveInGroup(group)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 transition-transform',
                        collapsed && '-rotate-90'
                      )}
                    />
                    <span>{group.label}</span>
                  </button>
                  {!collapsed && (
                    <div className="space-y-0.5 mt-0.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 pl-7 pr-3 py-1.5 rounded-lg text-sm transition-colors',
                            isActive(item.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Kapalı mod: sadece ikonlar
            <>
              <div className="py-1" />
              {navigation.map((group) =>
                group.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center p-2 rounded-lg transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    title={item.name}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                  </Link>
                ))
              )}
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-border space-y-1">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Ayarlar</span>}
          </Link>

          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
              !sidebarOpen && 'justify-center px-2'
            )}
            onClick={logout}
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
