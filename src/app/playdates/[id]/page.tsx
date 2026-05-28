'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button } from '@/components/ui';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  avatar?: string | null;
  type: string;
  breed?: string | null;
  joinedAt: string;
}

interface PlaydateDetail {
  id: number;
  type: string;
  creatorPetId: number;
  targetPetId?: number;
  title: string;
  time: string;
  place: string;
  description?: string | null;
  sizeLimit?: number | null;
  suitableTypes: string[];
  suitableSizes: string[];
  status: string;
  creator: { id: number; name: string; avatar?: string | null; type: string; breed?: string | null };
  target?: { id: number; name: string; avatar?: string | null; type: string; breed?: string | null } | null;
  participantCount: number;
  participants: Participant[];
  isJoined: boolean;
  isCreator: boolean;
}

function formatFullTime(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${year}年${month}月${day}日 ${weekDays[date.getDay()]} ${hours}:${minutes}`;
}

export default function PlaydateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentPet } = usePet();
  const id = params.id as string;

  const [playdate, setPlaydate] = useState<PlaydateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const petIdParam = currentPet ? `?petId=${currentPet.id}` : '';
      const res = await fetch(`/api/playdates/${id}${petIdParam}`);
      if (res.ok) {
        const data = await res.json();
        setPlaydate(data.playdate);
      } else if (res.status === 404) {
        setError('约玩不存在');
      }
    } catch {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  }, [id, currentPet]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleJoinToggle = async () => {
    if (!currentPet || !playdate) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/playdates/${playdate.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: currentPet.id }),
      });
      if (res.ok) {
        fetchDetail();
      } else {
        const data = await res.json();
        setError(data.error || '操作失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!playdate) return;
    if (!confirm('确定要取消这个约玩吗？')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/playdates/${playdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        fetchDetail();
      } else {
        const data = await res.json();
        setError(data.error || '操作失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-ink-faded py-20">加载中...</div>
      </div>
    );
  }

  if (error && !playdate) {
    return (
      <div className="p-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-surface-alt rounded-full mb-4">
          <ArrowLeft className="w-5 h-5" aria-label="返回" />
        </button>
        <div className="text-center text-ink-faded py-20">{error}</div>
      </div>
    );
  }

  if (!playdate) {
    return (
      <div className="p-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-surface-alt rounded-full mb-4">
          <ArrowLeft className="w-5 h-5" aria-label="返回" />
        </button>
        <div className="text-center text-ink-faded py-20">约玩不存在</div>
      </div>
    );
  }

  const isCancelled = playdate.status === 'CANCELLED' || playdate.status === 'COMPLETED';

  return (
    <div className="p-4 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="p-2 -ml-2 hover:bg-surface-alt rounded-full mb-2"
      >
        <ArrowLeft className="w-5 h-5" aria-label="返回" />
      </button>

      {/* Status banner */}
      {isCancelled && (
        <div className="bg-surface-alt text-ink-muted text-sm text-center py-2 rounded-xl mb-4">
          该约玩已取消
        </div>
      )}

      {/* Title */}
      <h1 className="text-xl font-bold mb-4">{playdate.title}</h1>

      {/* Creator info */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={playdate.creator.avatar} alt={playdate.creator.name} size="md" />
        <div>
          <div className="text-sm font-medium">{playdate.creator.name}</div>
          <div className="text-xs text-ink-faded">
            {playdate.creator.type === 'DOG' ? '狗狗' : '猫猫'}
            {playdate.creator.breed ? ` · ${playdate.creator.breed}` : ''}
          </div>
        </div>
        {playdate.type === 'INVITE' && (
          <span className="ml-auto text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded-full">
            一对一邀请
          </span>
        )}
        {playdate.type === 'PUBLIC' && (
          <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
            公开活动
          </span>
        )}
      </div>

      {/* Target pet (INVITE) */}
      {playdate.target && (
        <div className="flex items-center gap-2 mb-4 text-sm text-ink-muted">
          <span>邀请对象：</span>
          <Avatar src={playdate.target.avatar} alt={playdate.target.name} size="sm" />
          <span className="font-medium">{playdate.target.name}</span>
        </div>
      )}

      {/* Time & place */}
      <div className="bg-teal-50 rounded-2xl p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
          <span>{formatFullTime(playdate.time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
          <span>{playdate.place}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-teal-500 shrink-0" />
          <span>
            {playdate.participantCount}{playdate.sizeLimit ? `/${playdate.sizeLimit}` : ''} 人已报名
          </span>
        </div>
      </div>

      {/* Description */}
      {playdate.description && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-ink mb-2">活动介绍</h3>
          <p className="text-sm text-ink-muted leading-relaxed">{playdate.description}</p>
        </div>
      )}

      {/* Suitable tags */}
      {(playdate.suitableTypes.length > 0 || playdate.suitableSizes.length > 0) && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-ink mb-2">适合条件</h3>
          <div className="flex gap-1.5 flex-wrap">
            {playdate.suitableTypes.map((t) => (
              <span key={t} className="text-xs bg-teal-50 text-teal-600 px-2 py-1 rounded-full">
                {t === 'DOG' ? '狗狗' : '猫猫'}
              </span>
            ))}
            {playdate.suitableSizes.map((s) => (
              <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                {s === 'SMALL' ? '小型犬/猫' : s === 'MEDIUM' ? '中型' : '大型'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-ink mb-3">
          报名列表 ({playdate.participantCount}人)
        </h3>
        {playdate.participants.length === 0 ? (
          <p className="text-sm text-ink-faded">暂无报名</p>
        ) : (
          <div className="space-y-2">
            {playdate.participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar src={p.avatar} alt={p.name} size="sm" />
                <div className="flex-1">
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xs text-ink-faded">
                    {p.type === 'DOG' ? '狗狗' : '猫猫'}
                    {p.breed ? ` · ${p.breed}` : ''}
                  </div>
                </div>
                {p.id === playdate.creatorPetId && (
                  <span className="text-xs bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full">
                    发起者
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="text-sm text-rose-500 mb-2">{error}</div>}

      {/* Action buttons */}
      {!isCancelled && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light p-4 pb-[env(safe-area-inset-bottom)] z-30">
          <div className="max-w-mobile mx-auto">
            {playdate.isCreator ? (
              <Button
                variant="danger"
                className="w-full"
                onClick={handleCancelEvent}
                loading={actionLoading}
              >
                取消活动
              </Button>
            ) : (
              <Button
                variant={playdate.isJoined ? 'secondary' : 'primary'}
                className="w-full"
                onClick={handleJoinToggle}
                loading={actionLoading}
              >
                {playdate.isJoined ? '取消报名' : '我要参加'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
