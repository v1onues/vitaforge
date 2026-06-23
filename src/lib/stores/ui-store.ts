import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  commandPaletteOpen: false,

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('vitaforge-theme', theme);
      applyTheme(theme);
    }
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },

  setCommandPaletteOpen: (open) => {
    set({ commandPaletteOpen: open });
  }
}));

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

export function initializeTheme() {
  if (typeof window === 'undefined') return;
  
  const saved = localStorage.getItem('vitaforge-theme') as 'light' | 'dark' | 'system' | null;
  const theme = saved || 'dark';
  applyTheme(theme);
  useUIStore.getState().setTheme(theme);
}
