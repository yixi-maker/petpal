'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawPrint, MapPin, Map, Stethoscope, User } from 'lucide-react';

const tabs = [
  { key: '/', label: '动态', icon: PawPrint },
  { key: '/nearby', label: '附近', icon: MapPin },
  { key: '/map', label: '地图', icon: Map },
  { key: '/health', label: '健康', icon: Stethoscope },
  { key: '/me', label: '我的', icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  // Hide TabBar on login, admin, and legal pages
  if (pathname.startsWith('/login') || pathname.startsWith('/admin') || pathname.startsWith('/legal')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-white border-t border-border-light
      pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-mobile mx-auto flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key);
          return (
            <Link
              key={key}
              href={key}
              className={`flex-1 flex flex-col items-center py-2 transition-colors duration-200
                ${isActive ? 'text-teal-500' : 'text-ink-faded'}`}
            >
              {isActive ? (
                <span className="rounded-full bg-teal-50 px-3 py-0.5">
                  <Icon className="w-[22px] h-[22px]" strokeWidth={2} />
                </span>
              ) : (
                <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
              )}
              <span
                className={`text-[10px] mt-[3px] ${
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
