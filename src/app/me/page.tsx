'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button, Modal } from '@/components/ui';
import { ChevronRight, LogOut, MessageCircle, Plus, Settings, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function petTypeFromString(t: string): 'DOG' | 'CAT' | undefined {
  if (t === 'DOG' || t === 'CAT') return t;
  return undefined;
}

export default function MePage() {
  const { user, logout } = useAuth();
  const { pets, currentPet, loading: petLoading, switchPet } = usePet();
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
    <div className="max-w-mobile mx-auto px-4 pb-24">
      {/* ========== Profile header card ========== */}
      <div className="bg-surface-white rounded-[12px] p-4 shadow-sm mb-4 mt-4">
        <div className="flex items-center gap-3">
          <Avatar size="xl" className="w-[56px] h-[56px]" />
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-semibold text-ink truncate">
              {user?.nickname || '用户' + (user?.phone?.slice(-4) || '')}
            </div>
            <div className="text-[13px] text-ink-faded truncate">{user?.phone}</div>
          </div>
          <Link href="/settings" className="p-2 -mr-1 hover:bg-surface-alt rounded-[8px] transition-colors">
            <Settings className="w-5 h-5 text-ink-muted" aria-label="设置" />
          </Link>
        </div>
      </div>

      {/* ========== Current pet identity card — enhanced gradient ========== */}
      <div className="bg-gradient-to-br from-teal-50/40 via-teal-50/20 to-surface-white rounded-[14px] shadow-sm p-4 mb-4">
        <h3 className="text-[13px] font-medium text-ink-muted mb-3">当前宠物身份</h3>
        {petLoading ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-surface-alt" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-alt rounded w-20" />
              <div className="h-3 bg-surface-alt rounded w-16" />
            </div>
          </div>
        ) : pets.length > 0 ? (
          <>
            {/* Current pet */}
            <div className="flex items-center gap-3">
              <Avatar
                src={currentPet?.avatar}
                petType={currentPet ? petTypeFromString(currentPet.type) : undefined}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-ink">
                  {currentPet?.name || '未选择'}
                </div>
                <div className="text-[13px] text-ink-muted flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-teal-50 text-teal-600 text-[11px] font-medium">
                    {currentPet?.type === 'DOG' ? '狗狗' : currentPet?.type === 'CAT' ? '猫咪' : '宠物'}
                  </span>
                  {currentPet?.breed ? <span>{currentPet.breed}</span> : null}
                </div>
              </div>
              <Link
                href="/pets/new"
                className="flex items-center gap-1 text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加宠物
              </Link>
            </div>

            {/* Pet switcher — horizontal row of small avatars */}
            {pets.length > 1 && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-teal-100">
                {pets.map((p) => {
                  const isCurrent = p.id === currentPet?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => switchPet(p.id)}
                      className={`relative flex flex-col items-center gap-1 transition-all ${
                        isCurrent ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                      }`}
                    >
                      <Avatar
                        src={p.avatar}
                        petType={petTypeFromString(p.type)}
                        size="md"
                        className={isCurrent ? 'ring-2 ring-teal-500 ring-offset-1' : ''}
                      />
                      <span
                        className={`text-[11px] truncate max-w-[48px] ${
                          isCurrent ? 'text-teal-600 font-medium' : 'text-ink-muted'
                        }`}
                      >
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-[14px] text-ink-faded mb-2">还没有添加宠物</p>
            <Link
              href="/pets/new"
              className="inline-flex items-center gap-1 text-[14px] text-teal-500 hover:text-teal-600 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加宠物
            </Link>
          </div>
        )}
      </div>

      {/* ========== Menu list — with shadow-xs ========== */}
      <div className="bg-surface-white rounded-[12px] shadow-xs overflow-hidden divide-y divide-border-light">
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
