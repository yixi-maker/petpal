'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { TabBar } from './TabBar';
import { PawPrint } from 'lucide-react';

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading: authLoading } = useAuth();
  const { loading: petLoading } = usePet();

  const isFullPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/legal');

  if (isFullPage) {
    return <>{children}</>;
  }

  // Show loading while auth/pet contexts initialize
  const isProtected =
    pathname === '/' ||
    pathname.startsWith('/nearby') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/health') ||
    pathname.startsWith('/me') ||
    pathname.startsWith('/pets') ||
    pathname.startsWith('/posts') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/playdates');

  if (isProtected && (authLoading || petLoading)) {
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
    <div className="max-w-mobile mx-auto min-h-screen bg-surface relative">
      <main className="pb-16">{children}</main>
      <TabBar />
    </div>
  );
}
