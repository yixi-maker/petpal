'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePet } from '@/contexts/PetContext';
import { IcebreakerModal } from '@/components/social/IcebreakerModal';
import { ReportButton } from '@/components/social/ReportButton';
import { PetProfileCard } from '@/components/pet/PetProfileCard';
import { ArrowLeft, Shield } from 'lucide-react';
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
    return <div className="p-4 text-center text-ink-faded py-20">加载中...</div>;
  }

  if (!pet) {
    return <div className="p-4 text-center text-ink-faded py-20">宠物不存在</div>;
  }

  const isMine = pets.some((p) => p.id === pet.id);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/me"><ArrowLeft className="w-5 h-5" aria-label="返回" /></Link>
        <h1 className="text-lg font-semibold">{pet.name} 的主页</h1>
      </div>

      <PetProfileCard
        pet={pet}
        stats={{
          followerCount: pet.followerCount,
          followingCount: pet.followingCount,
          friendCount: pet.friendCount,
        }}
        isOwn={isMine}
        initialFollowing={following}
        onFollowToggle={(v) => setFollowing(v)}
        onGreet={() => setFrOpen(true)}
        onSwitchPet={() => switchPet(pet.id)}
      />

      {/* Safety hint */}
      <p className="text-[11px] text-ink-faded/60 flex items-center gap-1 mt-2">
        <Shield className="w-3 h-3" />
        对方仅能看到宠物的公开信息
      </p>

      <IcebreakerModal
        open={frOpen}
        onClose={() => setFrOpen(false)}
        fromPetId={currentPet?.id || 0}
        toPetId={pet.id}
        toPetName={pet.name}
      />

      {/* Report button for non-own pets */}
      {!isMine && (
        <div className="mt-6 pt-4 border-t border-border-light">
          <ReportButton
            targetType="PET"
            targetId={pet.id}
            variant="text"
            className="text-rose-400 hover:text-rose-600"
          />
        </div>
      )}
    </div>
  );
}
