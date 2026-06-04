'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PetForm, PetFormData } from '@/components/pet/PetForm';
import { usePet } from '@/contexts/PetContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PetResponse {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  birthday?: string | null;
  gender?: string | null;
  size?: string | null;
  personalityTags?: string[] | string | null;
  bio?: string | null;
  avatar?: string | null;
}

function normalizeTags(tags: PetResponse['personalityTags']): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    if (Array.isArray(parsed)) {
      return parsed.filter((tag): tag is string => typeof tag === 'string');
    }
  } catch {
    // Fall through to comma-separated text.
  }
  return tags.split(/[,，、]/).map((tag) => tag.trim()).filter(Boolean);
}

export default function EditPetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { refreshPets } = usePet();
  const [initialData, setInitialData] = useState<PetFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');

    fetch(`/api/pets/${id}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('加载失败')))
      .then((data: { pet: PetResponse }) => {
        if (!alive) return;
        const pet = data.pet;
        setInitialData({
          name: pet.name,
          type: pet.type,
          breed: pet.breed || '',
          birthday: pet.birthday || '',
          gender: pet.gender || 'UNKNOWN',
          size: pet.size || 'MEDIUM',
          personalityTags: normalizeTags(pet.personalityTags),
          bio: pet.bio || '',
          avatar: pet.avatar || '',
        });
      })
      .catch(() => {
        if (alive) setError('宠物档案加载失败');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const handleSubmit = async (data: PetFormData) => {
    const res = await fetch(`/api/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('保存失败');
    }

    await refreshPets();
    router.push('/me');
  };

  return (
    <div className="px-4 pb-28 pt-5">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/me"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/70 text-ink-muted shadow-[0_10px_24px_rgba(16,80,75,0.08)] backdrop-blur-xl"
        >
          <ArrowLeft className="h-5 w-5" aria-label="返回" />
        </Link>
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-ink">编辑宝贝档案</h1>
          <p className="mt-0.5 text-[12px] text-ink-faded">头像、基础信息和性格标签</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="rounded-[22px] border border-rose-100 bg-rose-50 p-5 text-center text-[14px] text-rose-500">
          {error}
        </div>
      ) : initialData ? (
        <PetForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="保存档案"
        />
      ) : null}
    </div>
  );
}
