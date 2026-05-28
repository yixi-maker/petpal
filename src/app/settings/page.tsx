'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, MapPin, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/me"><ArrowLeft className="w-5 h-5" aria-label="返回" /></Link>
        <h1 className="text-[17px] font-semibold text-ink">设置</h1>
      </div>

      {/* Account Info */}
      <div className="bg-surface-white rounded-[12px] shadow-card p-4 mb-4">
        <h2 className="text-[13px] font-medium text-ink-faded mb-3">账号信息</h2>
        <div className="text-[15px] text-ink mb-1">{user?.phone || ''}</div>
        <div className="text-[13px] text-ink-faded">已通过手机号验证</div>
      </div>

      {/* Privacy & Location */}
      <div className="bg-surface-white rounded-[12px] shadow-card divide-y divide-border-light mb-4">
        <Link href="/legal/privacy" className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-alt transition">
          <Shield className="w-5 h-5 text-ink-muted" />
          <span className="flex-1 text-[15px] text-ink">隐私政策</span>
          <ChevronRight className="w-4 h-4 text-ink-faded/30" />
        </Link>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <MapPin className="w-5 h-5 text-ink-muted" />
          <span className="flex-1 text-[15px] text-ink">位置展示</span>
          <span className="text-[13px] text-ink-faded">仅模糊距离，不展示精确位置</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 text-[15px] text-ink-muted text-center hover:text-ink transition"
      >
        <LogOut className="w-4 h-4 inline mr-2" />
        退出登录
      </button>
    </div>
  );
}
