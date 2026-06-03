'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui';
import { ReportButton } from '@/components/social/ReportButton';
import { GreetingButton } from '@/components/social/GreetingButton';
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

function AuthorInfo({
  author,
  timeAgoStr,
  showGreeting,
  currentPetId,
  onAuthorClick,
}: {
  author: PostAuthor;
  timeAgoStr: string;
  showGreeting: boolean;
  currentPetId?: number;
  onAuthorClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
      onClick={onAuthorClick}
    >
      <Avatar
        src={author.avatar}
        size="md"
        petType={author.type as 'DOG' | 'CAT'}
      />
      <div className="min-w-0">
        <div className="text-[14px] font-medium text-ink truncate">
          {author.name}
        </div>
        <div className="text-[12px] text-ink-muted truncate flex items-center gap-1.5">
          <span>{author.breed || author.type}</span>
          <span className="text-ink-faded">·</span>
          <span className="text-ink-faded">{timeAgoStr}</span>
          {showGreeting && currentPetId && (
            <GreetingButton
              fromPetId={currentPetId}
              toPetId={author.id}
              toPetName={author.name}
              className="ml-0.5 flex-shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBar({
  liked,
  likesCount,
  commentsCount,
  onLike,
  onShare,
  postId,
}: {
  liked?: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  postId: number;
}) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onLike}
          className="flex items-center gap-1.5 p-2 min-w-[44px] text-ink-faded hover:text-amber-500 transition-colors"
          aria-label="点赞"
        >
          <Heart
            className={`w-5 h-5 ${liked ? 'fill-amber-500 text-amber-500' : ''}`}
          />
          <span className="text-[13px]">{likesCount}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 p-2 min-w-[44px] text-ink-faded hover:text-ink-muted transition-colors"
          aria-label="评论"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[13px]">{commentsCount}</span>
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 p-2 min-w-[44px] text-ink-faded hover:text-ink-muted transition-colors"
          aria-label="分享"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      <div>
        <ReportButton
          targetType="POST"
          targetId={postId}
          className="text-ink-faded/30 hover:text-rose-500"
        />
      </div>
    </div>
  );
}

export function PostCard({ post, currentPetId, liked, onLike }: PostCardProps) {
  const router = useRouter();
  const hasImages = post.images && post.images.length > 0;
  const sortedImages = hasImages
    ? [...post.images].sort((a, b) => a.order - b.order)
    : [];
  const timeAgoStr = timeAgo(post.createdAt);
  const showGreeting = !!currentPetId && post.author.id !== currentPetId;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: `${post.author.name}的分享`,
          text: post.content,
          url: `${window.location.origin}/posts/${post.id}`,
        })
        .catch(() => {});
    } else {
      navigator.clipboard
        ?.writeText(`${window.location.origin}/posts/${post.id}`)
        .catch(() => {});
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/pets/${post.author.id}`);
  };

  return (
    <Link href={`/posts/${post.id}`} className="block mb-4">
      {hasImages ? (
        /* ===== With Images variant ===== */
        <div className="rounded-[12px] overflow-hidden shadow-sm">
          {/* Image carousel */}
          <div className="relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
              {sortedImages.map((img) => (
                <div
                  key={img.id}
                  className="flex-shrink-0 w-full snap-center"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="aspect-[4/5] w-full object-cover rounded-[12px]"
                  />
                </div>
              ))}
            </div>

            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-ink/60 to-transparent rounded-b-[12px] pointer-events-none" />

            {/* Location badge */}
            {post.fuzzyLocation && (
              <div className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm text-white/90 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-white/70" />
                <span>{post.fuzzyLocation}</span>
              </div>
            )}

            {/* Author info on overlay */}
            <div className="absolute bottom-3 left-3 right-12">
              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                onClick={handleAuthorClick}
              >
                {/* Avatar 28px */}
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt=""
                    className="w-[28px] h-[28px] rounded-full object-cover border border-white/30 flex-shrink-0"
                  />
                ) : (
                  <div className="w-[28px] h-[28px] rounded-full bg-white/15 border border-white/30 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-white/90 truncate">
                    {post.author.name}
                  </div>
                  <div className="text-[11px] text-white/70 truncate flex items-center gap-1">
                    <span>{post.author.breed || post.author.type}</span>
                    <span>·</span>
                    <span>{timeAgoStr}</span>
                    {showGreeting && currentPetId && (
                      <GreetingButton
                        fromPetId={currentPetId}
                        toPetId={post.author.id}
                        toPetName={post.author.name}
                        className="ml-0.5 flex-shrink-0 text-white/80 hover:text-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action bar */}
          <ActionBar
            liked={liked}
            likesCount={post._count.likes}
            commentsCount={post._count.comments}
            onLike={handleLike}
            onShare={handleShare}
            postId={post.id}
          />

          {/* Content text */}
          {post.content && (
            <p className="text-[15px] text-ink leading-relaxed px-1 pb-2 whitespace-pre-wrap">
              {post.content}
            </p>
          )}
        </div>
      ) : (
        /* ===== Without Images variant ===== */
        <div className="bg-gradient-to-br from-sea-50/30 via-surface-white to-sage-50/20 rounded-[12px] shadow-sm overflow-hidden">
          {/* Author row */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <AuthorInfo
              author={post.author}
              timeAgoStr={timeAgoStr}
              showGreeting={showGreeting}
              currentPetId={currentPetId}
              onAuthorClick={handleAuthorClick}
            />
          </div>

          {/* Content */}
          <div className="px-4 py-3">
            <p className="text-[16px] text-ink leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Location badge */}
          {post.fuzzyLocation && (
            <div className="flex items-center gap-1 px-4 pb-1">
              <MapPin className="w-3 h-3 text-ink-faded" />
              <span className="text-[12px] text-ink-faded">{post.fuzzyLocation}</span>
            </div>
          )}

          {/* Action bar */}
          <ActionBar
            liked={liked}
            likesCount={post._count.likes}
            commentsCount={post._count.comments}
            onLike={handleLike}
            onShare={handleShare}
            postId={post.id}
          />
        </div>
      )}
    </Link>
  );
}
