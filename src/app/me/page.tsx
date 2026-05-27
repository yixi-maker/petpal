'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button } from '@/components/ui';
import { ChevronRight, LogOut, Plus, Settings, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MePage() {
  const { user, logout } = useAuth();
  const { pets, currentPet, switchPet } = usePet();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('确定要注销账号吗？此操作不可撤销，所有宠物档案将被隐藏。')) return;
    await fetch('/api/auth/delete-account', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="p-4">
      {/* User info */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar size="lg" />
        <div className="flex-1">
          <div className="font-medium">{user?.nickname || '用户' + (user?.phone?.slice(-4) || '')}</div>
          <div className="text-xs text-gray-400">{user?.phone}</div>
        </div>
        <Link href="/settings" className="p-2"><Settings className="w-5 h-5 text-gray-400" /></Link>
      </div>

      {/* Current pet switcher */}
      <div className="bg-brand-50 rounded-2xl p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">当前宠物身份</h3>
        {pets.length > 0 ? (
          <div className="flex items-center gap-3">
            <Avatar src={currentPet?.avatar} size="lg" />
            <div className="flex-1">
              <div className="font-semibold">{currentPet?.name || '未选择'}</div>
              <div className="text-xs text-gray-400">
                {currentPet?.type === 'DOG' ? '🐶' : '🐱'} {currentPet?.breed || ''}
              </div>
            </div>
            {pets.length > 1 && (
              <select
                className="text-sm border border-brand-200 rounded-lg px-2 py-1 bg-white"
                value={currentPet?.id}
                onChange={(e) => switchPet(Number(e.target.value))}
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">还没有添加宠物</p>
        )}
      </div>

      {/* Menu items */}
      <div className="space-y-1 mb-4">
        <Link href="/pets/new" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl">
          <Plus className="w-5 h-5 text-brand-500" />
          <span className="flex-1 text-sm">添加宠物</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>

        <Link href="/legal/privacy" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl">
          <Shield className="w-5 h-5 text-gray-400" />
          <span className="flex-1 text-sm">隐私政策</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>

        <Link href="/legal/terms" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl">
          <Shield className="w-5 h-5 text-gray-400" />
          <span className="flex-1 text-sm">用户协议</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> 退出登录
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-400" onClick={handleDeleteAccount}>
          <Trash2 className="w-4 h-4 mr-2" /> 注销账号
        </Button>
      </div>
    </div>
  );
}
