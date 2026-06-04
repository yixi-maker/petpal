'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, HeartPulse, House, Map, PawPrint } from 'lucide-react';

const tabs = [
  { key: '/', label: '首页', icon: House },
  { key: '/map', label: '地图', icon: Map },
  { key: '/nearby', label: '宝贝', icon: PawPrint, center: true },
  { key: '/health', label: '健康', icon: HeartPulse },
  { key: '/me', label: '我的', icon: CircleUserRound },
];

export function TabBar() {
  const pathname = usePathname();

  // Hide TabBar on login, admin, and legal pages
  if (pathname.startsWith('/login') || pathname.startsWith('/admin') || pathname.startsWith('/legal')) {
    return null;
  }

  return (
    <nav className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-mobile px-4">
        <div className="pointer-events-auto flex h-[64px] items-center justify-around rounded-[28px] border border-white/70 bg-white/82 px-3 shadow-[0_18px_44px_rgba(16,80,75,0.18)] backdrop-blur-2xl">
        {tabs.map(({ key, label, icon: Icon, center }) => {
          const isActive = key === '/' ? pathname === '/' : pathname.startsWith(key);
          return (
            <Link
              key={key}
              href={key}
              className={`relative flex min-w-[54px] flex-col items-center gap-[3px] transition-all duration-200
                ${center ? '-mt-7' : 'py-[7px]'}
                ${isActive ? 'text-teal-600' : 'text-ink-faded/70 hover:text-ink-muted'}`}
            >
              <span
                className={`relative flex items-center justify-center transition-all duration-200 ${
                  center
                    ? 'h-[58px] w-[58px] rounded-full border-[4px] border-white bg-[radial-gradient(circle_at_35%_25%,#66C6BE_0%,#1D8A80_58%,#10504B_100%)] text-white shadow-[0_16px_30px_rgba(29,138,128,0.34)]'
                    : isActive
                      ? 'h-[28px] w-[28px] rounded-full bg-teal-50 text-teal-600'
                      : 'h-[28px] w-[28px]'
                }`}
              >
                <Icon
                  className={`${center ? 'h-7 w-7 drop-shadow-[0_2px_6px_rgba(7,36,34,0.24)]' : 'h-[19px] w-[19px]'} transition-all duration-200`}
                  strokeWidth={center ? 2.5 : isActive ? 2.1 : 1.6}
                />
              </span>
              <span
                className={`text-[10px] leading-none ${
                  center ? 'mt-0 text-teal-700 font-semibold' : isActive ? 'font-semibold' : ''
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
