'use client';

import { PostCard } from './PostCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PawPrint } from 'lucide-react';

interface PostAuthor {
  id: number;
  name: string;
  breed?: string | null;
  avatar?: string | null;
  type: string;
}

interface PostImage {
  id: number;
  url: string;
  order: number;
}

interface Post {
  id: number;
  content: string;
  mediaType: string;
  fuzzyLocation?: string | null;
  createdAt: string;
  author: PostAuthor;
  images: PostImage[];
  _count: { likes: number; comments: number };
}

interface PostListProps {
  posts: Post[];
  loading?: boolean;
  currentPetId?: number;
  onLike?: (postId: number) => void;
}

export function PostList({ posts, loading, currentPetId, onLike }: PostListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-white rounded-[10px] shadow-card overflow-hidden animate-pulse">
            {/* Skeleton header */}
            <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
              <div className="w-[36px] h-[36px] bg-surface-alt rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-surface-alt rounded w-20" />
                <div className="h-3 bg-surface-alt rounded w-14" />
              </div>
            </div>
            {/* Skeleton body */}
            <div className="px-4 pb-1 space-y-2">
              <div className="h-4 bg-surface-alt rounded w-full" />
              <div className="h-4 bg-surface-alt rounded w-3/4" />
              <div className="h-4 bg-surface-alt rounded w-1/2" />
            </div>
            {/* Skeleton action bar */}
            <div className="flex items-center gap-4 border-t border-border-light px-4 py-3 mt-2">
              <div className="h-4 bg-surface-alt rounded w-12" />
              <div className="h-4 bg-surface-alt rounded w-12" />
              <div className="h-4 bg-surface-alt rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={<PawPrint className="w-10 h-10 text-teal-500/40" />}
        title="还没有动态"
        description="这里还没有动态，去看看推荐内容"
      />
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentPetId={currentPetId}
          onLike={onLike}
        />
      ))}
    </div>
  );
}
