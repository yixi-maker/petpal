'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { TabBar } from './TabBar';
import { PawPrint } from 'lucide-react';

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { loading: petLoading } = usePet();

  const isFullPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/legal');

  useEffect(() => {
    if (!isFullPage && !authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, isFullPage, router, user]);

  if (isFullPage) {
    return <>{children}</>;
  }

  // Show loading while auth/pet contexts initialize or while redirecting guests.
  if (authLoading || petLoading || (!user && !authLoading)) {
    return (
      <div className="max-w-mobile mx-auto min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-10 h-10 text-ink-faded/30 mx-auto mb-3 animate-pulse" />
          <p className="text-[13px] text-ink-faded">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-surface relative overflow-x-hidden shadow-[0_0_48px_rgba(16,80,75,0.10)]">
      <main className="pb-16">{children}</main>
      <TabBar />
    </div>
  );
}
