'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Bell, PawPrint, Plus, Sparkles } from 'lucide-react';
import { Tabs, Modal, EmptyState, Button } from '@/components/ui';
import { PostList } from '@/components/post/PostList';
import { PostForm } from '@/components/post/PostForm';
import { StoryRail } from '@/components/post/StoryRail';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
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
  likedByCurrentPet?: boolean;
}

interface StoryPet {
  id: number;
  name: string;
  avatar?: string | null;
  type: string;
}

const tabs = [
  { key: 'FOLLOWING', label: '关注' },
  { key: 'NEARBY', label: '附近' },
  { key: 'RECOMMENDED', label: '推荐' },
];

const INITIAL_POST_LIMIT = 3;

const MOCK_RECOMMENDED: StoryPet[] = [
  { id: 101, name: '布丁', type: 'CAT', avatar: null },
  { id: 102, name: '乐乐', type: 'DOG', avatar: null },
  { id: 103, name: '奶糖', type: 'CAT', avatar: null },
  { id: 104, name: '多多', type: 'DOG', avatar: null },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { currentPet, pets, loading: petLoading } = usePet();
  const currentPetId = currentPet?.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('RECOMMENDED');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showFab, setShowFab] = useState(true);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const onboardingKey = user ? `petpal-onboarding-done:${user.id}` : null;

  // StoryRail data
  const [friendStories, setFriendStories] = useState<StoryPet[]>([]);

  // Posts limit toggle
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Auto-set onboarding flag when pets exist (existing users never see it)
  useEffect(() => {
    if (pets.length > 0) {
      if (onboardingKey) { localStorage.setItem(onboardingKey, 'true'); }
      setShowOnboarding(false);
    }
  }, [pets.length, onboardingKey]);

  // Show onboarding ONLY when pet API has returned and confirmed no pets
  useEffect(() => {
    if (!petLoading && pets.length === 0) {
      const done = onboardingKey ? localStorage.getItem(onboardingKey) : 'true';
      if (done !== 'true') {
        setShowOnboarding(true);
      }
    }
  }, [petLoading, pets.length, onboardingKey]);

  // Handle onboarding complete
  const handleOnboardingComplete = () => {
    if (onboardingKey) { localStorage.setItem(onboardingKey, 'true'); }
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ feedType: activeTab });
      if (currentPetId) {
        params.set('currentPetId', String(currentPetId));
      }
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPetId]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFab(window.scrollY < 520);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch friend stories for StoryRail
  useEffect(() => {
    if (!currentPet) {
      setFriendStories([]);
      return;
    }
    fetch(`/api/social/friends?petId=${currentPet.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setFriendStories(data?.friends || []))
      .catch(() => setFriendStories([]));
  }, [currentPet]);

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
            p.id === postId
              ? {
                  ...p,
                  likedByCurrentPet: data.liked,
                  _count: { ...p._count, likes: data.likeCount },
                }
              : p
          )
        );
      }
    } catch {
      // ignore
    }
  };

  // Loading state
  if (authLoading || petLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <PawPrint className="w-8 h-8 text-teal-500/40 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  // Show onboarding for new users with no pets
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Convert currentPet to StoryPet
  const currentStoryPet: StoryPet | null = currentPet
    ? { id: currentPet.id, name: currentPet.name, avatar: currentPet.avatar, type: currentPet.type }
    : null;

  const visiblePosts = showAllPosts ? posts : posts.slice(0, INITIAL_POST_LIMIT);
  const hasMorePosts = posts.length > INITIAL_POST_LIMIT;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[260px] bg-[radial-gradient(circle_at_22%_8%,rgba(122,174,198,0.26),transparent_32%),radial-gradient(circle_at_86%_0%,rgba(106,168,110,0.20),transparent_30%)]" />

      {/* ===== Native-feeling top area: tabs first, then stories ===== */}
      <header className="sticky top-0 z-20 px-4 pt-5 pb-2 backdrop-blur-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-600/75">
              <Sparkles className="h-3.5 w-3.5" />
              PetPal
            </p>
            <h1 className="mt-0.5 text-[24px] font-semibold leading-tight text-ink">宠物动态</h1>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/70 text-ink-muted shadow-[0_10px_24px_rgba(16,80,75,0.10)] backdrop-blur-xl transition-colors hover:text-teal-600"
            aria-label="通知"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
        </div>

        <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </header>

      {/* ===== StoryRail ===== */}
      <StoryRail
        currentPet={currentStoryPet}
        friends={friendStories}
        recommended={MOCK_RECOMMENDED}
      />

      <div className="px-4 pb-1">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-ink">正在发生</h2>
            <p className="mt-0.5 text-[12px] text-ink-faded">照片、约玩与附近小日常</p>
          </div>
          <span className="rounded-full border border-white/70 bg-white/60 px-2.5 py-1 text-[11px] font-medium text-teal-700 shadow-[0_8px_18px_rgba(16,80,75,0.08)] backdrop-blur-xl">
            {posts.length || 0} 条
          </span>
        </div>
      </div>

      {/* ===== PostList ===== */}
      <div className="px-4 pb-24">
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
          <>
            <PostList
              posts={visiblePosts}
              loading={loading}
              currentPetId={currentPet?.id}
              likedPostIds={posts
                .filter((post) => post.likedByCurrentPet)
                .map((post) => post.id)}
              onLike={handleLike}
            />

            {/* "查看全部" expand link */}
            {!loading && hasMorePosts && !showAllPosts && (
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setShowAllPosts(true)}
                  className="text-[14px] text-teal-500 hover:text-teal-600 font-medium transition-colors"
                >
                  查看全部
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== FAB - Floating Action Button ===== */}
      <button
        type="button"
        onClick={() => setShowPostForm(true)}
        aria-label="发布动态"
        className={`fixed bottom-20 right-[max(20px,calc((100vw-430px)/2+20px))] h-[54px] w-[54px] rounded-full border-[4px] border-white
          bg-[radial-gradient(circle_at_34%_24%,#6EC4BD_0%,#1D8A80_58%,#10504B_100%)] text-white
          shadow-[0_18px_36px_rgba(29,138,128,0.34)]
          flex items-center justify-center
          hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 z-20
          ${showFab ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-90'}`}
      >
        <Plus className="h-6 w-6 drop-shadow-[0_2px_5px_rgba(7,36,34,0.22)]" />
      </button>

      {/* ===== Post Form Modal ===== */}
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
