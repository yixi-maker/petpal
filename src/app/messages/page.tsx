'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';
import { MessageCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ThreadData {
  id: number;
  otherPet: {
    id: number;
    name: string;
    type: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  lastMessageAt: string;
}

function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}天前`;
  return then.toLocaleDateString('zh-CN');
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-surface-alt" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-alt rounded w-20" />
        <div className="h-3 bg-surface-alt rounded w-40" />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => setThreads(data.threads || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-teal-500" aria-label="私信" />
          私信
        </h1>
      </div>

      {/* Content */}
      {loading ? (
        <div className="divide-y divide-border-light">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-teal-300" aria-label="私信" />
          </div>
          <p className="text-ink-faded text-sm mb-2">暂无私信，去附近页面交个朋友吧</p>
          <p className="text-ink-faded/60 text-[11px] mb-4">私信需要对方同意后才能开始对话</p>
          <Link href="/nearby">
            <span className="inline-block px-4 py-2 bg-teal-500 text-white text-sm rounded-xl">
              去看看
            </span>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border-light">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt transition-colors"
            >
              <Avatar src={thread.otherPet.avatar} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {thread.otherPet.name}
                  </span>
                  <span className="text-[10px] text-ink-faded shrink-0 ml-2">
                    {timeAgo(thread.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-ink-faded truncate mt-0.5">
                  {thread.lastMessage ? (
                    <>
                      {thread.lastMessage.isMine ? '你: ' : ''}
                      {thread.lastMessage.content.length > 30
                        ? thread.lastMessage.content.slice(0, 30) + '...'
                        : thread.lastMessage.content}
                    </>
                  ) : (
                    '暂无消息'
                  )}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-faded/60 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
