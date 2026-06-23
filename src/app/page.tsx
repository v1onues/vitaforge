'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function Home() {
  const { isSetup, isAuthenticated, checkSetup } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkSetup();
  }, [checkSetup]);

  useEffect(() => {
    if (isSetup === null) return;

    if (!isSetup) {
      router.push('/setup');
    } else if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [isSetup, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
    </div>
  );
}
