'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, MapPin, Map, Stethoscope, CircleUser } from 'lucide-react';

const tabs = [
  { key: '/', label: '动态', icon: Newspaper },
  { key: '/nearby', label: '附近', icon: MapPin },
  { key: '/map', label: '地图', icon: Map },
  { key: '/health', label: '健康', icon: Stethoscope },
  { key: '/me', label: '我的', icon: CircleUser },
];

export function TabBar() {
  const pathname = usePathname();

  // Hide TabBar on login, admin, and legal pages
  if (pathname.startsWith('/login') || pathname.startsWith('/admin') || pathname.startsWith('/legal')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-white/90 backdrop-blur-sm border-t border-border-light
      shadow-[0_-1px_4px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-mobile mx-auto flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key);
          return (
            <Link
              key={key}
              href={key}
              className={`flex-1 flex flex-col items-center py-2 transition-all duration-200
                ${isActive ? 'text-teal-500' : 'text-ink-faded'}`}
            >
              {/* Active gradient-dot indicator */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-teal-500 mb-0.5" />
              )}
              {!isActive && <span className="w-1 h-1 mb-0.5" />}
              <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2 : 1.5} />
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
