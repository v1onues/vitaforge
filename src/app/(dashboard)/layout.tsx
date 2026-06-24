'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useUIStore } from '@/lib/stores/ui-store';
import { CommandPalette } from '@/components/shared/command-palette';
import { MiniRadio } from '@/components/shared/mini-radio';
import { QuickAdd } from '@/components/shared/quick-add';
import { GlobalSearch } from '@/components/shared/global-search';
import { AiAgent } from '@/components/shared/ai-agent';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, checkTimeout, updateActivity } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  useKeyboardShortcuts();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Process recurring tasks on mount
  useEffect(() => {
    if (isAuthenticated) {
      import('@/lib/utils/recurring').then(({ processRecurringTasks }) => {
        processRecurringTasks();
      });
      import('@/lib/utils/auto-backup').then(({ checkAutoBackup }) => {
        checkAutoBackup();
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkTimeout();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkTimeout]);

  useEffect(() => {
    const handleActivity = () => updateActivity();
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [updateActivity]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <Header />
        <div className="flex-1 p-6 pb-20">
          {children}
        </div>
      </main>
      <CommandPalette />
      <MiniRadio />
      <QuickAdd />
      <GlobalSearch />
      <AiAgent />
    </div>
  );
}
