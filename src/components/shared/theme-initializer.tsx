'use client';

import { useEffect } from 'react';
import { initializeTheme } from '@/lib/stores/ui-store';

export function ThemeInitializer() {
  useEffect(() => {
    initializeTheme();
  }, []);

  return null;
}
