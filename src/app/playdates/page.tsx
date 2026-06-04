'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button, Modal, Tabs } from '@/components/ui';
import { MapPin, Users, Plus, Clock } from 'lucide-react';

interface PlaydateItem {
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
  isJoined?: boolean;
}

interface Friend {
  id: number;
  name: string;
  avatar?: string | null;
  type: string;
  breed?: string | null;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 ${weekDays[date.getDay()]} ${hours}:${minutes}`;
}

export default function PlaydatesPage() {
  const { currentPet } = usePet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('public');
  const [playdates, setPlaydates] = useState<PlaydateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'PUBLIC' | 'INVITE'>('PUBLIC');
  const [createTitle, setCreateTitle] = useState('');
  const [createTime, setCreateTime] = useState('');
  const [createPlace, setCreatePlace] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createSizeLimit, setCreateSizeLimit] = useState<number | ''>('');
  const [createSuitableTypes, setCreateSuitableTypes] = useState<string[]>([]);
  const [createSuitableSizes, setCreateSuitableSizes] = useState<string[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPlaydates = useCallback(async () => {
    if (!currentPet) return;
    setLoading(true);
    try {
      const type = activeTab === 'public' ? 'PUBLIC' : 'INVITE';
      const url = `/api/playdates?type=${type}&petId=${currentPet.id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlaydates(data.playdates);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPet]);

  useEffect(() => {
    fetchPlaydates();
  }, [fetchPlaydates]);

  const handleJoinToggle = async (playdateId: number) => {
    if (!currentPet) return;
    const res = await fetch(`/api/playdates/${playdateId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId: currentPet.id }),
    });
    if (res.ok) {
      fetchPlaydates();
    }
  };

  const openCreateModal = async () => {
    setError('');
    setCreateType('PUBLIC');
    setCreateTitle('');
    setCreateTime('');
    setCreatePlace('');
    setCreateDescription('');
    setCreateSizeLimit('');
    setCreateSuitableTypes([]);
    setCreateSuitableSizes([]);
    setSelectedFriendId(null);
    setShowCreateModal(true);
  };

  const loadFriends = async () => {
    if (!currentPet) return;
    setFriendsLoading(true);
    try {
      const res = await fetch(`/api/social/friends?petId=${currentPet.id}`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends);
      }
    } catch {
      // ignore
    } finally {
      setFriendsLoading(false);
    }
  };

  const toggleSuitableType = (type: string) => {
    setCreateSuitableTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSuitableSize = (size: string) => {
    setCreateSuitableSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleCreate = async () => {
    if (!currentPet) return;
    setError('');

    if (createType === 'PUBLIC') {
      if (!createTitle || !createTime || !createPlace) {
        setError('请填写活动标题、时间和地点');
        return;
      }
    } else {
      if (!selectedFriendId) {
        setError('请选择邀请对象');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/playdates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: createType,
          creatorPetId: currentPet.id,
          targetPetId: createType === 'INVITE' ? selectedFriendId : undefined,
          title: createTitle,
          time: createTime,
          place: createPlace,
          description: createDescription || undefined,
          sizeLimit: createSizeLimit || undefined,
          suitableTypes: createSuitableTypes,
          suitableSizes: createSuitableSizes,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setActiveTab(createType === 'PUBLIC' ? 'public' : 'mine');
        fetchPlaydates();
      } else {
        const data = await res.json();
        setError(data.error || '创建失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentPet) {
    return (
      <div className="p-4 text-center text-ink-faded mt-20">
        请先添加宠物
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">约玩</h1>
      </div>

      <Tabs
        tabs={[
          { key: 'public', label: '公开活动' },
          { key: 'mine', label: '我的约玩' },
        ]}
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
        }}
      />

      {/* Playdate list */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="text-center text-ink-faded py-10">加载中...</div>
        ) : playdates.length === 0 ? (
          <div className="text-center text-ink-faded py-10">
            {activeTab === 'public' ? '暂无公开活动' : '暂无约玩记录'}
            <p className="text-xs mt-1">点击右下角 + 发起约玩</p>
          </div>
        ) : (
          playdates.map((pd) => (
            <div
              key={pd.id}
              onClick={() => router.push(`/playdates/${pd.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border-light cursor-pointer hover:shadow-md transition active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <Avatar src={pd.creator.avatar} alt={pd.creator.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{pd.title}</h3>
                    {pd.type === 'INVITE' && (
                      <span className="text-xs bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full shrink-0">
                        一对一
                      </span>
                    )}
                    {pd.type === 'PUBLIC' && (
                      <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">
                        公开
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-ink-faded">
                    <span>{pd.creator.name}</span>
                    {pd.target && (
                      <>
                        <span className="mx-1">&rarr;</span>
                        <span>{pd.target.name}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(pd.time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pd.place}
                    </span>
                  </div>

                  {/* Tags */}
                  {(pd.suitableTypes.length > 0 || pd.suitableSizes.length > 0) && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {pd.suitableTypes.map((t) => (
                        <span key={t} className="text-xs bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full">
                          {t === 'DOG' ? '狗狗' : '猫猫'}
                        </span>
                      ))}
                      {pd.suitableSizes.map((s) => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                          {s === 'SMALL' ? '小型' : s === 'MEDIUM' ? '中型' : '大型'}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-ink-faded flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {pd.participantCount}{pd.sizeLimit ? `/${pd.sizeLimit}` : ''} 人
                    </span>

                    {pd.status === 'ACTIVE' && pd.creatorPetId !== currentPet.id && (
                      <Button
                        size="sm"
                        variant={pd.isJoined ? 'secondary' : 'primary'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinToggle(pd.id);
                        }}
                      >
                        {pd.isJoined ? '取消报名' : '我要参加'}
                      </Button>
                    )}
                    {pd.status === 'ACTIVE' && pd.creatorPetId === currentPet.id && (
                      <span className="text-xs text-teal-500 font-medium">我的活动</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Float create button */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-teal-600 active:scale-95 transition z-30"
      >
        <Plus className="w-6 h-6" aria-label="发布动态" />
      </button>

      {/* Create modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="发起约玩">
        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">约玩类型</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCreateType('PUBLIC')}
                className={`flex-1 py-2 text-sm rounded-xl border transition ${
                  createType === 'PUBLIC'
                    ? 'border-teal-500 bg-teal-50 text-teal-600'
                    : 'border-border text-ink-muted'
                }`}
              >
                公开活动
              </button>
              <button
                onClick={() => {
                  setCreateType('INVITE');
                  loadFriends();
                }}
                className={`flex-1 py-2 text-sm rounded-xl border transition ${
                  createType === 'INVITE'
                    ? 'border-teal-500 bg-teal-50 text-teal-600'
                    : 'border-border text-ink-muted'
                }`}
              >
                一对一邀请
              </button>
            </div>
          </div>

          {/* Friend selector (INVITE only) */}
          {createType === 'INVITE' && (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">邀请好友</label>
              {friendsLoading ? (
                <div className="text-sm text-ink-faded">加载好友列表...</div>
              ) : friends.length === 0 ? (
                <div className="text-sm text-ink-faded">暂无好友，请先添加好友</div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {friends.map((friend) => (
                    <label
                      key={friend.id}
                      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition ${
                        selectedFriendId === friend.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-border-light'
                      }`}
                    >
                      <input
                        type="radio"
                        name="friend"
                        value={friend.id}
                        checked={selectedFriendId === friend.id}
                        onChange={() => setSelectedFriendId(friend.id)}
                        className="sr-only"
                      />
                      <Avatar src={friend.avatar} alt={friend.name} size="sm" />
                      <div>
                        <div className="text-sm font-medium">{friend.name}</div>
                        <div className="text-xs text-ink-faded">
                          {friend.type === 'DOG' ? '狗狗' : '猫猫'}
                          {friend.breed ? ` · ${friend.breed}` : ''}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">活动标题</label>
            <input
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder={createType === 'PUBLIC' ? '例如：周六一起去公园' : '例如：一起散步'}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">时间</label>
            <input
              type="datetime-local"
              value={createTime}
              onChange={(e) => setCreateTime(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">地点</label>
            <input
              value={createPlace}
              onChange={(e) => setCreatePlace(e.target.value)}
              placeholder="例如：朝阳公园"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">描述（选填）</label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="简单介绍一下活动内容..."
              rows={2}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">人数限制（选填）</label>
            <input
              type="number"
              value={createSizeLimit}
              onChange={(e) => setCreateSizeLimit(e.target.value ? Number(e.target.value) : '')}
              placeholder="不限"
              min={1}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Suitable types */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">适合物种</label>
            <div className="flex gap-2">
              {['DOG', 'CAT'].map((t) => (
                <button
                  key={t}
                  onClick={() => toggleSuitableType(t)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition ${
                    createSuitableTypes.includes(t)
                      ? 'border-teal-500 bg-teal-50 text-teal-600'
                      : 'border-border text-ink-muted'
                  }`}
                >
                  {t === 'DOG' ? '狗狗' : '猫猫'}
                </button>
              ))}
            </div>
          </div>

          {/* Suitable sizes */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">适合体型</label>
            <div className="flex gap-2">
              {[
                { key: 'SMALL', label: '小型' },
                { key: 'MEDIUM', label: '中型' },
                { key: 'LARGE', label: '大型' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSuitableSize(s.key)}
                  className={`px-4 py-1.5 text-sm rounded-full border transition ${
                    createSuitableSizes.includes(s.key)
                      ? 'border-teal-500 bg-teal-50 text-teal-600'
                      : 'border-border text-ink-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-sm text-rose-500">{error}</div>}

          <Button
            className="w-full"
            onClick={handleCreate}
            loading={submitting}
          >
            发布约玩
          </Button>
        </div>
      </Modal>
    </div>
  );
}
