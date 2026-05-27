'use client';

import { useRouter } from 'next/navigation';
import { PetForm } from '@/components/pet/PetForm';
import { usePet } from '@/contexts/PetContext';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPetPage() {
  const router = useRouter();
  const { refreshPets } = usePet();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await refreshPets();
      router.push('/me');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/me"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-semibold">创建宠物档案</h1>
      </div>
      <PetForm onSubmit={handleSubmit} submitLabel="创建" />
    </div>
  );
}
