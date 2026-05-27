'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePet } from '@/contexts/PetContext';
import { Avatar } from '@/components/ui';
import { FollowButton } from '@/components/social/FollowButton';
import { FriendRequestModal } from '@/components/social/FriendRequestModal';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
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
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4">
          <Navigation className="w-10 h-10 text-brand-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">发现附近宠物</h2>
        <p className="text-sm text-gray-400 text-center mb-4">
          开启位置服务，发现身边的毛孩子<br />
          你的精确位置不会被展示给其他用户
        </p>

        {locationError && (
          <div className="w-full max-w-xs mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{locationError}</p>
          </div>
        )}

        <button
          onClick={requestLocation}
          disabled={locationLoading}
          className="w-full max-w-xs px-6 py-3 bg-brand-500 text-white rounded-xl font-medium disabled:opacity-50 mb-6"
        >
          {locationLoading ? '获取位置中...' : '开启位置服务'}
        </button>

        <p className="text-xs text-gray-400 mb-3">或手动选择城市</p>
        <div className="flex gap-2">
          {Object.keys(CITIES).map((city) => (
            <button
              key={city}
              onClick={() => selectCity(city)}
              className={`px-5 py-2 text-sm rounded-xl border transition ${
                manualCity === city
                  ? 'border-brand-500 bg-brand-50 text-brand-600'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Main content ---
  const typeOptions = [
    { value: '', label: '全部' },
    { value: 'DOG', label: '🐶 狗狗' },
    { value: 'CAT', label: '🐱 猫猫' },
  ];
  const sizeOptions = [
    { value: '', label: '全部体型' },
    { value: 'SMALL', label: '小型' },
    { value: 'MEDIUM', label: '中型' },
    { value: 'LARGE', label: '大型' },
  ];
  const commonTags = ['活泼', '亲人', '贪吃', '高冷', '爱睡觉', '聪明', '温柔'];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-lg font-semibold mb-3">附近宠物</h1>

      <div className="space-y-2 mb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {typeOptions.map((o) => (
            <button key={o.value} onClick={() => setTypeFilter(o.value)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition ${
                typeFilter === o.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {sizeOptions.map((o) => (
            <button key={o.value} onClick={() => setSizeFilter(o.value)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition ${
                sizeFilter === o.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {commonTags.map((tag) => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition ${
                tagFilter === tag ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">附近还没有宠物，去别处看看？</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}
              className="bg-white rounded-2xl p-4 border border-gray-50 hover:shadow-md transition-shadow">
              <Avatar src={pet.avatar} size="lg" className="mx-auto mb-2" />
              <div className="text-center">
                <div className="font-medium text-sm flex items-center justify-center gap-1">
                  {pet.type === 'DOG' ? '🐶' : '🐱'} {pet.name}
                </div>
                <div className="text-xs text-gray-400">{pet.breed || ''}</div>
                <div className="flex justify-center gap-1 mt-1.5 flex-wrap">
                  {pet.personalityTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-brand-50 text-brand-500 text-[10px] rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {pet.fuzzyDistance}
              </div>
              <div className="flex gap-1.5 mt-3" onClick={(e) => e.preventDefault()}>
                <FollowButton petId={pet.id} initialFollowing={false} className="flex-1 justify-center text-[10px]" />
                <button
                  onClick={(e) => { e.preventDefault(); setFrTarget(pet); setFrOpen(true); }}
                  className="flex-1 px-2 py-1.5 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  打招呼
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <FriendRequestModal open={frOpen} onClose={() => setFrOpen(false)}
        fromPetId={currentPet?.id || 0} toPetId={frTarget?.id || 0} toPetName={frTarget?.name || ''} />
    </div>
  );
}
