'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
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
  ChevronRight,
  Clock,
  Phone,
} from 'lucide-react';
import { Modal, FilterChip, Badge, SegmentedControl } from '@/components/ui';

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

// Updated color map: HOSPITAL=red, PARK=sage, CAFE/MALL/RESTAURANT=coral, GROOMING/BOARDING=mist

const TYPE_LABEL_MAP: Record<string, string> = {
  HOSPITAL: '医院',
  PARK: '公园',
  MALL: '商场',
  CAFE: '咖啡店',
  RESTAURANT: '餐厅',
  GROOMING: '洗护',
  BOARDING: '寄养',
};

// Circle color for type icon (solid bg used for the icon circle)
const TYPE_CIRCLE_MAP: Record<string, string> = {
  HOSPITAL: 'bg-red-50 text-red-500',
  PARK: 'bg-sage-50 text-sage-500',
  MALL: 'bg-coral-50 text-coral-500',
  CAFE: 'bg-coral-50 text-coral-500',
  RESTAURANT: 'bg-coral-50 text-coral-500',
  GROOMING: 'bg-mist-50 text-mist-400',
  BOARDING: 'bg-mist-50 text-mist-400',
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
              : 'text-ink-faded/30'
          }`}
        />
      ))}
      <span className="text-[12px] text-ink-faded ml-1">{rating}</span>
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
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-surface z-20 px-4 pt-3 pb-3 border-b border-border-light">
        {/* Title + Segmented control on same line */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[17px] font-semibold text-ink">发现周边</h1>
          <SegmentedControl
            options={[
              { key: 'list', label: '列表' },
              { key: 'map', label: '地图' },
            ]}
            activeKey={viewMode}
            onChange={(key) => setViewMode(key as 'list' | 'map')}
          />
        </div>

        {/* City selector: FilterChip row */}
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

        {/* Type filter: horizontal scrollable FilterChip row */}
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

      {/* Content */}
      <div className="px-4 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          /* ========== LIST VIEW ========== */
          <div>
            {places.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-10 h-10 text-ink-faded/30 mx-auto mb-3" />
                <p className="text-[14px] text-ink-faded">该区域暂无收录地点</p>
                <p className="text-[12px] text-ink-faded/60 mt-1">换个城市或类型试试吧</p>
              </div>
            ) : (
              places.map((place) => (
                <div
                  key={place.id}
                  onClick={() => router.push(`/map/${place.id}`)}
                  className="bg-surface-white rounded-[10px] shadow-card mb-3 overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
                >
                  {/* Top row: icon + info + distance */}
                  <div className="flex items-start gap-3 p-3.5">
                    {/* Left: type icon in colored circle */}
                    <div
                      className={`w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 ${
                        TYPE_CIRCLE_MAP[place.type] || 'bg-surface-alt text-ink-faded'
                      }`}
                    >
                      {TYPE_ICON_MAP[place.type] || <MapPin className="w-4 h-4" />}
                    </div>

                    {/* Center: name, rating, address */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-medium text-ink truncate">{place.name}</h3>
                        <Badge variant="default" size="sm">{TYPE_LABEL_MAP[place.type] || place.type}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={place.rating} />
                        <span className="text-[12px] text-ink-faded">{place.reviewCount} 条评价</span>
                      </div>
                      <p className="text-[12px] text-ink-faded mt-1.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {place.address}
                      </p>
                    </div>

                    {/* Right: distance + open status */}
                    <div className="shrink-0 text-right">
                      <p className="text-[12px] text-ink-faded">{mockDistance(place.id)}</p>
                      <Badge
                        variant={place.isOpen ? 'sage' : 'default'}
                        size="sm"
                        className="mt-1"
                      >
                        {place.isOpen ? '营业中' : '休息中'}
                      </Badge>
                    </div>
                  </div>

                  {/* Bottom: pet-friendly tags */}
                  {place.petFriendlyTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
                      {place.petFriendlyTags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="coral" size="sm">{tag}</Badge>
                      ))}
                      {place.petFriendlyTags.length > 3 && (
                        <span className="text-[11px] text-ink-faded self-center">
                          +{place.petFriendlyTags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* ========== MAP VIEW (placeholder) ========== */
          <div>
            {/* Map placeholder */}
            <div className="rounded-[12px] bg-gradient-to-br from-mist-50 to-surface-alt h-[400px] relative overflow-hidden">
              {/* Center hint */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <MapPin className="w-12 h-12 text-ink-faded/20" />
                <p className="text-[14px] text-ink-faded mt-3">地图区域</p>
              </div>

              {/* Fake marker dots */}
              {places.slice(0, 4).map((place, i) => {
                const positions = [
                  { top: '25%', left: '30%' },
                  { top: '40%', left: '60%' },
                  { top: '55%', left: '20%' },
                  { top: '65%', left: '50%' },
                ];
                return (
                  <div
                    key={place.id}
                    className="absolute cursor-pointer"
                    style={{ top: positions[i].top, left: positions[i].left }}
                    onClick={() => handlePlaceClick(place)}
                    title={place.name}
                  >
                    <div className="w-3.5 h-3.5 bg-coral-500 rounded-full shadow-[0_0_0_3px_rgba(255,107,107,0.2)]" />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-white text-[11px] px-2 py-0.5 rounded-[6px] shadow-md whitespace-nowrap text-ink font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      {place.name}
                    </div>
                  </div>
                );
              })}

              {/* Bottom overlay bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-surface-white/80 backdrop-blur-sm py-2 text-center">
                <p className="text-[12px] text-ink-muted">接入高德地图后显示完整地图</p>
              </div>
            </div>

            {/* Place list below the map */}
            <div className="mt-4 space-y-2">
              <p className="text-[12px] text-ink-faded px-1">附近地点</p>
              {places.slice(0, 5).map((place) => (
                <div
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className="flex items-center gap-3 p-3 bg-surface-white rounded-[10px] active:scale-[0.98] transition cursor-pointer shadow-card"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      TYPE_CIRCLE_MAP[place.type] || 'bg-surface-alt text-ink-faded'
                    }`}
                  >
                    {TYPE_ICON_MAP[place.type] || <MapPin className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-ink truncate">{place.name}</p>
                    <p className="text-[12px] text-ink-faded truncate">{place.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StarRating rating={place.rating} />
                    <span className="text-[12px] text-ink-faded">{mockDistance(place.id)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-faded/40 shrink-0" />
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
          <div className="-mx-5 -mb-5">
            {/* Map placeholder in modal */}
            <div className="h-36 bg-gradient-to-br from-mist-50 to-surface-alt flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-ink-faded/30 mx-auto mb-1" />
                <p className="text-[12px] text-ink-faded">接入高德地图后显示位置</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Type badge + rating */}
              <div className="flex items-center gap-2">
                <Badge variant="coral" size="md">
                  {TYPE_LABEL_MAP[selectedPlace.type]}
                </Badge>
                <StarRating rating={selectedPlace.rating} />
                <span className="text-[12px] text-ink-faded">{selectedPlace.reviewCount} 条评价</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 text-[13px]">
                <Clock className="w-4 h-4 text-ink-faded" />
                {selectedPlace.isOpen ? (
                  <Badge variant="sage" size="sm">营业中</Badge>
                ) : (
                  <Badge variant="danger" size="sm">休息中</Badge>
                )}
                <span className="text-ink-muted">{selectedPlace.openHours}</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-[13px] text-ink-muted">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-ink-faded" />
                <span>{selectedPlace.address}</span>
              </div>

              {/* Phone */}
              {selectedPlace.phone && (
                <div className="flex items-start gap-2 text-[13px] text-coral-500">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{selectedPlace.phone}</span>
                </div>
              )}

              {/* Pet friendly tags */}
              {selectedPlace.petFriendlyTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlace.petFriendlyTags.map((tag, i) => (
                    <Badge key={i} variant="coral" size="sm">{tag}</Badge>
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-coral-500 text-white text-[14px] rounded-[8px] font-medium hover:bg-coral-600 transition"
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-border text-ink text-[14px] rounded-[8px] font-medium hover:bg-surface-alt transition"
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
