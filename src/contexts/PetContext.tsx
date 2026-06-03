'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  avatar?: string | null;
  personalityTags?: string;
  size?: string;
  gender?: string;
}

interface PetContextType {
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  refreshPets: () => Promise<void>;
  switchPet: (petId: number) => void;
}

const PetContext = createContext<PetContextType | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPets = useCallback(async () => {
    setLoading(true);
    if (!user) {
      setPets([]);
      setCurrentPet(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/pets');
      if (res.ok) {
        const data = await res.json();
        setPets(data.pets);
        const savedId = localStorage.getItem('currentPetId');
        if (savedId) {
          const found = data.pets.find((p: Pet) => p.id === Number(savedId));
          if (found) {
            setCurrentPet(found);
            setLoading(false);
            return;
          }
        }
        if (data.pets.length > 0) {
          setCurrentPet(data.pets[0]);
          localStorage.setItem('currentPetId', String(data.pets[0].id));
        } else {
          setCurrentPet(null);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshPets(); }, [refreshPets]);

  const switchPet = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setCurrentPet(pet);
      localStorage.setItem('currentPetId', String(petId));
    }
  };

  return (
    <PetContext.Provider value={{ pets, currentPet, loading, refreshPets, switchPet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used within PetProvider');
  return ctx;
}
