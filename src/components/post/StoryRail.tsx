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
    <div className="px-4 pb-4 pt-1">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[12px] text-ink-faded tracking-[0.02em] uppercase font-medium">
          今天的故事
        </h3>
        <span className="text-[10px] text-ink-faded">轻轻打招呼</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {currentPet && (
          <Link
            href={`/pets/${currentPet.id}`}
            className="flex w-[76px] flex-shrink-0 flex-col items-center rounded-[20px] border border-teal-100/80 bg-white/70 p-2.5 text-center shadow-[0_10px_24px_rgba(16,80,75,0.10)] backdrop-blur-xl"
          >
            <div className="h-[56px] w-[56px] rounded-full bg-gradient-to-br from-teal-400 to-sea-500 p-[2px]">
              <Avatar
                src={currentPet.avatar}
                petType={petTypeFromString(currentPet.type)}
                size="lg"
                className="h-full w-full border-[3px] border-white"
              />
            </div>
            <span className="mt-1.5 truncate max-w-[56px] text-[10px] font-semibold text-teal-600">
              你的主页
            </span>
          </Link>
        )}

        {friends.map((friend) => (
          <Link
            key={friend.id}
            href={`/pets/${friend.id}`}
            className="flex w-[76px] flex-shrink-0 flex-col items-center rounded-[20px] border border-white/70 bg-white/60 p-2.5 text-center shadow-[0_8px_20px_rgba(16,80,75,0.08)] backdrop-blur-xl"
          >
            <Avatar
              src={friend.avatar}
              petType={petTypeFromString(friend.type)}
              size="lg"
              className="h-[52px] w-[52px] ring-[2.5px] ring-sea-500"
            />
            <span className="mt-1.5 truncate max-w-[56px] text-[10px] text-ink-muted font-medium">
              {friend.name}
            </span>
          </Link>
        ))}

        {recommended.map((rec) => (
          <Link
            key={rec.id}
            href={`/pets/${rec.id}`}
            className="flex w-[76px] flex-shrink-0 flex-col items-center rounded-[20px] border border-white/60 bg-white/50 p-2.5 text-center backdrop-blur-xl"
          >
            <Avatar
              src={rec.avatar}
              petType={petTypeFromString(rec.type)}
              size="lg"
              className="h-[52px] w-[52px] ring-[2.5px] ring-teal-200"
            />
            <span className="mt-1.5 truncate max-w-[56px] text-[10px] text-ink-faded">
              {rec.name}
            </span>
          </Link>
        ))}

        {!hasFriends && currentPet && (
          <Link
            href="/nearby"
            className="flex w-[82px] flex-shrink-0 flex-col items-center justify-center rounded-[20px] border border-dashed border-teal-200 bg-white/50 p-2.5 text-center backdrop-blur-xl"
          >
            <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full bg-teal-50 text-teal-500">
              <Plus className="h-5 w-5" />
            </div>
            <span className="mt-1.5 truncate max-w-[70px] text-[10px] font-medium text-teal-500">
              + 发现更多
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
