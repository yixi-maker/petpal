'use client';

import { useState } from 'react';
import { IcebreakerModal } from '@/components/social/IcebreakerModal';

interface GreetingButtonProps {
  fromPetId: number;
  toPetId: number;
  toPetName: string;
  className?: string;
}

export function GreetingButton({
  fromPetId,
  toPetId,
  toPetName,
  className = '',
}: GreetingButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={`text-[11px] text-teal-500 hover:text-teal-600 font-medium transition-colors ${className}`}
      >
        打招呼
      </button>

      <IcebreakerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fromPetId={fromPetId}
        toPetId={toPetId}
        toPetName={toPetName}
      />
    </>
  );
}
