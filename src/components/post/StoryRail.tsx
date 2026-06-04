'use client';

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

function petTypeFromString(t: string): 'DOG' | 'CAT' | undefined {
  if (t === 'DOG' || t === 'CAT') return t as 'DOG' | 'CAT';
  return undefined;
}

export function StoryRail({ currentPet, friends, recommended }: StoryRailProps) {
  const hasFriends = friends.length > 0;

  return (
    <div className="px-4 pt-2 pb-4">
      <div className="flex gap-4 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden">
        {currentPet && (
          <Link
            href={`/pets/${currentPet.id}`}
            className="flex w-[66px] flex-shrink-0 flex-col items-center text-center"
          >
            <div className="relative h-[58px] w-[58px] rounded-full bg-[conic-gradient(from_160deg,#6EC4BD,#7AAEC6,#F0E6CE,#6EC4BD)] p-[2px] shadow-[0_10px_20px_rgba(16,80,75,0.13)]">
              <Avatar
                src={currentPet.avatar}
                petType={petTypeFromString(currentPet.type)}
                size="lg"
                className="h-full w-full border-[3px] border-white"
              />
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-sm">
                <Plus className="h-3 w-3" />
              </span>
            </div>
            <span className="mt-2 max-w-[60px] truncate text-[10px] font-semibold text-teal-700 leading-tight">
              你的故事
            </span>
          </Link>
        )}

        {friends.map((friend) => (
          <Link
            key={friend.id}
            href={`/pets/${friend.id}`}
            className="flex w-[66px] flex-shrink-0 flex-col items-center text-center"
          >
            <div className="h-[58px] w-[58px] rounded-full bg-[conic-gradient(from_180deg,#1D8A80,#7AAEC6,#D4EDEB,#1D8A80)] p-[2px] shadow-[0_9px_18px_rgba(16,80,75,0.10)]">
              <Avatar
                src={friend.avatar}
                petType={petTypeFromString(friend.type)}
                size="lg"
                className="h-full w-full border-[3px] border-white"
              />
            </div>
            <span className="mt-2 max-w-[60px] truncate text-[10px] font-medium text-ink-muted leading-tight">
              {friend.name}
            </span>
          </Link>
        ))}

        {recommended.map((rec) => (
          <Link
            key={rec.id}
            href={`/pets/${rec.id}`}
            className="flex w-[66px] flex-shrink-0 flex-col items-center text-center"
          >
            <div className="h-[58px] w-[58px] rounded-full bg-white/75 p-[3px] shadow-[0_7px_16px_rgba(16,80,75,0.08)] backdrop-blur-xl">
              <Avatar
                src={rec.avatar}
                petType={petTypeFromString(rec.type)}
                size="lg"
                className="h-full w-full border-[2px] border-white"
              />
            </div>
            <span className="mt-2 max-w-[60px] truncate text-[10px] text-ink-faded leading-tight">
              {rec.name}
            </span>
          </Link>
        ))}

        {!hasFriends && currentPet && (
          <Link
            href="/nearby"
            className="flex w-[70px] flex-shrink-0 flex-col items-center justify-center text-center"
          >
            <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full border border-dashed border-teal-200 bg-white/60 text-teal-500 shadow-[0_8px_18px_rgba(16,80,75,0.08)] backdrop-blur-xl">
              <Plus className="h-5 w-5" />
            </div>
            <span className="mt-2 max-w-[70px] truncate text-[10px] font-medium text-teal-600 leading-tight">
              发现更多
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
