'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { PawPrint, Plus, Users, MapPin } from 'lucide-react';
import { Tabs, Modal, Avatar, EmptyState, Button, IconBadge } from '@/components/ui';
import { PostList } from '@/components/post/PostList';
import { PostForm } from '@/components/post/PostForm';
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

const tabs = [
  { key: 'FOLLOWING', label: '关注' },
  { key: 'NEARBY', label: '附近' },
  { key: 'RECOMMENDED', label: '推荐' },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { currentPet, loading: petLoading } = usePet();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('RECOMMENDED');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?feedType=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleLike = async (postId: number) => {
    if (!currentPet) return;

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: currentPet.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, _count: { ...p._count, likes: data.likeCount } } : p
          )
        );
      }
    } catch {
      // ignore
    }
  };

  if (authLoading || petLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <PawPrint className="w-8 h-8 text-teal-500/40 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  const petType = (currentPet?.type === 'DOG' || currentPet?.type === 'CAT')
    ? (currentPet.type as 'DOG' | 'CAT')
    : undefined;

  return (
    <div className="relative bg-surface min-h-screen">
      {/* Header with subtle top warmth */}
      <div className="bg-gradient-to-b from-teal-50/20 to-transparent pt-4">
        <div className="flex items-center justify-between px-4 pt-0 pb-1">
          <h1 className="text-lg font-semibold flex items-center gap-2 text-ink">
            <PawPrint className="w-5 h-5 text-teal-500" />
            PetPal
          </h1>
          <div className="flex items-center gap-3">
            {/* Avatar button to /me */}
            <Link href="/me">
              <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center hover:bg-border-light transition-colors">
                <PawPrint className="w-4 h-4 text-ink-muted" />
              </div>
            </Link>
          </div>
        </div>

        {/* Pet Identity Header — proper card */}
        <div className="px-4 mb-3">
          {currentPet ? (
            <div className="bg-surface-white rounded-[12px] shadow-sm px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={currentPet.avatar}
                  petType={petType}
                  size="md"
                  className="w-[40px] h-[40px] flex-shrink-0"
                />
                <span className="text-[13px] text-ink-muted truncate">
                  今天用 <span className="font-medium text-teal-600">{currentPet.name}</span> 的身份探索
                </span>
              </div>
              <Link
                href="/me"
                className="text-[13px] text-teal-500 hover:text-teal-600 font-medium flex-shrink-0 ml-2 transition-colors"
              >
                切换
              </Link>
            </div>
          ) : (
            <div className="bg-surface-white rounded-[12px] shadow-sm px-4 py-3 text-center">
              <Link
                href="/pets/new"
                className="text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors"
              >
                添加你的第一只宠物
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Discovery Row */}
      <div className="px-4 mb-3">
        <div className="flex gap-2.5">
          <Link href="/nearby" className="flex-1">
            <div className="bg-surface-white rounded-[10px] shadow-sm px-3 py-2.5 flex items-center gap-2 hover:shadow-md transition-shadow">
              <IconBadge icon={<Users className="w-[14px] h-[14px]" />} variant="sea" size="sm" />
              <span className="text-[12px] text-ink-muted leading-tight">附近新朋友</span>
            </div>
          </Link>
          <Link href="/map" className="flex-1">
            <div className="bg-surface-white rounded-[10px] shadow-sm px-3 py-2.5 flex items-center gap-2 hover:shadow-md transition-shadow">
              <IconBadge icon={<MapPin className="w-[14px] h-[14px]" />} variant="teal" size="sm" />
              <span className="text-[12px] text-ink-muted leading-tight">友好地点</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-surface">
        <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </div>

      {/* Feed */}
      <div className="px-4 pb-24 mt-2">
        {activeTab === 'FOLLOWING' && !currentPet && (
          <EmptyState
            icon={<PawPrint className="w-10 h-10 text-teal-500/60" />}
            title="创建宠物后即可关注其他宠物"
            action={
              <Link href="/pets/new">
                <Button>添加宠物</Button>
              </Link>
            }
          />
        )}

        {!(activeTab === 'FOLLOWING' && !currentPet) && (
          <PostList
            posts={posts}
            loading={loading}
            currentPetId={currentPet?.id}
            onLike={handleLike}
          />
        )}
      </div>

      {/* FAB - Floating Action Button */}
      <button
        type="button"
        onClick={() => setShowPostForm(true)}
        aria-label="发布动态"
        className="fixed bottom-20 right-4 w-[52px] h-[52px] bg-teal-500 text-white rounded-full
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          hover:bg-teal-600 active:bg-teal-600 transition-all z-20"
      >
        <Plus className="w-[22px] h-[22px]" />
      </button>

      {/* Post Form Modal */}
      <Modal
        open={showPostForm}
        onClose={() => setShowPostForm(false)}
        title="发布动态"
      >
        <PostForm
          onSuccess={() => {
            setShowPostForm(false);
            fetchPosts();
          }}
          onClose={() => setShowPostForm(false)}
        />
      </Modal>
    </div>
  );
}
