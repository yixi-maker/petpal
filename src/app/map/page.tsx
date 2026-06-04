'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FilterChip } from '@/components/ui';
import { MapPlaceholder } from '@/components/map/MapPlaceholder';
import { MapBottomSheet } from '@/components/map/MapBottomSheet';
import type { Place } from '@/components/map/MapBottomSheet';
import { LocateFixed, MapPin, Search } from 'lucide-react';

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
    <div className="relative h-[100dvh] overflow-hidden bg-surface">
      {/* ---- Full-screen map placeholder ---- */}
      <div className="absolute inset-0">
        <MapPlaceholder />
      </div>

      {/* ---- Top overlay: transparent gradient + filter chips ---- */}
      <div
        className="absolute left-0 right-0 top-0 z-20 mx-auto max-w-mobile
          bg-gradient-to-b from-[#EAF6F4]/95 via-[#EAF6F4]/72 to-transparent
          px-4 pb-5 pt-12"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-teal-600">
              <MapPin className="h-3.5 w-3.5" />
              宠物友好地图
            </p>
            <h1 className="text-[27px] font-semibold leading-tight text-ink">附近友好空间</h1>
            <p className="mt-1 text-[12px] text-ink-faded">仅展示模糊定位，保护主人与宠物隐私</p>
          </div>
          <button
            type="button"
            className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/75 text-teal-600 shadow-[0_10px_24px_rgba(16,80,75,0.14)] backdrop-blur-xl"
            aria-label="定位到附近"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {CITIES.map((city) => (
            <FilterChip
              key={city.key}
              label={city.label}
              active={activeCity === city.key}
              onClick={() => setActiveCity(city.key)}
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/70 text-ink-faded shadow-[0_4px_14px_rgba(16,80,75,0.08)] backdrop-blur-xl">
            <Search className="h-4 w-4" />
          </div>
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
