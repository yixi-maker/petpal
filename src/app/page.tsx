'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { PawPrint, Plus } from 'lucide-react';
import { Tabs, Modal, Avatar, EmptyState, Button } from '@/components/ui';
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
        <PawPrint className="w-8 h-8 text-coral-500/40 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative bg-surface min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h1 className="text-lg font-semibold flex items-center gap-2 text-ink">
          <PawPrint className="w-5 h-5 text-coral-500" />
          PetPal
        </h1>
        <div className="flex items-center gap-3">
          {/* Current pet indicator */}
          {currentPet && (
            <Link href="/pets">
              <div className="flex items-center gap-1.5 bg-surface-alt hover:bg-border-light rounded-full pl-1 pr-2.5 py-1 transition-colors cursor-pointer">
                <Avatar src={currentPet.avatar} size="sm" />
                <span className="text-[13px] text-ink-muted truncate max-w-[80px]">
                  {currentPet.name}
                </span>
              </div>
            </Link>
          )}
          {/* Avatar button to /me */}
          <Link href="/me">
            <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center hover:bg-border-light transition-colors">
              <PawPrint className="w-4 h-4 text-ink-muted" />
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
            icon={<PawPrint className="w-10 h-10" />}
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
        className="fixed bottom-20 right-4 w-[52px] h-[52px] bg-coral-500 text-white rounded-full
          shadow-[0_4px_16px_rgba(242,104,42,0.25)]
          flex items-center justify-center
          hover:bg-coral-600 active:bg-coral-600 transition-colors z-20"
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
