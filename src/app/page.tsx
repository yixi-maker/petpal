'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PawPrint className="w-8 h-8 text-brand-300 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-brand-500" />
          PetPal
        </h1>
        <Link href="/me">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-brand-500" />
          </div>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-4">
          <PawPrint className="w-10 h-10 text-brand-400" />
        </div>
        <h2 className="text-lg font-medium text-gray-700 mb-2">欢迎来到 PetPal</h2>
        <p className="text-sm text-gray-400 mb-6">动态内容即将上线，敬请期待</p>
        <Link href="/pets/new">
          <Button>添加我的宠物</Button>
        </Link>
      </div>
    </div>
  );
}
