'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FilterChip } from '@/components/ui';
import { MapPlaceholder } from '@/components/map/MapPlaceholder';
import { MapBottomSheet } from '@/components/map/MapBottomSheet';
import type { Place } from '@/components/map/MapBottomSheet';

const CITIES = [
  { key: '北京', label: '北京' },
  { key: '上海', label: '上海' },
  { key: '深圳', label: '深圳' },
];

const TYPE_FILTERS = [
  { key: '', label: '全部' },
  { key: 'HOSPITAL', label: '医院' },
  { key: 'PARK', label: '公园' },
  { key: 'MALL', label: '商场' },
  { key: 'CAFE', label: '咖啡店' },
  { key: 'RESTAURANT', label: '餐厅' },
  { key: 'GROOMING', label: '洗护' },
  { key: 'BOARDING', label: '寄养' },
];

export default function MapPage() {
  const router = useRouter();
  const [activeCity, setActiveCity] = useState('北京');
  const [activeType, setActiveType] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('city', activeCity);
      if (activeType) params.set('type', activeType);

      const res = await fetch(`/api/places?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPlaces(data.places || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeCity, activeType]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handlePlaceClick = (id: number) => {
    router.push(`/map/${id}`);
  };

  return (
    <div className="h-[100vh] relative overflow-hidden bg-surface">
      {/* ---- Full-screen map placeholder ---- */}
      <div className="absolute inset-0">
        <MapPlaceholder />
      </div>

      {/* ---- Top overlay: transparent gradient + filter chips ---- */}
      <div
        className="absolute top-0 left-0 right-0 z-20
          bg-gradient-to-b from-surface/90 to-transparent
          pt-12 pb-4 px-4 max-w-mobile mx-auto"
      >
        {/* Row 1: City FilterChips */}
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {CITIES.map((city) => (
            <FilterChip
              key={city.key}
              label={city.label}
              active={activeCity === city.key}
              onClick={() => setActiveCity(city.key)}
            />
          ))}
        </div>

        {/* Row 2: Type FilterChips (scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPE_FILTERS.map((t) => (
            <FilterChip
              key={t.key}
              label={t.label}
              active={activeType === t.key}
              onClick={() => setActiveType(t.key)}
            />
          ))}
        </div>
      </div>

      {/* ---- MapBottomSheet floating at bottom ---- */}
      <MapBottomSheet
        places={places}
        loading={loading}
        onPlaceClick={handlePlaceClick}
      />
    </div>
  );
}
