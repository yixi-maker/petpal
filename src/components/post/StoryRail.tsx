'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui';

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
    <div className="px-4 pt-2 pb-3">
      <h3 className="text-[13px] font-medium text-ink-muted mb-2">今天的故事</h3>

      <div className="flex gap-3 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
        {/* Current pet story — highlighted ring */}
        {currentPet && (
          <Link
            href={`/pets/${currentPet.id}`}
            className="flex flex-col items-center flex-shrink-0 w-[62px] text-center"
          >
            <div className="w-[52px] h-[52px] rounded-full p-[3px] bg-gradient-to-br from-teal-400 to-sea-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-alt ring-[3px] ring-teal-500 ring-offset-2 ring-offset-surface">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-teal-50 to-sea-50">
                  <Avatar
                    src={currentPet.avatar}
                    petType={petTypeFromString(currentPet.type)}
                    size="md"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
            <span className="text-[11px] text-teal-500 font-medium truncate mt-1 max-w-[56px]">
              你
            </span>
          </Link>
        )}

        {/* Friend stories */}
        {friends.map((friend) => (
          <Link
            key={friend.id}
            href={`/pets/${friend.id}`}
            className="flex flex-col items-center flex-shrink-0 w-[62px] text-center"
          >
            <div className="w-[52px] h-[52px] rounded-full p-[3px] ring-[2.5px] ring-sea-500 ring-offset-1 ring-offset-surface">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-alt">
                <Avatar
                  src={friend.avatar}
                  petType={petTypeFromString(friend.type)}
                  size="md"
                  className="w-full h-full"
                />
              </div>
            </div>
            <span className="text-[10px] text-ink-muted truncate mt-1 max-w-[56px]">
              {friend.name}
            </span>
          </Link>
        ))}

        {/* Recommended stories */}
        {recommended.map((rec) => (
          <Link
            key={rec.id}
            href={`/pets/${rec.id}`}
            className="flex flex-col items-center flex-shrink-0 w-[62px] text-center"
          >
            <div className="w-[52px] h-[52px] rounded-full p-[3px] ring-[2px] ring-ink-faded/30">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-alt">
                <Avatar
                  src={rec.avatar}
                  petType={petTypeFromString(rec.type)}
                  size="md"
                  className="w-full h-full"
                />
              </div>
            </div>
            <span className="text-[10px] text-ink-faded truncate mt-1 max-w-[56px]">
              {rec.name}
            </span>
          </Link>
        ))}

        {/* If no friends beyond current pet, show "find more" CTA */}
        {!hasFriends && currentPet && (
          <Link
            href="/nearby"
            className="flex flex-col items-center flex-shrink-0 w-[62px] text-center"
          >
            <div className="w-[52px] h-[52px] rounded-full border-2 border-dashed border-ink-faded/30 flex items-center justify-center bg-surface-alt/50">
              <span className="text-[20px] text-ink-faded/40">+</span>
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
