'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { Plus } from 'lucide-react';

interface StoryPet {
  id: number;
  name: string;
  avatar?: string | null;
  type: string;
}

interface StoryRailProps {
  currentPet: StoryPet | null;
  friends: StoryPet[];
  recommended: StoryPet[];
}

function StoryRing({
  pet,
  ringColor,
  label,
  onClick,
}: {
  pet: StoryPet;
  ringColor: string;
  label: string;
  onClick?: () => void;
}) {
  const petType = (pet.type === 'DOG' || pet.type === 'CAT')
    ? (pet.type as 'DOG' | 'CAT')
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center flex-shrink-0 w-[62px] text-center"
    >
      <div className={`w-[52px] h-[52px] rounded-full p-[3px] ${ringColor}`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-surface-alt">
          <Avatar
            src={pet.avatar}
            petType={petType}
            size="md"
            className="w-full h-full"
          />
        </div>
      </div>
      <span className="text-[10px] text-ink-muted truncate mt-1 max-w-[62px]">
        {label}
      </span>
    </button>
  );
}

export function StoryRail({ currentPet, friends, recommended }: StoryRailProps) {
  const router = useRouter();

  const hasStories = friends.length > 0 || recommended.length > 0;

  return (
    <div className="px-4 mb-4">
      <h3 className="text-[13px] font-medium text-ink-muted mb-2">今天的故事</h3>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {/* Current pet story */}
        {currentPet && (
          <StoryRing
            pet={currentPet}
            ringColor="ring-2 ring-teal-500"
            label="你"
            onClick={() => router.push(`/pets/${currentPet.id}`)}
          />
        )}

        {/* Friend stories */}
        {friends.map((friend) => (
          <StoryRing
            key={friend.id}
            pet={friend}
            ringColor="ring-2 ring-sea-500"
            label={friend.name}
            onClick={() => router.push(`/pets/${friend.id}`)}
          />
        ))}

        {/* Recommended stories */}
        {recommended.map((rec) => (
          <StoryRing
            key={rec.id}
            pet={rec}
            ringColor="ring-2 ring-ink-faded/40"
            label={rec.name}
            onClick={() => router.push(`/pets/${rec.id}`)}
          />
        ))}

        {/* If no stories beyond current pet, show a "find more" CTA */}
        {!hasStories && currentPet && (
          <Link
            href="/nearby"
            className="flex flex-col items-center flex-shrink-0 w-[62px] text-center"
          >
            <div className="w-[52px] h-[52px] rounded-full border-2 border-dashed border-ink-faded/30 flex items-center justify-center bg-surface-alt/50">
              <Plus className="w-[18px] h-[18px] text-ink-faded/40" />
            </div>
            <span className="text-[10px] text-teal-500 truncate mt-1 max-w-[62px]">
              去看看推荐
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
