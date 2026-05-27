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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-mobile mx-auto flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key);
          return (
            <Link
              key={key}
              href={key}
              className={`flex-1 flex flex-col items-center py-1.5 text-[10px] transition ${
                isActive ? 'text-brand-500' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
