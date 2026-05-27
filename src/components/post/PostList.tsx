'use client';

import { PostCard } from './PostCard';
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
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded w-20 mb-1" />
                <div className="h-3 bg-gray-50 rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-gray-50 rounded w-full mb-2" />
            <div className="h-4 bg-gray-50 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
          <PawPrint className="w-8 h-8 text-brand-300" />
        </div>
        <p className="text-gray-400 text-sm">暂无动态</p>
        <p className="text-gray-300 text-xs mt-1">发布第一条动态吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
