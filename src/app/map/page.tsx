'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  List,
  Map,
  Star,
  Navigation,
  Stethoscope,
  TreePine,
  ShoppingBag,
  Coffee,
  UtensilsCrossed,
  Scissors,
  Home,
  Search,
} from 'lucide-react';
import { Tabs, Modal } from '@/components/ui';

interface Place {
  id: number;
  name: string;
  type: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  address: string;
  phone: string | null;
  rating: number;
  isOpen: boolean;
  openHours: string;
  petFriendlyTags: string[];
  reviewCount: number;
}

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

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  HOSPITAL: <Stethoscope className="w-4 h-4" />,
  PARK: <TreePine className="w-4 h-4" />,
  MALL: <ShoppingBag className="w-4 h-4" />,
  CAFE: <Coffee className="w-4 h-4" />,
  RESTAURANT: <UtensilsCrossed className="w-4 h-4" />,
  GROOMING: <Scissors className="w-4 h-4" />,
  BOARDING: <Home className="w-4 h-4" />,
};

const TYPE_COLOR_MAP: Record<string, string> = {
  HOSPITAL: 'bg-red-50 text-red-500',
  PARK: 'bg-green-50 text-green-500',
  MALL: 'bg-purple-50 text-purple-500',
  CAFE: 'bg-amber-50 text-amber-500',
  RESTAURANT: 'bg-orange-50 text-orange-500',
  GROOMING: 'bg-pink-50 text-pink-500',
  BOARDING: 'bg-blue-50 text-blue-500',
};

const TYPE_LABEL_MAP: Record<string, string> = {
  HOSPITAL: '医院',
  PARK: '公园',
  MALL: '商场',
  CAFE: '咖啡店',
  RESTAURANT: '餐厅',
  GROOMING: '洗护',
  BOARDING: '寄养',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : star - 0.5 <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200'
          }`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating}</span>
    </div>
  );
}

function mockDistance(placeId: number): string {
  const distances = ['约 350m', '约 520m', '约 800m', '约 1.2km', '约 1.8km', '约 2.4km', '约 3.1km'];
  return distances[placeId % distances.length];
}

export default function MapPage() {
  const router = useRouter();
  const [activeCity, setActiveCity] = useState('北京');
  const [activeType, setActiveType] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

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

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-cream z-20 px-4 pt-3 pb-2 border-b border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-500" />
            地图发现
          </h1>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              列表
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-400'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              地图
            </button>
          </div>
        </div>

        {/* City tabs */}
        <Tabs
          tabs={CITIES}
          activeKey={activeCity}
          onChange={setActiveCity}
        />

        {/* Type filter chips */}
        <div className="flex gap-2 mt-3 pb-1 overflow-x-auto">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              className={`shrink-0 px-3 py-1.5 text-xs rounded-full transition ${
                activeType === t.key
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-brand-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          /* List view */
          <div className="space-y-3">
            {places.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">该区域暂无收录地点</p>
                <p className="text-gray-300 text-xs mt-1">换个城市或类型试试吧</p>
              </div>
            ) : (
              places.map((place) => (
                <div
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className="bg-white rounded-2xl p-4 active:scale-[0.98] transition-transform cursor-pointer shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        TYPE_COLOR_MAP[place.type] || 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {TYPE_ICON_MAP[place.type] || <MapPin className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{place.name}</h3>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {TYPE_LABEL_MAP[place.type] || place.type}
                        </span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={place.rating} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {place.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-brand-500">{mockDistance(place.id)}</span>
                        {place.isOpen ? (
                          <span className="text-xs text-green-500">营业中</span>
                        ) : (
                          <span className="text-xs text-gray-400">休息中</span>
                        )}
                        <span className="text-xs text-gray-400">{place.openHours}</span>
                      </div>
                      {/* Pet friendly tags */}
                      {place.petFriendlyTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {place.petFriendlyTags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-500"
                            >
                              {tag}
                            </span>
                          ))}
                          {place.petFriendlyTags.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-gray-400">
                              +{place.petFriendlyTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <Navigation className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Map placeholder view */
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-sm" style={{ height: '60vh' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-blue-50 to-green-50 flex flex-col items-center justify-center">
                <Map className="w-16 h-16 text-brand-300 mb-4" />
                <p className="text-brand-500 font-medium text-lg">接入高德地图后显示</p>
                <p className="text-gray-400 text-sm mt-1">接入高德地图后显示</p>
                <p className="text-gray-300 text-xs mt-3 max-w-xs text-center leading-relaxed">
                  后续接入高德地图 JS API，即可展示地图标记、路线规划等功能
                </p>
              </div>

              {/* Place markers on the placeholder */}
              {places.slice(0, 6).map((place, i) => {
                const positions = [
                  'top-[20%] left-[25%]',
                  'top-[35%] left-[55%]',
                  'top-[50%] left-[15%]',
                  'top-[60%] left-[45%]',
                  'top-[25%] left-[70%]',
                  'top-[70%] left-[60%]',
                ];
                return (
                  <div
                    key={place.id}
                    className={`absolute ${positions[i]} -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
                    onClick={() => handlePlaceClick(place)}
                  >
                    <div className="relative group">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          TYPE_COLOR_MAP[place.type]?.replace('50', '500').replace('text-', 'bg-') || 'bg-brand-500'
                        }`}
                      >
                        <span className="text-white">
                          {TYPE_ICON_MAP[place.type] || <MapPin className="w-3.5 h-3.5" />}
                        </span>
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <div className="bg-white text-xs px-2 py-1 rounded-lg shadow-lg whitespace-nowrap text-gray-700 font-medium">
                          {place.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Place list below the map placeholder */}
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400 px-1">附近地点</p>
              {places.slice(0, 5).map((place) => (
                <div
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl active:scale-[0.98] transition cursor-pointer"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      TYPE_COLOR_MAP[place.type] || 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {TYPE_ICON_MAP[place.type] || <MapPin className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{place.name}</p>
                    <p className="text-xs text-gray-400 truncate">{place.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StarRating rating={place.rating} />
                    <span className="text-xs text-brand-500">{mockDistance(place.id)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Place detail modal */}
      <Modal
        open={!!selectedPlace}
        onClose={() => setSelectedPlace(null)}
        title={selectedPlace?.name || ''}
      >
        {selectedPlace && (
          <div className="-mx-6 -mb-6">
            {/* Map placeholder in modal */}
            <div className="h-40 bg-gradient-to-br from-brand-50 via-blue-50 to-green-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-brand-400 mx-auto mb-1" />
                <p className="text-xs text-brand-500 font-medium">接入高德地图后显示位置</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Type badge + rating */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-500 font-medium">
                  {TYPE_LABEL_MAP[selectedPlace.type]}
                </span>
                <StarRating rating={selectedPlace.rating} />
                <span className="text-xs text-gray-400">{selectedPlace.reviewCount} 条评价</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {selectedPlace.isOpen ? (
                  <span className="text-green-500 font-medium">营业中</span>
                ) : (
                  <span className="text-gray-400">休息中</span>
                )}
                <span>{selectedPlace.openHours}</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                <span>{selectedPlace.address}</span>
              </div>

              {/* Phone */}
              {selectedPlace.phone && (
                <div className="flex items-start gap-2 text-sm text-brand-500">
                  <span>{selectedPlace.phone}</span>
                </div>
              )}

              {/* Pet friendly tags */}
              {selectedPlace.petFriendlyTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlace.petFriendlyTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('导航功能将在接入高德地图后启用');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 text-white text-sm rounded-xl font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  导航
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlace(null);
                    router.push(`/map/${selectedPlace.id}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-brand-500 text-brand-500 text-sm rounded-xl font-medium"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
