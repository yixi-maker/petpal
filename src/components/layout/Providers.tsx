'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PetProvider } from '@/contexts/PetContext';
import { ArmsRum } from '@/components/monitoring/ArmsRum';
import { MobileShell } from './MobileShell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PetProvider>
        <ArmsRum />
        <MobileShell>{children}</MobileShell>
      </PetProvider>
    </AuthProvider>
  );
}
