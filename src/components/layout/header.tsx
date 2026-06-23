'use client';

import { useUIStore } from '@/lib/stores/ui-store';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Moon, 
  Sun, 
  Command
} from 'lucide-react';

export function Header() {
  const { theme, setTheme, toggleCommandPalette } = useUIStore();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search / Command Palette Trigger */}
      <Button
        variant="outline"
        className="w-64 justify-start text-muted-foreground"
        onClick={toggleCommandPalette}
      >
        <Search className="w-4 h-4 mr-2" />
        <span>Ara...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="w-3 h-3" />K
        </kbd>
      </Button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const resolved = theme === 'system'
              ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
              : theme;
            setTheme(resolved === 'dark' ? 'light' : 'dark');
          }}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
