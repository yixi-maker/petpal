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
      <div className="mx-auto flex min-h-[100dvh] max-w-mobile items-center justify-center bg-[radial-gradient(circle_at_50%_18%,rgba(122,174,198,0.22),transparent_34%),linear-gradient(180deg,#F6FBF9_0%,#EEF7F4_100%)]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-[0_12px_30px_rgba(16,80,75,0.10)] backdrop-blur-xl">
            <PawPrint className="h-6 w-6 animate-pulse text-teal-500/60" />
          </div>
          <p className="text-[13px] text-ink-faded">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-[100dvh] max-w-mobile overflow-x-hidden border-x border-white/55 bg-[radial-gradient(circle_at_20%_4%,rgba(122,174,198,0.24),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(106,168,110,0.18),transparent_30%),linear-gradient(180deg,#F8FCFA_0%,#EEF7F4_48%,#F7F2EA_100%)] shadow-[0_0_70px_rgba(16,80,75,0.16)]">
      <main className="pb-20">{children}</main>
      <TabBar />
    </div>
  );
}
