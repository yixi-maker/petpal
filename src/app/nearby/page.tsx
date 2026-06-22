'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePet } from '@/contexts/PetContext';
import { Avatar, Button, EmptyState, FilterChip, Badge } from '@/components/ui';
import { FollowButton } from '@/components/social/FollowButton';
import { IcebreakerModal } from '@/components/social/IcebreakerModal';
import { MapPin, Navigation, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';

interface NearbyPet {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  avatar?: string | null;
  personalityTags: string[];
  size: string;
  gender: string;
  bio?: string | null;
  city: string;
  district?: string | null;
  fuzzyDistance: string;
}

const CITIES: Record<string, { lat: number; lng: number; district: string }> = {
  '北京': { lat: 39.9042, lng: 116.4074, district: '朝阳区' },
  '上海': { lat: 31.2304, lng: 121.4737, district: '黄浦区' },
  '深圳': { lat: 22.5431, lng: 114.0579, district: '南山区' },
};

export default function NearbyPage() {
  const { currentPet } = usePet();
  const [pets, setPets] = useState<NearbyPet[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualCity, setManualCity] = useState('');

  const [typeFilter, setTypeFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  const [frOpen, setFrOpen] = useState(false);
  const [frTarget, setFrTarget] = useState<NearbyPet | null>(null);

  const saveLocation = async (lat: number, lng: number, city: string, district: string) => {
    if (!currentPet) return;
    try {
      await fetch(`/api/pets/${currentPet.id}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, district, lat, lng }),
      });
    } catch { /* ignore */ }
  };

  const onPositionSuccess = async (pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng } = pos.coords;
    setCoords({ lat, lng });
    setHasLocation(true);
    setLocationLoading(false);
    setLocationError('');
    // Use mock city mapping based on coords (production: reverse geocode)
    const city = lat > 30 && lat < 35 ? '上海' : lat < 25 ? '深圳' : '北京';
    await saveLocation(lat, lng, city, '附近');
  };

  const onPositionError = (err: GeolocationPositionError) => {
    setLocationLoading(false);
    if (err.code === err.PERMISSION_DENIED) {
      setLocationError('定位权限被拒绝，请选择城市后查看');
    } else if (err.code === err.TIMEOUT) {
      setLocationError('定位超时，请选择城市后查看');
    } else {
      setLocationError('无法获取位置，请选择城市后查看');
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('浏览器不支持定位，请手动选择城市');
      return;
    }
    setLocationLoading(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError, { timeout: 10000 });
  };

  const selectCity = (city: string) => {
    const info = CITIES[city];
    if (!info) return;
    setManualCity(city);
    setCoords({ lat: info.lat, lng: info.lng });
    setHasLocation(true);
    setLocationError('');
    saveLocation(info.lat, info.lng, city, info.district);
  };

  const fetchNearby = useCallback(async () => {
    if (!coords) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ lat: String(coords.lat), lng: String(coords.lng) });
      if (typeFilter) params.set('type', typeFilter);
      if (sizeFilter) params.set('size', sizeFilter);
      if (tagFilter) params.set('personalityTag', tagFilter);
      const res = await fetch(`/api/nearby?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPets(data.pets || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [coords, typeFilter, sizeFilter, tagFilter]);

  useEffect(() => {
    if (coords) fetchNearby();
  }, [coords, fetchNearby]);

  // Check if location already saved for current pet
  useEffect(() => {
    if (currentPet) {
      fetch(`/api/pets/${currentPet.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.pet?.location?.lat) {
            setCoords({ lat: data.pet.location.lat, lng: data.pet.location.lng });
            setHasLocation(true);
          }
        })
        .catch(() => {});
    }
  }, [currentPet]);

  // --- No-location state ---
  if (!hasLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[320px] bg-surface-white border border-border rounded-[12px] p-5 text-center">
          <div className="flex justify-center mb-4">
            <Navigation className="w-[36px] h-[36px] text-sea-500" />
          </div>
          <h2 className="text-[17px] font-semibold text-ink mb-1.5">发现宝贝</h2>
          <p className="text-[13px] text-ink-faded leading-relaxed mb-4">
            开启位置服务，发现身边的毛孩子<br />
            你的精确位置不会被展示给其他用户
          </p>

          {locationError && (
            <div className="mb-4 bg-rose-50 rounded-[8px] p-3 flex items-start gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-rose-600">{locationError}</p>
            </div>
          )}

          <Button
            onClick={requestLocation}
            disabled={locationLoading}
            loading={locationLoading}
            variant="primary"
            className="w-full mb-5"
          >
            {locationLoading ? '获取位置中...' : '开启位置服务'}
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-ink-faded shrink-0">或手动选择城市</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center gap-2">
            {Object.keys(CITIES).map((city) => (
              <FilterChip
                key={city}
                label={city}
                active={manualCity === city}
                onClick={() => selectCity(city)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Main content ---
  const typeOptions = [
    { value: '', label: '全部' },
    { value: 'DOG', label: '狗狗' },
    { value: 'CAT', label: '猫猫' },
  ];
  const sizeOptions = [
    { value: '', label: '全部' },
    { value: 'SMALL', label: '小型' },
    { value: 'MEDIUM', label: '中型' },
    { value: 'LARGE', label: '大型' },
  ];
  const commonTags = ['活泼', '亲人', '贪吃', '高冷', '爱睡觉', '聪明', '温柔'];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-[17px] font-semibold text-ink mb-1">发现宝贝</h1>
        <p className="text-[13px] text-ink-faded mb-3">找到附近的小伙伴，一起玩耍</p>      <p className="text-[11px] text-ink-faded/60 flex items-center gap-1 mb-4">
        <Shield className="w-3 h-3" />
        位置仅展示模糊距离，不暴露精确坐标
      </p>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {typeOptions.map((o) => (
            <FilterChip
              key={o.value}
              label={o.value === 'DOG' ? '狗狗' : o.value === 'CAT' ? '猫猫' : '全部'}
              active={typeFilter === o.value}
              onClick={() => setTypeFilter(o.value)}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {sizeOptions.map((o) => (
            <FilterChip
              key={o.value}
              label={o.label}
              active={sizeFilter === o.value}
              onClick={() => setSizeFilter(o.value)}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {commonTags.map((tag) => (
            <FilterChip
              key={tag}
              label={tag}
              active={tagFilter === tag}
              onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface-white rounded-[10px] p-3.5 shadow-card animate-pulse">
              <div className="w-12 h-12 bg-surface-alt rounded-full mx-auto mb-3" />
              <div className="h-4 bg-surface-alt rounded w-2/3 mx-auto mb-2" />
              <div className="h-3 bg-surface-alt rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-10 h-10 text-teal-500/40" />}
          title="附近暂时没有小伙伴出现"
          description="换个区域或筛选条件试试？"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="bg-surface-white rounded-[10px] p-3.5 shadow-card hover:shadow-md transition-shadow"
            >
              <Avatar src={pet.avatar} size="lg" className="mx-auto mb-2" />
              <div className="text-center">
                <div className="font-medium text-sm flex items-center justify-center gap-1">
                  <span>{pet.type === 'DOG' ? '🐶' : '🐱'}</span>
                  <span className="text-ink">{pet.name}</span>
                </div>
                <div className="text-[12px] text-ink-faded mt-0.5">{pet.breed || ''}</div>
                <div className="flex justify-center gap-1 mt-1.5 flex-wrap">
                  {pet.personalityTags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="teal" size="sm">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-[12px] text-ink-faded">
                <MapPin className="w-3 h-3" />
                {pet.fuzzyDistance}
              </div>
              <div className="flex gap-1.5 mt-3" onClick={(e) => e.preventDefault()}>
                <FollowButton petId={pet.id} initialFollowing={false} className="flex-1 justify-center text-[10px]" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.preventDefault(); setFrTarget(pet); setFrOpen(true); }}
                  className="flex-1 text-[10px]"
                >
                  打招呼
                </Button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <IcebreakerModal open={frOpen} onClose={() => setFrOpen(false)}
        fromPetId={currentPet?.id || 0} toPetId={frTarget?.id || 0} toPetName={frTarget?.name || ''} />
    </div>
  );
}
