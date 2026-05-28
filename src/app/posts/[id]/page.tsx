'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePet } from '@/contexts/PetContext';
import { Avatar } from '@/components/ui';
import { CommentList } from '@/components/post/CommentList';
import { ArrowLeft, Heart, MessageCircle, Share2, MapPin } from 'lucide-react';

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

interface CommentAuthor {
  id: number;
  name: string;
  breed?: string | null;
  avatar?: string | null;
  type: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentPet } = usePet();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else {
        setPost(null);
      }
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // ignore
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (!currentPet || !post) return;

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: currentPet.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev) =>
          prev ? { ...prev, _count: { ...prev._count, likes: data.likeCount } } : prev
        );
      }
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const url = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.author.name}的分享`,
          text: post.content,
          url,
        });
      } catch {
        // cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('链接已复制');
      } catch {
        // ignore
      }
    }
  };

  const handleAddComment = async (content: string) => {
    if (!currentPet || !post) return;

    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorPetId: currentPet.id, content }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '评论失败');
    }

    // Refresh comments
    await fetchComments();

    // Update comment count
    setPost((prev) =>
      prev ? { ...prev, _count: { ...prev._count, comments: prev._count.comments + 1 } } : prev
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-ink-faded text-sm mb-4">动态不存在或已删除</p>
        <button
          onClick={() => router.back()}
          className="text-teal-500 text-sm"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border-light">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-ink-muted" aria-label="返回" />
        </button>
        <span className="text-sm font-medium text-ink">动态详情</span>
      </div>

      <div className="p-4">
        {/* Author info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-light">
          <div className="flex items-center gap-3 mb-4">
            <Avatar src={post.author.avatar} size="lg" />
            <div>
              <div className="text-base font-medium text-ink">{post.author.name}</div>
              <div className="text-sm text-ink-faded">
                {post.author.breed || post.author.type} · {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-ink leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid gap-2 mb-4">
              {post.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="w-full rounded-xl object-cover max-h-96"
                />
              ))}
            </div>
          )}

          {/* Location */}
          {post.fuzzyLocation && (
            <div className="flex items-center gap-1 text-sm text-teal-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{post.fuzzyLocation}</span>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-8 pt-3 border-t border-border-light">
            <button
              onClick={handleLike}
              disabled={!currentPet}
              className="flex items-center gap-1.5 text-ink-muted hover:text-rose-500 transition-colors disabled:opacity-50"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">{post._count.likes}</span>
            </button>
            <div className="flex items-center gap-1.5 text-ink-muted">
              <MessageCircle className="w-5 h-5" aria-label="私信" />
              <span className="text-sm">{post._count.comments}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-ink-muted hover:text-teal-500 transition-colors"
            >
              <Share2 className="w-5 h-5" aria-label="分享" />
              <span className="text-sm">分享</span>
            </button>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-light mt-3">
          <h3 className="text-sm font-medium text-ink mb-4">
            评论 ({post._count.comments})
          </h3>
          <CommentList
            comments={comments}
            currentPetId={currentPet?.id}
            loading={commentsLoading}
            onAddComment={currentPet ? handleAddComment : undefined}
          />
        </div>
      </div>
    </div>
  );
}
