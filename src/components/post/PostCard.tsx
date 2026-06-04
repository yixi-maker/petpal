'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui';
import { ReportButton } from '@/components/social/ReportButton';
import { GreetingButton } from '@/components/social/GreetingButton';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';

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
        <div className="text-[14px] font-medium text-ink truncate max-w-[200px]">
          {author.name}
        </div>
        <div className="text-[12px] text-ink-muted truncate flex items-center gap-1.5">
          <span className="truncate">{author.breed || author.type}</span>
          <span className="text-ink-faded flex-shrink-0">·</span>
          <span className="text-ink-faded flex-shrink-0">{timeAgoStr}</span>
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
  onComment,
  onShare,
  postId,
  variant = 'light',
}: {
  liked?: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: (e: React.MouseEvent) => void;
  onComment: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  postId: number;
  variant?: 'light' | 'dark';
}) {
  const buttonClass = variant === 'dark'
    ? 'text-white/80 hover:text-white'
    : 'text-ink-faded hover:text-ink-muted';

  const shareAvailable = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className={`flex items-center justify-between ${variant === 'dark' ? 'px-0 py-0' : 'px-0 py-2'}`}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={onLike}
          className={`flex min-w-[44px] items-center gap-1.5 p-2 transition-colors ${buttonClass} ${liked ? 'text-amber-400' : 'hover:text-amber-500'}`}
          aria-label="点赞"
        >
          <span className="text-[13px]">{likesCount}</span>
          <Heart
            className={`h-5 w-5 ${liked ? 'fill-amber-400 text-amber-400' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={onComment}
          className={`flex min-w-[44px] items-center gap-1.5 p-2 transition-colors ${buttonClass}`}
          aria-label="评论"
        >
          <span className="text-[13px]">{commentsCount}</span>
          <MessageCircle className="h-5 w-5" />
        </button>
        {shareAvailable && (
          <button
            type="button"
            onClick={onShare}
            className={`flex min-w-[44px] items-center gap-1.5 p-2 transition-colors ${buttonClass}`}
            aria-label="分享"
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
      </div>
      <div>
        <ReportButton
          targetType="POST"
          targetId={postId}
          className={variant === 'dark' ? 'text-white/40 hover:text-rose-100' : 'text-ink-faded/30 hover:text-rose-500'}
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      if (idx !== activeImageIdx) {
        setActiveImageIdx(idx);
      }
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(post.id);
  };

  const handleOpenPost = () => {
    router.push(`/posts/${post.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenPost();
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/posts/${post.id}`);
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
    <article
      role="link"
      tabIndex={0}
      onClick={handleOpenPost}
      onKeyDown={handleKeyDown}
      className="block mb-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-[12px]"
    >
      {hasImages ? (
        /* ===== Immersive image story ===== */
        <div className="relative overflow-hidden rounded-[28px] bg-ink shadow-[0_22px_48px_rgba(16,80,75,0.18)]">
          <div className="relative aspect-[4/5]">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            >
              {sortedImages.map((img) => (
                <div key={img.id} className="h-full w-full flex-shrink-0 snap-center">
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,36,34,0.08)_0%,rgba(7,36,34,0)_40%,rgba(7,36,34,0.72)_100%)]" />

            {sortedImages.length > 1 && (
              <div className="absolute bottom-[88px] left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
                {sortedImages.map((_, i) => (
                  <span
                    key={i}
                    className={`w-[5px] h-[5px] rounded-full transition-colors duration-200 ${
                      i === activeImageIdx ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {post.fuzzyLocation && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-white/12 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur-md">
                <MapPin className="h-3 w-3 text-white/75" />
                <span>{post.fuzzyLocation}</span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="rounded-[22px] border border-white/20 bg-white/20 p-3.5 text-white shadow-[0_14px_34px_rgba(7,36,34,0.22)] backdrop-blur-xl">
                <div
                  className="mb-3 flex min-w-0 cursor-pointer items-center gap-2.5"
                  onClick={handleAuthorClick}
                >
                  <Avatar
                    src={post.author.avatar}
                    petType={post.author.type as 'DOG' | 'CAT'}
                    size="md"
                    className="h-[38px] w-[38px] flex-shrink-0 border-white/60"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-white/95 max-w-[200px]">
                      {post.author.name}
                    </div>
                    <div className="flex items-center gap-1.5 truncate text-[12px] text-white/75">
                      <span className="truncate">{post.author.breed || post.author.type}</span>
                      <span className="flex-shrink-0">·</span>
                      <span className="flex-shrink-0">{timeAgoStr}</span>
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

                {post.content && (
                  <p className="mb-2 whitespace-pre-wrap text-[17px] font-medium leading-snug text-white line-clamp-3">
                    {post.content}
                  </p>
                )}

                <ActionBar
                  liked={liked}
                  likesCount={post._count.likes}
                  commentsCount={post._count.comments}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  postId={post.id}
                  variant="dark"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===== Without Images variant ===== */
        <div className="overflow-hidden rounded-[26px] border border-white/70 bg-gradient-to-br from-sea-50/30 via-surface-white to-sage-50/20 shadow-[0_16px_36px_rgba(16,80,75,0.12)] backdrop-blur-xl">
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
          <div className="px-4 pb-3">
            <p className="whitespace-pre-wrap text-[16px] leading-[1.6] text-ink line-clamp-3 border-l-[3px] border-teal-400/30 pl-3 ml-4">
              {post.content}
            </p>
          </div>

          {/* Location badge */}
          {post.fuzzyLocation && (
            <div className="flex items-center gap-1 px-4 pb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[12px] text-ink-faded">
                <MapPin className="h-3 w-3 text-teal-500/70" />
                {post.fuzzyLocation}
              </span>
            </div>
          )}

          {/* Action bar */}
          <div className="px-3 pb-2">
            <ActionBar
              liked={liked}
              likesCount={post._count.likes}
              commentsCount={post._count.comments}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              postId={post.id}
            />
          </div>
        </div>
      )}
    </article>
  );
}
