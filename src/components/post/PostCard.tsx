'use client';

import { Avatar } from '@/components/ui';
import { ReportButton } from '@/components/social/ReportButton';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';
import Link from 'next/link';

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

interface PostCardProps {
  post: Post;
  currentPetId?: number;
  liked?: boolean;
  onLike?: (postId: number) => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return '刚刚';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}个月前`;
  return `${Math.floor(diffMonth / 12)}年前`;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Simple share - could be enhanced with Web Share API
    if (navigator.share) {
      navigator.share({
        title: `${post.author.name}的分享`,
        text: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
      }).catch(() => {});
    } else {
      alert('已复制链接');
      navigator.clipboard?.writeText(`${window.location.origin}/posts/${post.id}`).catch(() => {});
    }
  };

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
        {/* Author header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={post.author.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {post.author.name}
            </div>
            <div className="text-xs text-gray-400">
              {post.author.breed || post.author.type} · {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-hide">
            {post.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="w-40 h-40 object-cover rounded-xl flex-shrink-0"
                onClick={(e) => e.preventDefault()}
              />
            ))}
          </div>
        )}

        {/* Location badge */}
        {post.fuzzyLocation && (
          <div className="flex items-center gap-1 text-xs text-brand-500 mb-3">
            <MapPin className="w-3 h-3" />
            <span>{post.fuzzyLocation}</span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-6 pt-2 border-t border-gray-50">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">{post._count.likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-gray-400">
            <MessageCircle className="w-4 h-4" aria-label="私信" />
            <span className="text-xs">{post._count.comments}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-500 transition-colors"
          >
            <Share2 className="w-4 h-4" aria-label="分享" />
            <span className="text-xs">分享</span>
          </button>
          <ReportButton targetType="POST" targetId={post.id} />
        </div>
      </div>
    </Link>
  );
}
