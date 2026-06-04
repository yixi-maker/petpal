'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button, Modal } from '@/components/ui';
import { ChevronRight, LogOut, MessageCircle, Plus, Settings, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PetDashboard } from '@/components/home/PetDashboard';

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
    <div className="max-w-mobile mx-auto px-4 pb-28">
      {/* ========== Pet identity profile ========== */}
      <div className="-mx-4 mb-4">
        <PetDashboard currentPet={currentPet} pets={pets} onSwitchPet={switchPet} />
      </div>

      {/* ========== Owner account card ========== */}
      <div className="petpal-soft-card rounded-[22px] p-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar size="xl" className="w-[56px] h-[56px]" />
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-semibold text-ink truncate">
              {user?.nickname || '用户' + (user?.phone?.slice(-4) || '')}
            </div>
            <div className="text-[13px] text-ink-faded truncate">{user?.phone}</div>
          </div>
          <Link href="/settings" className="p-2 -mr-1 hover:bg-white/70 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-ink-muted" aria-label="设置" />
          </Link>
        </div>
      </div>

      {/* ========== Menu list — with shadow-xs ========== */}
      <div className="overflow-hidden rounded-[24px] border border-white/72 bg-white/72 shadow-[0_14px_34px_rgba(16,80,75,0.08)] backdrop-blur-xl divide-y divide-border-light">
        <Link
          href="/messages"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-alt transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-ink-muted flex-shrink-0" aria-label="私信" />
          <span className="flex-1 text-[15px] text-ink">私信</span>
          <ChevronRight className="w-4 h-4 text-ink-faded/30 flex-shrink-0" />
        </Link>

        <Link
          href="/pets/new"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-alt transition-colors"
        >
          <Plus className="w-5 h-5 text-ink-muted flex-shrink-0" />
          <span className="flex-1 text-[15px] text-ink">添加宠物</span>
          <ChevronRight className="w-4 h-4 text-ink-faded/30 flex-shrink-0" />
        </Link>

        <Link
          href="/legal/privacy"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-alt transition-colors"
        >
          <Shield className="w-5 h-5 text-ink-muted flex-shrink-0" />
          <span className="flex-1 text-[15px] text-ink">隐私政策</span>
          <ChevronRight className="w-4 h-4 text-ink-faded/30 flex-shrink-0" />
        </Link>

        <Link
          href="/legal/terms"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-alt transition-colors"
        >
          <Shield className="w-5 h-5 text-ink-muted flex-shrink-0" />
          <span className="flex-1 text-[15px] text-ink">用户协议</span>
          <ChevronRight className="w-4 h-4 text-ink-faded/30 flex-shrink-0" />
        </Link>
      </div>

      {/* ========== Footer actions ========== */}
      <div className="mt-6 space-y-2">
        <Button variant="ghost" className="w-full justify-center text-ink-muted" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" aria-label="退出" />
          退出登录
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-center text-rose-500 text-[13px]"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" aria-label="删除" />
          注销账号
        </Button>
      </div>

      {/* ========== Delete account modal (two-step confirmation) ========== */}
      <Modal open={deleteOpen} onClose={handleCloseDelete} title="注销账号">
        {deleteStep === 1 ? (
          <div>
            <div className="bg-rose-50 border border-rose-500/20 rounded-[10px] p-4 mb-4">
              <p className="text-[14px] text-rose-600 font-medium mb-2">
                确定要注销账号吗？
              </p>
              <ul className="text-[13px] text-rose-500 space-y-1 list-disc pl-4">
                <li>所有宠物档案将被隐藏</li>
                <li>手机号将被脱敏</li>
                <li>数据无法恢复</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCloseDelete}
                className="flex-1 py-2.5 text-[14px] text-ink-muted border border-border rounded-[8px]
                  hover:bg-surface-alt transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setDeleteStep(2)}
                className="flex-1 py-2.5 text-[14px] bg-rose-500 text-white rounded-[8px]
                  hover:bg-rose-600 transition-colors"
              >
                继续注销
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-rose-50 border border-rose-500/20 rounded-[10px] p-4 mb-4">
              <p className="text-[14px] text-rose-600">
                我已知晓，确认注销。此操作不可撤销。
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCloseDelete}
                className="flex-1 py-2.5 text-[14px] text-ink-muted border border-border rounded-[8px]
                  hover:bg-surface-alt transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 text-[14px] bg-rose-500 text-white rounded-[8px]
                  hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
