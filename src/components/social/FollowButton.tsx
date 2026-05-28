'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface FollowButtonProps {
  petId: number;
  initialFollowing: boolean;
  onToggle?: (following: boolean) => void;
  className?: string;
}

export function FollowButton({ petId, initialFollowing, onToggle, className = '' }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerPetId: getCurrentPetId(), followingPetId: petId }),
      });

      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        onToggle?.(data.following);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition ${
        following
          ? 'bg-teal-50 text-teal-500 border border-teal-200'
          : 'bg-teal-500 text-white border border-teal-500'
      } ${className}`}
    >
      <Heart className="w-3 h-3" fill={following ? 'currentColor' : 'none'} />
      {following ? '已关注' : '关注'}
    </button>
  );
}

// Helper to get current pet ID from localStorage - used by FollowButton
function getCurrentPetId(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem('currentPetId') || 0);
}
