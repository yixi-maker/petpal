'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Avatar, Badge, EmptyState, Button } from '@/components/ui';
import { StatusRing } from './StatusRing';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  avatar?: string | null;
  personalityTags?: string;
  size?: string;
  gender?: string;
}

interface PetStats {
  followers: number;
  following: number;
  friends: number;
}

interface FriendPet {
  id: number;
  name: string;
  avatar?: string | null;
  type: string;
}

interface HealthData {
  weight: number | null;
  nextReminder: string | null;
  vaccineRecords: string | null;
  dewormRecords: string | null;
}

interface PetDashboardProps {
  currentPet: Pet | null;
  pets: Pet[];
  onSwitchPet: (id: number) => void;
}

function formatReminder(dateStr: string | null): string {
  if (!dateStr) return '未设置';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays <= 7) return `${diffDays}天后`;
  return dateStr.slice(0, 10);
}

export function PetDashboard({ currentPet, pets, onSwitchPet }: PetDashboardProps) {
  const router = useRouter();
  const [showPetSwitcher, setShowPetSwitcher] = useState(false);

  const [stats, setStats] = useState<PetStats>({ followers: 0, following: 0, friends: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [friends, setFriends] = useState<FriendPet[]>([]);

  useEffect(() => {
    if (!currentPet) {
      setStats({ followers: 0, following: 0, friends: 0 });
      setHealthData(null);
      setFriends([]);
      return;
    }

    const petId = currentPet.id;

    // Fetch stats
    setStatsLoading(true);
    Promise.all([
      fetch(`/api/social/follow?petId=${petId}&type=followers`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/social/follow?petId=${petId}&type=following`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/social/friends?petId=${petId}`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([followersData, followingData, friendsData]) => {
        setStats({
          followers: followersData?.list?.length || 0,
          following: followingData?.list?.length || 0,
          friends: friendsData?.friends?.length || 0,
        });
        setFriends(friendsData?.friends || []);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    // Fetch health profile
    setHealthLoading(true);
    fetch(`/api/health/profile?petId=${petId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.profile) {
          setHealthData({
            weight: data.profile.weight,
            nextReminder: data.profile.nextReminder,
            vaccineRecords: data.profile.vaccineRecords,
            dewormRecords: data.profile.dewormRecords,
          });
        } else {
          setHealthData(null);
        }
      })
      .catch(() => setHealthData(null))
      .finally(() => setHealthLoading(false));

  }, [currentPet]);

  const petType = (currentPet?.type === 'DOG' || currentPet?.type === 'CAT')
    ? (currentPet.type as 'DOG' | 'CAT')
    : undefined;

  const typeLabel = currentPet?.type === 'DOG' ? '狗狗' : currentPet?.type === 'CAT' ? '猫咪' : currentPet?.type;

  return (
    <div className="px-4">
      {/* ===== Pet Hero ===== */}
      <div className="bg-gradient-to-br from-teal-50/40 via-surface-white to-sea-50/30 rounded-[16px] shadow-sm p-5 mb-4">
        {currentPet ? (
          <div>
            {/* Top row: avatar + name + badge */}
            <div className="flex items-center gap-4 mb-3">
              <Avatar
                src={currentPet.avatar}
                petType={petType}
                size="xl"
                className="w-[72px] h-[72px] flex-shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-[22px] font-bold text-ink truncate">
                  {currentPet.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {typeLabel && (
                    <Badge variant="teal">{typeLabel}</Badge>
                  )}
                  {currentPet.breed && (
                    <span className="text-[13px] text-ink-muted truncate">
                      {currentPet.breed}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-1 text-[13px] text-ink-muted mb-3">
              <span>关注者 {statsLoading ? '...' : stats.followers}</span>
              <span className="text-ink-faded/40">&middot;</span>
              <span>关注中 {statsLoading ? '...' : stats.following}</span>
              <span className="text-ink-faded/40">&middot;</span>
              <span>好友 {statsLoading ? '...' : stats.friends}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {pets.length > 1 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPetSwitcher((prev) => !prev)}
                    className="text-[13px] text-teal-500 hover:text-teal-600 font-medium px-3 py-1.5 rounded-[8px] bg-teal-50 hover:bg-teal-100 transition-colors"
                  >
                    切换宠物
                  </button>
                  {showPetSwitcher && (
                    <div className="absolute top-full left-0 mt-1 bg-surface-white rounded-[10px] shadow-md border border-border-light p-1.5 z-30 min-w-[160px]">
                      {pets.map((pet) => (
                        <button
                          key={pet.id}
                          type="button"
                          onClick={() => {
                            onSwitchPet(pet.id);
                            setShowPetSwitcher(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[13px] rounded-[6px] transition-colors
                            ${pet.id === currentPet.id
                              ? 'bg-teal-50 text-teal-600 font-medium'
                              : 'text-ink hover:bg-surface-alt'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={pet.avatar}
                              petType={(pet.type === 'DOG' || pet.type === 'CAT') ? (pet.type as 'DOG' | 'CAT') : undefined}
                              size="sm"
                              className="flex-shrink-0"
                            />
                            <span className="truncate">{pet.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Link
                href={`/pets/${currentPet.id}`}
                className="text-[13px] text-ink-muted hover:text-ink font-medium px-3 py-1.5 rounded-[8px] bg-surface-alt hover:bg-border-light transition-colors"
              >
                编辑档案
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-[15px] text-ink-muted mb-3">
              添加你的第一只宠物
            </p>
            <Link href="/pets/new">
              <Button size="sm">添加宠物</Button>
            </Link>
          </div>
        )}
      </div>

      {/* ===== Status Rings ===== */}
      <div className="flex justify-around px-2 mb-4">
        <StatusRing label="活力" value="充沛" level="high" />
        <StatusRing label="心情" value="愉悦" level="high" />
        <StatusRing label="食欲" value="良好" level="high" />
        <StatusRing label="活动" value="活跃" level="high" />
      </div>

      {/* ===== Health Glance ===== */}
      <div className="bg-surface-white rounded-[12px] shadow-xs p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-ink">健康一览</h3>
          <Link
            href="/health"
            className="text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors flex items-center gap-0.5"
          >
            查看详情 <ChevronRight className="w-[14px] h-[14px]" />
          </Link>
        </div>

        {currentPet ? (
          <div className="flex gap-3">
            {/* Weight pill */}
            <div className="flex-1 bg-surface-alt/60 rounded-[10px] px-3 py-2.5 text-center">
              <div className="text-[10px] text-ink-faded mb-0.5">体重</div>
              {healthLoading ? (
                <span className="text-[13px] text-ink-faded">加载中</span>
              ) : healthData?.weight != null ? (
                <span className="text-[15px] font-medium text-ink">{healthData.weight} kg</span>
              ) : (
                <span className="text-[12px] text-ink-faded">未记录</span>
              )}
            </div>

            {/* Next reminder pill */}
            <div className="flex-1 bg-surface-alt/60 rounded-[10px] px-3 py-2.5 text-center">
              <div className="text-[10px] text-ink-faded mb-0.5">下次提醒</div>
              {healthLoading ? (
                <span className="text-[13px] text-ink-faded">加载中</span>
              ) : healthData?.nextReminder ? (
                <span className="text-[15px] font-medium text-ink">
                  {formatReminder(healthData.nextReminder)}
                </span>
              ) : (
                <span className="text-[13px] text-teal-500 font-medium">未设置</span>
              )}
            </div>

            {/* Vaccine / Deworm pill */}
            <div className="flex-1 bg-surface-alt/60 rounded-[10px] px-3 py-2.5 text-center">
              <div className="text-[10px] text-ink-faded mb-0.5">疫苗/驱虫</div>
              {healthLoading ? (
                <span className="text-[13px] text-ink-faded">加载中</span>
              ) : healthData?.vaccineRecords || healthData?.dewormRecords ? (
                <span className="text-[13px] font-medium text-sage-500">已记录</span>
              ) : (
                <span className="text-[12px] text-ink-faded">待完善</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <Link
              href="/health"
              className="text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors"
            >
              完善健康档案
            </Link>
          </div>
        )}
      </div>

      {/* ===== Friend Rail ===== */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-ink">好友动态</h3>
          <Link
            href="/nearby"
            className="text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors flex items-center gap-0.5"
          >
            去认识更多 <ChevronRight className="w-[14px] h-[14px]" />
          </Link>
        </div>

        {statsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-[36px] h-[36px] bg-surface-alt rounded-full animate-pulse" />
                <div className="w-10 h-2.5 bg-surface-alt rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : friends.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {friends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => router.push(`/pets/${friend.id}`)}
                className="flex flex-col items-center gap-1 flex-shrink-0 w-[48px]"
              >
                <Avatar
                  src={friend.avatar}
                  petType={(friend.type === 'DOG' || friend.type === 'CAT') ? (friend.type as 'DOG' | 'CAT') : undefined}
                  size="md"
                  className="w-[36px] h-[36px] flex-shrink-0"
                />
                <span className="text-[10px] text-ink-muted truncate w-full text-center leading-tight">
                  {friend.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="还没有好友"
            description="去认识附近的小伙伴吧"
            action={
              <Link href="/nearby">
                <Button size="sm" variant="outline">去看看</Button>
              </Link>
            }
            className="py-6"
          />
        )}
      </div>

      {/* ===== Recent Posts teaser ===== */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-semibold text-ink">最新动态</h3>
        <span className="text-[13px] text-ink-faded">下拉查看全部</span>
      </div>
    </div>
  );
}
