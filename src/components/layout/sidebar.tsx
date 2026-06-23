'use client';

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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projeler', href: '/projects', icon: FolderKanban },
  { name: 'Görevler', href: '/tasks', icon: CheckSquare },
  { name: 'Alışkanlıklar', href: '/habits', icon: Repeat },
  { name: 'Notlar', href: '/notes', icon: StickyNote },
  { name: 'Spor', href: '/sport', icon: Dumbbell },
  { name: 'Diksiyon', href: '/diction', icon: Mic },
  { name: 'Günlük', href: '/journal', icon: BookOpen },
  { name: 'Günlük Notlar', href: '/gratitude', icon: Heart },
  { name: 'Uyku', href: '/sleep', icon: Moon },
  { name: 'Hedefler', href: '/goals', icon: Target },
  { name: 'Okuma', href: '/reading', icon: BookMarked },
  { name: 'İstatistikler', href: '/analytics', icon: BarChart3 },
  { name: 'Etiketler', href: '/tags', icon: Tags },
  { name: 'Medya', href: '/media', icon: Film },
  { name: 'Radyo', href: '/radio', icon: Radio },
  { name: 'Bütçe', href: '/budget', icon: Wallet },
  { name: 'Sunucu', href: '/monitor', icon: Monitor },
  { name: 'Aktivite', href: '/activity', icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <span className="font-bold text-lg">VitaForge</span>
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
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
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
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Çıkış Yap</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
