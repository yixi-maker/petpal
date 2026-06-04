'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { PawPrint, Plus } from 'lucide-react';
import { Tabs, Modal, EmptyState, Button } from '@/components/ui';
import { PostList } from '@/components/post/PostList';
import { PostForm } from '@/components/post/PostForm';
import { StoryRail } from '@/components/post/StoryRail';
import { PetDashboard } from '@/components/home/PetDashboard';
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
  const { currentPet, pets, loading: petLoading, switchPet } = usePet();
  const currentPetId = currentPet?.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('RECOMMENDED');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showFab, setShowFab] = useState(true);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // StoryRail data
  const [friendStories, setFriendStories] = useState<StoryPet[]>([]);

  // Posts limit toggle
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Auto-set onboarding flag when pets exist (existing users never see it)
  useEffect(() => {
    if (pets.length > 0) {
      localStorage.setItem('petpal-onboarding-done', 'true');
      setShowOnboarding(false);
    }
  }, [pets.length]);

  // Show onboarding ONLY when pet API has returned and confirmed no pets
  useEffect(() => {
    if (!petLoading && pets.length === 0) {
      const done = localStorage.getItem('petpal-onboarding-done');
      if (done !== 'true') {
        setShowOnboarding(true);
      }
    }
  }, [petLoading, pets.length]);

  // Handle onboarding complete
  const handleOnboardingComplete = () => {
    localStorage.setItem('petpal-onboarding-done', 'true');
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
    <div className="relative bg-surface min-h-screen">
      {/* ===== PetDashboard (hero + status rings + health glance + friends + posts teaser) ===== */}
      <PetDashboard
        currentPet={currentPet}
        pets={pets}
        onSwitchPet={switchPet}
      />

      {/* ===== StoryRail ===== */}
      <StoryRail
        currentPet={currentStoryPet}
        friends={friendStories}
        recommended={MOCK_RECOMMENDED}
      />

      {/* ===== Tabs ===== */}
      <div className="sticky top-0 z-10 bg-surface">
        <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
      </div>

      {/* ===== PostList ===== */}
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
        className={`fixed bottom-24 right-5 w-[46px] h-[46px] bg-teal-500 text-white rounded-full
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          hover:bg-teal-600 active:bg-teal-600 transition-all duration-200 z-20
          ${showFab ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-90'}`}
      >
        <Plus className="w-5 h-5" />
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
