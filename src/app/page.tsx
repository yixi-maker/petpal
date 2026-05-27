'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { PawPrint, Plus } from 'lucide-react';
import { Tabs, Modal } from '@/components/ui';
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
      <div className="min-h-screen flex items-center justify-center">
        <PawPrint className="w-8 h-8 text-brand-300 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-brand-500" />
          PetPal
        </h1>
        <div className="flex items-center gap-3">
          {/* Current pet indicator */}
          {currentPet && (
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              正在用 {currentPet.name} 的身份
            </div>
          )}
          <Link href="/me">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-brand-500" />
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-cream z-10">
        <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </div>

      {/* Feed */}
      <div className="p-4 pb-24">
        {activeTab === 'FOLLOWING' && !currentPet && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-brand-300" />
            </div>
            <p className="text-gray-400 text-sm mb-4">创建宠物后即可关注其他宠物</p>
            <Link href="/pets/new">
              <span className="inline-block px-4 py-2 bg-brand-500 text-white text-sm rounded-xl">
                添加宠物
              </span>
            </Link>
          </div>
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
        onClick={() => setShowPostForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-600 active:bg-brand-700 transition-colors z-20"
      >
        <Plus className="w-6 h-6" aria-label="发布动态" />
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
