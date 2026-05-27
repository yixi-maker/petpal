'use client';

import { usePathname } from 'next/navigation';
import { TabBar } from './TabBar';

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname.startsWith('/login') || pathname.startsWith('/admin') || pathname.startsWith('/legal');

  if (isFullPage) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-mobile mx-auto min-h-screen bg-white shadow-sm relative">
      <main className="pb-16">{children}</main>
      <TabBar />
    </div>
  );
}
