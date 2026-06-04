'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawPrint, MapPinned, Map, Stethoscope, CircleUserRound } from 'lucide-react';

const tabs = [
  { key: '/', label: '首页', icon: PawPrint },
  { key: '/nearby', label: '附近', icon: MapPinned },
  { key: '/map', label: '地图', icon: Map },
  { key: '/health', label: '健康', icon: Stethoscope },
  { key: '/me', label: '我的', icon: CircleUserRound },
];

export function TabBar() {
  const pathname = usePathname();

  // Hide TabBar on login, admin, and legal pages
  if (pathname.startsWith('/login') || pathname.startsWith('/admin') || pathname.startsWith('/legal')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-white/95 backdrop-blur-sm border-t border-border-light pb-[calc(4px+env(safe-area-inset-bottom))]">
      <div className="max-w-mobile mx-auto flex items-center justify-around">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key);
          return (
            <Link
              key={key}
              href={key}
              className={`relative flex flex-col items-center gap-[3px] py-[6px] min-w-[56px] transition-all duration-200
                ${isActive ? 'text-teal-500' : 'text-ink-faded/60 hover:text-ink-muted'}`}
            >
              <span className="relative flex items-center justify-center">
                <Icon
                  className={`w-[20px] h-[20px] transition-all duration-200 ${isActive ? 'drop-shadow-[0_0_4px_rgba(29,138,128,0.2)]' : ''}`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {isActive && (
                  <span className="absolute -top-[2px] -right-[3px] w-[3px] h-[3px] rounded-full bg-teal-500" />
                )}
              </span>
              <span
                className={`text-[10px] leading-none ${
                  isActive ? 'font-medium' : ''
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
