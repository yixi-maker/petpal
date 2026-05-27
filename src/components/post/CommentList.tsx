'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui';
import { Send } from 'lucide-react';

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

interface CommentListProps {
  comments: Comment[];
  currentPetId?: number;
  loading?: boolean;
  onAddComment?: (content: string) => Promise<void>;
}

export function CommentList({ comments, currentPetId, loading, onAddComment }: CommentListProps) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || !onAddComment || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(trimmed);
      setText('');
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-gray-100 rounded w-16 mb-1" />
              <div className="h-4 bg-gray-50 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          暂无评论，来抢沙发吧
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar src={comment.author.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-700">
                    {comment.author.name}
                  </span>
                  <span className="text-[10px] text-gray-300">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      {currentPetId && onAddComment && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <input
            type="text"
            className="flex-1 p-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-300 placeholder-gray-300"
            placeholder="写评论..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            maxLength={300}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
