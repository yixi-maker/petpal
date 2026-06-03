'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Modal, FilterChip, Badge, SegmentedControl, IconBadge } from '@/components/ui';
import { MapPlaceholder } from '@/components/map/MapPlaceholder';

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

const TYPE_LABEL_MAP: Record<string, string> = {
  HOSPITAL: '医院',
  PARK: '公园',
  MALL: '商场',
  CAFE: '咖啡店',
  RESTAURANT: '餐厅',
  GROOMING: '洗护',
  BOARDING: '寄养',
};

// IconBadge variant mapping by place type
const TYPE_VARIANT_MAP: Record<string, 'teal' | 'sea' | 'sage' | 'amber' | 'rose'> = {
  HOSPITAL: 'rose',
  PARK: 'sage',
  MALL: 'teal',
  CAFE: 'teal',
  RESTAURANT: 'teal',
  GROOMING: 'sea',
  BOARDING: 'sea',
};

function getPlaceTags(place: Place): { label: string; variant: 'sage' | 'sea' | 'teal' | 'amber' | 'rose' }[] {
  const tags: { label: string; variant: 'sage' | 'sea' | 'teal' | 'amber' | 'rose' }[] = [];
  if (place.petFriendlyTags?.includes('可带宠入内')) tags.push({ label: '可入内', variant: 'sage' });
  if (place.petFriendlyTags?.includes('提供饮水')) tags.push({ label: '有饮水', variant: 'sea' });
  if (place.petFriendlyTags?.includes('超大草坪')) tags.push({ label: '有草坪', variant: 'sage' });
  if (place.petFriendlyTags?.includes('24小时急诊')) tags.push({ label: '24h急诊', variant: 'rose' });
  if (place.petFriendlyTags?.includes('SPA护理')) tags.push({ label: 'SPA', variant: 'sea' });
  if (place.petFriendlyTags?.includes('有草坪')) tags.push({ label: '有草坪', variant: 'sage' });
  // Always show type-based tag
  if (place.type === 'HOSPITAL') tags.push({ label: '专业医疗', variant: 'teal' });
  if (place.type === 'PARK') tags.push({ label: '户外空间', variant: 'sage' });
  if (place.type === 'CAFE' || place.type === 'RESTAURANT') tags.push({ label: '餐饮', variant: 'amber' });
  return tags;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating
              ? 'text-amber-500 fill-amber-500'
              : star - 0.5 <= rating
              ? 'text-amber-500 fill-amber-500'
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
              className="px-4 py-2 text-[14px]"
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
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          /* ========== LIST VIEW ========== */
          <div>
            {places.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-10 h-10 text-ink-faded/30 mx-auto mb-3" />
                <p className="text-[14px] text-ink-faded">该区域暂无收录地点</p>
                <p className="text-[12px] text-ink-faded/60 mt-1">换个城市或类型，也许会发现新的宠物友好空间</p>
              </div>
            ) : (
              places.map((place) => {
                const tags = getPlaceTags(place);
                return (
                  <Link
                    key={place.id}
                    href={`/map/${place.id}`}
                    className="block bg-surface-white rounded-[10px] shadow-sm mb-3 overflow-hidden active:scale-[0.98]
                      hover:shadow-md transition-shadow duration-150"
                  >
                    {/* Top row: icon + info + distance */}
                    <div className="flex items-start gap-3 p-3.5">
                      {/* Left: type icon in IconBadge */}
                      <IconBadge
                        icon={TYPE_ICON_MAP[place.type] || <MapPin className="w-4 h-4" />}
                        variant={TYPE_VARIANT_MAP[place.type] || 'teal'}
                        size="md"
                      />

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

                    {/* Bottom: trust tags (max 3) */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
                        {tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant={tag.variant} size="sm">{tag.label}</Badge>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          /* ========== MAP VIEW ========== */
          <div>
            {/* Map placeholder using MapPlaceholder component */}
            <div className="rounded-[12px] h-[400px] relative overflow-hidden">
              <MapPlaceholder />

              {/* Fake marker dots */}
              {places.slice(0, 4).map((place, i) => {
                const positions = [
                  { top: '25%', left: '30%' },
                  { top: '40%', left: '60%' },
                  { top: '55%', left: '20%' },
                  { top: '65%', left: '50%' },
                ];
                return (
                  <button
                    key={place.id}
                    className="absolute cursor-pointer bg-transparent border-0 p-0"
                    style={{ top: positions[i].top, left: positions[i].left }}
                    onClick={() => handlePlaceClick(place)}
                    aria-label={`查看 ${place.name} 详情`}
                  >
                    <div className="w-3.5 h-3.5 bg-teal-500 rounded-full shadow-[0_0_0_3px_rgba(29,138,128,0.2)]" />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-white text-[11px] px-2 py-0.5 rounded-[6px] shadow-md whitespace-nowrap text-ink font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      {place.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Place list below the map */}
            <div className="mt-4 space-y-2">
              <p className="text-[12px] text-ink-faded px-1">附近地点</p>
              {places.slice(0, 5).map((place) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className="w-full text-left flex items-center gap-3 p-3 bg-surface-white rounded-[10px] shadow-sm
                    active:scale-[0.98] hover:shadow-md transition-shadow duration-150 cursor-pointer border-0"
                  aria-label={`查看 ${place.name} 详情`}
                >
                  <IconBadge
                    icon={TYPE_ICON_MAP[place.type] || <MapPin className="w-3.5 h-3.5" />}
                    variant={TYPE_VARIANT_MAP[place.type] || 'teal'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-ink truncate">{place.name}</p>
                    <p className="text-[12px] text-ink-faded truncate">{place.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StarRating rating={place.rating} />
                    <span className="text-[12px] text-ink-faded">{mockDistance(place.id)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-faded/40 shrink-0" />
                </button>
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
            <div className="h-36">
              <MapPlaceholder />
            </div>

            <div className="p-5 space-y-4">
              {/* Type badge + rating */}
              <div className="flex items-center gap-2">
                <Badge variant="teal" size="md">
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
                  <Badge variant="default" size="sm">休息中</Badge>
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
                <div className="flex items-start gap-2 text-[13px] text-teal-500">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{selectedPlace.phone}</span>
                </div>
              )}

              {/* Pet friendly trust tags in modal */}
              {(() => {
                const modalTags = getPlaceTags(selectedPlace);
                return modalTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {modalTags.map((tag, i) => (
                      <Badge key={i} variant={tag.variant} size="sm">{tag.label}</Badge>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('导航功能将在接入高德地图后启用');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-500 text-white text-[14px] rounded-[8px] font-medium hover:bg-teal-600 transition"
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
