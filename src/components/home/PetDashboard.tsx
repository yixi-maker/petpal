'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  ChevronRight,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Syringe,
  Users,
} from 'lucide-react';
import { Avatar, EmptyState, Button } from '@/components/ui';
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

function parsePersonalityTags(raw?: string | null): string[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
        .map((tag) => tag.trim())
        .slice(0, 3);
    }
  } catch {
    // Fall through to loose text parsing for legacy comma-separated values.
  }

  return raw
    .split(/[,，\s]+/)
    .map((tag) => tag.replace(/[[\]"']/g, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

function formatGender(gender?: string | null): string {
  if (!gender) return '可爱星球居民';
  const normalized = gender.toUpperCase();
  if (normalized === 'MALE' || normalized === 'M') return '男孩';
  if (normalized === 'FEMALE' || normalized === 'F') return '女孩';
  if (gender === '公' || gender === '母') return gender === '公' ? '男孩' : '女孩';
  return gender;
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
  const personalityTags = parsePersonalityTags(currentPet?.personalityTags);
  const heroLine = currentPet?.type === 'CAT'
    ? '今天也在认真观察世界'
    : '今天适合认识新朋友';

  return (
    <div className="relative px-4 pt-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px] bg-[linear-gradient(145deg,rgba(29,138,128,0.18),rgba(122,174,198,0.16)_45%,rgba(244,247,244,0)_100%)]" />

      {/* ===== Pet Identity Hero ===== */}
      <div className="relative mb-4 overflow-hidden rounded-[16px] bg-[linear-gradient(140deg,#083B38_0%,#1D8A80_46%,#7AAEC6_100%)] p-5 text-white shadow-[0_20px_48px_rgba(16,80,75,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_40%,rgba(7,36,34,0.24)_100%)]" />
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-44 w-44 rounded-full border border-white/10" />
        {currentPet ? (
          <div className="relative">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-white/70">
                  <Sparkles className="h-3.5 w-3.5" />
                  PetPal 身份主页
                </p>
                <h2 className="truncate text-[22px] font-bold tracking-[-0.3px] leading-tight">
                  {currentPet.name}
                </h2>
                <p className="mt-1 truncate text-[13px] text-white/75">
                  {typeLabel || '宠物'}{currentPet.breed ? ` · ${currentPet.breed}` : ''} · {heroLine}
                </p>
              </div>
              <Avatar
                src={currentPet.avatar}
                petType={petType}
                size="xl"
                className="h-[72px] w-[72px] flex-shrink-0 ring-2 ring-teal-100 ring-offset-2 ring-offset-teal-900/20"
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[12px] font-medium text-white/90 backdrop-blur-xl">
                {formatGender(currentPet.gender)}
              </span>
              {(personalityTags.length > 0 ? personalityTags : ['亲人', '爱玩']).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] text-white/75 backdrop-blur-xl"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 rounded-[20px] border border-white/20 bg-white/10 p-3 backdrop-blur-xl">
              {[
                { label: '关注者', value: stats.followers },
                { label: '关注中', value: stats.following },
                { label: '好友', value: stats.friends },
              ].map((item, i, arr) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center text-center">
                    <p className="text-[18px] font-semibold leading-none">
                      {statsLoading ? '...' : item.value}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-faded">{item.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <span className="text-[11px] text-white/30 mx-1">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              {pets.length > 1 && (
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setShowPetSwitcher((prev) => !prev)}
                    className="w-full rounded-full border border-white/20 bg-white/20 px-4 py-2.5 text-[13px] font-medium text-white/90 shadow-[0_8px_18px_rgba(7,36,34,0.12)] backdrop-blur-xl transition-colors hover:bg-white/25"
                  >
                    切换宠物
                  </button>
                  {showPetSwitcher && (
                    <div className="absolute left-0 top-full z-30 mt-2 min-w-[190px] rounded-[18px] border border-white/70 bg-white/90 p-2 shadow-[0_18px_42px_rgba(16,80,75,0.18)] backdrop-blur-xl">
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
                className="flex-1 rounded-full border border-white/25 bg-white px-4 py-2.5 text-center text-[13px] font-semibold text-teal-700 shadow-[0_10px_24px_rgba(7,36,34,0.16)] transition-colors hover:bg-teal-50"
              >
                编辑档案
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-teal-100/30 ring-2 ring-teal-100 ring-offset-2 ring-offset-teal-900/10">
                <Sparkles className="h-8 w-8 text-teal-500" />
              </div>
            </div>
            <p className="mb-1 text-[15px] font-medium text-white/95">
              添加你的第一只宠物
            </p>
            <p className="mb-4 text-[12px] text-white/65">
              记录它的日常，认识附近的小伙伴
            </p>
            <Link href="/pets/new">
              <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-white border-0">添加宠物</Button>
            </Link>
          </div>
        )}
      </div>

      {/* ===== Status Rings ===== */}
      <div className="relative mb-4 flex justify-center gap-4 py-1">
        <StatusRing label="活力" value="充沛" level="high" />
        <StatusRing label="心情" value="愉悦" level="high" />
        <StatusRing label="食欲" value="良好" level="high" />
        <StatusRing label="活动" value="活跃" level="high" />
      </div>

      {/* ===== Health Glance ===== */}
      <div className="relative mb-4 overflow-hidden rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-[0_14px_34px_rgba(16,80,75,0.10)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-sea-400 to-sage-400" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <HeartPulse className="h-[18px] w-[18px] text-teal-500" />
            健康一览
          </h3>
          <Link
            href="/health"
            className="text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors flex items-center gap-0.5"
          >
            查看详情 <ChevronRight className="w-[14px] h-[14px]" />
          </Link>
        </div>

        {currentPet ? (
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[90px] flex-1 rounded-[16px] bg-[linear-gradient(145deg,rgba(29,138,128,0.08),rgba(255,255,255,0.86))] px-3 py-3 text-center">
              <Activity className="mx-auto mb-1 h-4 w-4 text-teal-500" />
              <div className="text-[11px] text-ink-faded">体重</div>
              {healthLoading ? (
                <span className="text-[13px] text-ink-faded">加载中</span>
              ) : healthData?.weight != null ? (
                <span className="text-[15px] font-medium text-ink">{healthData.weight} kg</span>
              ) : (
                <span className="text-[12px] text-ink-faded">未记录</span>
              )}
            </div>

            <div className="min-w-[90px] flex-1 rounded-[16px] bg-[linear-gradient(145deg,rgba(122,174,198,0.10),rgba(255,255,255,0.86))] px-3 py-3 text-center">
              <CalendarDays className="mx-auto mb-1 h-4 w-4 text-sea-500" />
              <div className="text-[11px] text-ink-faded">下次提醒</div>
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

            <div className="min-w-[90px] flex-1 rounded-[16px] bg-[linear-gradient(145deg,rgba(106,168,110,0.10),rgba(255,255,255,0.86))] px-3 py-3 text-center">
              <Syringe className="mx-auto mb-1 h-4 w-4 text-sage-500" />
              <div className="text-[11px] text-ink-faded">疫苗/驱虫</div>
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
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Users className="h-4 w-4 text-teal-500" />
            好友动态
          </h3>
          <Link
            href="/nearby"
            className="text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors flex items-center gap-0.5"
          >
            去认识更多 <ChevronRight className="w-[14px] h-[14px]" />
          </Link>
        </div>

        {statsLoading ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-[40px] h-[40px] bg-surface-alt rounded-full animate-pulse ring-2 ring-teal-100" />
                <div className="w-10 h-2.5 bg-surface-alt rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : friends.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
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
                  size="lg"
                  className="w-[40px] h-[40px] flex-shrink-0 ring-2 ring-teal-100"
                />
                <span className="text-[10px] text-ink-muted truncate w-full text-center leading-tight max-w-[48px]">
                  {friend.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-teal-200/80 bg-white/60 p-4 backdrop-blur-xl">
            <EmptyState
              icon={<ShieldCheck className="h-9 w-9 text-teal-500/70" />}
              title="还没有好友"
              description="去认识附近的小伙伴吧"
              action={
                <Link href="/nearby">
                  <Button size="sm" variant="outline">去看看</Button>
                </Link>
              }
              className="py-2"
            />
          </div>
        )}
      </div>

      {/* ===== Recent Posts teaser ===== */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[16px] font-semibold text-ink">动态现场</h3>
        <span className="text-[12px] text-ink-faded">照片、约玩与小日常</span>
      </div>
    </div>
  );
}
