'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth-store';
import { useUIStore } from '../stores/ui-store';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toggleSidebar, toggleCommandPalette } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.ctrlKey || e.metaKey;

      if (isCmd && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }

      if (isCmd && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('open-new-task'));
      }

      if (isCmd && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('open-new-note'));
      }

      if (isCmd && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('open-new-project'));
      }

      if (isCmd && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('open-global-search'));
      }

      if (isCmd && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }

      if (isCmd && e.key === '/') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('show-shortcuts'));
      }

      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-modal'));
      }

      if (!isCmd && !e.altKey && !e.shiftKey) {
        const shortcuts: Record<string, string> = {
          '1': '/dashboard',
          '2': '/projects',
          '3': '/tasks',
          '4': '/habits',
          '5': '/notes',
          '6': '/goals'
        };
        if (shortcuts[e.key] && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          router.push(shortcuts[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, router, toggleSidebar, toggleCommandPalette]);
}
