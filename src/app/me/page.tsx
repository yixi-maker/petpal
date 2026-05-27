'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button, Modal } from '@/components/ui';
import { ChevronRight, LogOut, MessageCircle, Plus, Settings, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MePage() {
  const { user, logout } = useAuth();
  const { pets, currentPet, switchPet } = usePet();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await fetch('/api/auth/delete-account', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteStep(1);
      router.push('/login');
    }
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setDeleteStep(1);
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
        <Link href="/settings" className="p-2"><Settings className="w-5 h-5 text-gray-400" aria-label="设置" /></Link>
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
        <Link href="/messages" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl">
          <MessageCircle className="w-5 h-5 text-brand-500" aria-label="私信" />
          <span className="flex-1 text-sm">私信</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>

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
          <LogOut className="w-4 h-4 mr-2" aria-label="退出" /> 退出登录
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-400" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-4 h-4 mr-2" aria-label="删除" /> 注销账号
        </Button>
      </div>

      {/* Delete account modal */}
      <Modal open={deleteOpen} onClose={handleCloseDelete} title="注销账号">
        {deleteStep === 1 ? (
          <div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700 font-medium mb-2">
                确定要注销账号吗？
              </p>
              <ul className="text-xs text-red-600 space-y-1 list-disc pl-4">
                <li>所有宠物档案将被隐藏</li>
                <li>手机号将被脱敏</li>
                <li>数据无法恢复</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCloseDelete}
                className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setDeleteStep(2)}
                className="flex-1 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                继续注销
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700">
                我已知晓，确认注销。此操作不可撤销。
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCloseDelete}
                className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? '注销中...' : '我已知晓，确认注销'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
