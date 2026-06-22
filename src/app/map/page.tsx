'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FilterChip } from '@/components/ui';
import { AMapCanvas } from '@/components/map/AMapCanvas';
import { MapBottomSheet } from '@/components/map/MapBottomSheet';
import type { Place } from '@/components/map/MapBottomSheet';
import { Layers, LocateFixed, MapPin, Navigation, SlidersHorizontal } from 'lucide-react';

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
        <AMapCanvas places={places} city={activeCity} onPlaceClick={handlePlaceClick} />
      </div>

      {/* ---- Top overlay: compact native map controls ---- */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-20 mx-auto max-w-mobile px-4 pb-4 pt-12"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="pointer-events-auto min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/75 bg-white/72 px-3 py-2 text-[12px] font-semibold text-teal-700 shadow-[0_10px_24px_rgba(16,80,75,0.10)] backdrop-blur-2xl">
              <MapPin className="h-3.5 w-3.5" />
              {activeCity} · 模糊定位
            </div>
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {CITIES.map((city) => (
                <FilterChip
                  key={city.key}
                  label={city.label}
                  active={activeCity === city.key}
                  onClick={() => setActiveCity(city.key)}
                />
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
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

          <div className="pointer-events-auto flex flex-col gap-2">
            {[
              { icon: SlidersHorizontal, label: '筛选' },
              { icon: Layers, label: '图层' },
              { icon: Navigation, label: '导航' },
              { icon: LocateFixed, label: '定位' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                className="flex h-[42px] w-[42px] items-center justify-center rounded-[16px] border border-white/75 bg-white/76 text-ink-muted shadow-[0_10px_24px_rgba(16,80,75,0.12)] backdrop-blur-2xl transition-colors hover:text-teal-600"
                aria-label={label}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
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
