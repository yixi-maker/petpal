'use client';

import { Avatar, Badge, Button } from '@/components/ui';
import { FollowButton } from '@/components/social/FollowButton';

interface PetProfileCardProps {
  pet: {
    id: number;
    name: string;
    type: string;
    breed?: string | null;
    avatar?: string | null;
    personalityTags?: string[];
    size?: string;
    gender?: string;
    bio?: string;
  };
  stats: { followerCount: number; followingCount: number; friendCount: number };
  isOwn?: boolean;
  initialFollowing?: boolean;
  onFollowToggle?: (following: boolean) => void;
  onGreet?: () => void;
  onSwitchPet?: () => void;
}

const SIZE_LABEL: Record<string, string> = {
  SMALL: '小型',
  MEDIUM: '中型',
  LARGE: '大型',
};

const GENDER_LABEL: Record<string, string> = {
  MALE: '♂',
  FEMALE: '♀',
};

const TYPE_LABEL: Record<string, string> = {
  DOG: '狗狗',
  CAT: '猫咪',
};

function resolveTags(tags: string[] | string | undefined | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
}

export function PetProfileCard({
  pet,
  stats,
  isOwn,
  initialFollowing = false,
  onFollowToggle,
  onGreet,
  onSwitchPet,
}: PetProfileCardProps) {
  const petType = (pet.type === 'DOG' || pet.type === 'CAT') ? pet.type : undefined;
  const tags = resolveTags(pet.personalityTags);

  const sizeDetail = pet.size ? SIZE_LABEL[pet.size] || pet.size : '';
  const genderSymbol = pet.gender ? GENDER_LABEL[pet.gender] || '' : '';

  return (
    <div className="bg-gradient-to-br from-teal-50/30 via-surface-white to-sea-50/20 rounded-[16px] shadow-sm p-5">
      {/* Top: Avatar + Name + Type/Breed */}
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={pet.avatar}
          size="xl"
          petType={petType}
          className="mx-auto mb-3"
        />
        <h2 className="text-[20px] font-bold text-ink">{pet.name}</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
          <Badge variant="teal" size="md">
            {TYPE_LABEL[pet.type] || pet.type}
          </Badge>
          {pet.breed && (
            <Badge variant="teal" size="md">
              {pet.breed}
            </Badge>
          )}
          {sizeDetail && (
            <Badge variant="default" size="md">{sizeDetail}</Badge>
          )}
          {genderSymbol && (
            <Badge variant="default" size="md">{genderSymbol}</Badge>
          )}
        </div>

        {/* Personality tags row */}
        {tags.length > 0 && (
          <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
            {tags.map((tag) => (
              <Badge key={tag} variant="teal" size="sm">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-8 mt-5 pt-4 border-t border-border-light">
        <div className="text-center">
          <div className="text-lg font-bold text-ink">{stats.followerCount}</div>
          <div className="text-xs text-ink-faded">关注者</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-ink">{stats.followingCount}</div>
          <div className="text-xs text-ink-faded">关注中</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-ink">{stats.friendCount}</div>
          <div className="text-xs text-ink-faded">好友</div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex gap-2 mt-4">
        {isOwn ? (
          <Button
            variant="outline"
            className="flex-1"
            onClick={onSwitchPet}
          >
            切换到此身份
          </Button>
        ) : (
          <>
            <FollowButton
              petId={pet.id}
              initialFollowing={initialFollowing}
              onToggle={onFollowToggle}
              className="flex-1 py-2.5 text-sm"
            />
            <Button
              className="flex-1"
              variant="primary"
              onClick={onGreet}
            >
              打招呼
            </Button>
          </>
        )}
      </div>

      {/* Bio section */}
      {pet.bio && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <p className="text-[14px] text-ink-muted italic text-center">
            {pet.bio}
          </p>
        </div>
      )}
    </div>
  );
}
