'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Map, Stethoscope, User } from 'lucide-react';

const tabs = [
  { key: '/', label: '动态', icon: Home },
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
      pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-mobile mx-auto flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key);
          return (
            <Link
              key={key}
              href={key}
              className={`flex-1 flex flex-col items-center py-2 transition-colors duration-150
                ${isActive ? 'text-coral-500' : 'text-ink-faded'}`}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="w-[3px] h-[3px] rounded-full bg-coral-500 mb-[3px]" />
              )}
              {!isActive && <span className="h-[6px]" />}
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={isActive ? 2 : 1.5}
              />
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
