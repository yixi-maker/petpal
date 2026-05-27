'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button } from '@/components/ui';
import { FollowButton } from '@/components/social/FollowButton';
import { FriendRequestModal } from '@/components/social/FriendRequestModal';
import { ReportButton } from '@/components/social/ReportButton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PetProfile {
  id: number;
  name: string;
  type: string;
  breed?: string;
  birthday?: string;
  gender: string;
  size: string;
  personalityTags: string[];
  bio?: string;
  avatar?: string;
  followerCount: number;
  followingCount: number;
  friendCount: number;
  userId: number;
}

export default function PetProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [frOpen, setFrOpen] = useState(false);
  const { currentPet, pets, switchPet } = usePet();

  useEffect(() => {
    fetch(`/api/pets/${id}`)
      .then(r => r.json())
      .then(data => { setPet(data.pet); setLoading(false); });
  }, [id]);

  // Check follow status
  useEffect(() => {
    if (pet && currentPet) {
      fetch(`/api/social/follow?petId=${currentPet.id}&type=following`)
        .then(r => r.json())
        .then(data => {
          if (data.list?.some((f: { id: number }) => f.id === pet.id)) {
            setFollowing(true);
          }
        })
        .catch(() => {});
    }
  }, [pet, currentPet]);

  if (loading) {
    return <div className="p-4 text-center text-gray-400 py-20">加载中...</div>;
  }

  if (!pet) {
    return <div className="p-4 text-center text-gray-400 py-20">宠物不存在</div>;
  }

  const isMine = pets.some((p) => p.id === pet.id);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/me"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-semibold">{pet.name} 的主页</h1>
      </div>

      <div className="text-center mb-6">
        <Avatar src={pet.avatar} size="xl" className="mx-auto mb-3" />
        <h2 className="text-xl font-bold">{pet.name}</h2>
        <p className="text-sm text-gray-400">
          {pet.type === 'DOG' ? '🐶' : '🐱'} {pet.breed || '未知品种'} · {pet.gender === 'MALE' ? '♂' : pet.gender === 'FEMALE' ? '♀' : ''} {pet.size === 'SMALL' ? '小型' : pet.size === 'MEDIUM' ? '中型' : '大型'}
        </p>
        {pet.personalityTags.length > 0 && (
          <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
            {pet.personalityTags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {pet.bio && <p className="text-sm text-gray-500 text-center mb-4">{pet.bio}</p>}

      <div className="flex justify-center gap-8 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold">{pet.followerCount}</div>
          <div className="text-xs text-gray-400">关注者</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{pet.followingCount}</div>
          <div className="text-xs text-gray-400">关注中</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{pet.friendCount}</div>
          <div className="text-xs text-gray-400">好友</div>
        </div>
      </div>

      <div className="flex gap-2">
        {isMine ? (
          <Button variant="outline" className="flex-1" onClick={() => switchPet(pet.id)}>
            {currentPet?.id === pet.id ? '✓ 当前选中' : '切换身份'}
          </Button>
        ) : (
          <>
            <FollowButton
              petId={pet.id}
              initialFollowing={following}
              onToggle={(v) => setFollowing(v)}
              className="flex-1 py-2.5 text-sm"
            />
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setFrOpen(true)}
              disabled={!currentPet}
            >
              打招呼
            </Button>
          </>
        )}
      </div>

      <FriendRequestModal
        open={frOpen}
        onClose={() => setFrOpen(false)}
        fromPetId={currentPet?.id || 0}
        toPetId={pet.id}
        toPetName={pet.name}
      />

      {/* Report button for non-own pets */}
      {!isMine && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <ReportButton
            targetType="PET"
            targetId={pet.id}
            variant="text"
            className="text-red-400 hover:text-red-600"
          />
        </div>
      )}
    </div>
  );
}
