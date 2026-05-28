'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PetProvider } from '@/contexts/PetContext';
import { MobileShell } from './MobileShell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PetProvider>
        <MobileShell>{children}</MobileShell>
      </PetProvider>
    </AuthProvider>
  );
}
