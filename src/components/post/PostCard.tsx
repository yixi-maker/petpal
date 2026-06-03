'use client';

import { useRouter } from 'next/navigation';
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

export function PostCard({ post, liked, onLike }: PostCardProps) {
  const router = useRouter();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${post.author.name}的分享`,
        text: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${window.location.origin}/posts/${post.id}`).catch(() => {});
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/pets/${post.author.id}`);
  };

  return (
    <Link href={`/posts/${post.id}`} className="block mb-3">
      <div className="bg-surface-white rounded-[10px] shadow-card overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            onClick={handleAuthorClick}
          >
            <Avatar src={post.author.avatar} size="md" petType={post.author.type as 'DOG' | 'CAT'} />
            <div className="min-w-0">
              <div className="text-[14px] font-medium text-ink truncate">
                {post.author.name}
              </div>
              <div className="text-[12px] text-ink-muted truncate">
                {post.author.breed || post.author.type}
              </div>
            </div>
          </div>
          <span className="text-[12px] text-ink-faded flex-shrink-0 ml-2">
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Card body */}
        <div className="px-4 pb-1">
          <p className="text-[15px] text-ink leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-4 mb-3 scrollbar-hide">
            {post.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="h-[220px] w-auto rounded-[8px] object-cover flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Location badge */}
        {post.fuzzyLocation && (
          <div className="flex items-center gap-1 px-4 mb-2">
            <MapPin className="w-3 h-3 text-ink-faded" />
            <span className="text-[12px] text-ink-faded">{post.fuzzyLocation}</span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center border-t border-border-light px-2 py-1.5">
          <button
            type="button"
            onClick={handleLike}
            className="flex items-center gap-1.5 px-3 py-2 text-ink-faded hover:text-amber-500 transition-colors"
            aria-label="点赞"
          >
            <Heart
              className={`w-[18px] h-[18px] ${liked ? 'fill-amber-500 text-amber-500' : ''}`}
            />
            <span className="text-[13px]">{post._count.likes}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 text-ink-faded hover:text-ink-muted transition-colors"
            aria-label="评论"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            <span className="text-[13px]">{post._count.comments}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-ink-faded hover:text-ink-muted transition-colors"
            aria-label="分享"
          >
            <Share2 className="w-[18px] h-[18px]" />
          </button>
          <div className="ml-auto">
            <ReportButton
              targetType="POST"
              targetId={post.id}
              className="text-ink-faded/30 hover:text-rose-500"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
