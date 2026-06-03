'use client';

import {
  MapPin,
  Star,
  Stethoscope,
  TreePine,
  ShoppingBag,
  Coffee,
  UtensilsCrossed,
  Scissors,
  Home,
  Search,
} from 'lucide-react';
import { Badge, IconBadge, SegmentedControl } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Shared Place interface (mirrors /api/places response)              */
/* ------------------------------------------------------------------ */
export interface Place {
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

/* ------------------------------------------------------------------ */
/*  Icon / label / variant lookups                                    */
/* ------------------------------------------------------------------ */
const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  HOSPITAL: <Stethoscope className="w-4 h-4" />,
  PARK: <TreePine className="w-4 h-4" />,
  MALL: <ShoppingBag className="w-4 h-4" />,
  CAFE: <Coffee className="w-4 h-4" />,
  RESTAURANT: <UtensilsCrossed className="w-4 h-4" />,
  GROOMING: <Scissors className="w-4 h-4" />,
  BOARDING: <Home className="w-4 h-4" />,
};

const TYPE_VARIANT_MAP: Record<string, 'teal' | 'sea' | 'sage' | 'amber' | 'rose'> = {
  HOSPITAL: 'rose',
  PARK: 'sage',
  MALL: 'teal',
  CAFE: 'teal',
  RESTAURANT: 'teal',
  GROOMING: 'sea',
  BOARDING: 'sea',
};

/* ------------------------------------------------------------------ */
/*  Exported helper – build trust tags from a Place                   */
/* ------------------------------------------------------------------ */
export function getPlaceTags(
  place: Place,
): { label: string; variant: 'sage' | 'sea' | 'teal' | 'amber' | 'rose' }[] {
  const tags: { label: string; variant: 'sage' | 'sea' | 'teal' | 'amber' | 'rose' }[] = [];
  if (place.petFriendlyTags?.includes('可带宠入内')) tags.push({ label: '可入内', variant: 'sage' });
  if (place.petFriendlyTags?.includes('提供饮水')) tags.push({ label: '有饮水', variant: 'sea' });
  if (place.petFriendlyTags?.includes('超大草坪')) tags.push({ label: '有草坪', variant: 'sage' });
  if (place.petFriendlyTags?.includes('24小时急诊')) tags.push({ label: '24h急诊', variant: 'rose' });
  if (place.petFriendlyTags?.includes('SPA护理')) tags.push({ label: 'SPA', variant: 'sea' });
  if (place.petFriendlyTags?.includes('有草坪')) tags.push({ label: '有草坪', variant: 'sage' });
  // Type-based tags
  if (place.type === 'HOSPITAL') tags.push({ label: '专业医疗', variant: 'teal' });
  if (place.type === 'PARK') tags.push({ label: '户外空间', variant: 'sage' });
  if (place.type === 'CAFE' || place.type === 'RESTAURANT') tags.push({ label: '餐饮', variant: 'amber' });
  return tags;
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                     */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Skeleton row for loading state                                    */
/* ------------------------------------------------------------------ */
function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border-light animate-pulse">
      <div className="w-10 h-10 rounded-[9px] bg-surface-alt shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-surface-alt rounded w-3/5" />
        <div className="flex gap-1.5">
          <div className="h-[18px] w-12 bg-surface-alt rounded-[5px]" />
          <div className="h-[18px] w-12 bg-surface-alt rounded-[5px]" />
        </div>
        <div className="h-3 bg-surface-alt rounded w-4/5" />
      </div>
      <div className="shrink-0 space-y-1 text-right">
        <div className="h-3 bg-surface-alt rounded w-10 ml-auto" />
        <div className="h-[18px] w-12 bg-surface-alt rounded-[5px] ml-auto" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */
interface MapBottomSheetProps {
  places: Place[];
  loading: boolean;
  onPlaceClick: (id: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function MapBottomSheet({ places, loading, onPlaceClick }: MapBottomSheetProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 max-w-mobile mx-auto
        bg-surface-white rounded-t-[18px]
        shadow-[0_-8px_32px_rgba(0,0,0,0.08)]
        animate-slide-up"
    >
      {/* Drag handle */}
      <div className="flex justify-center">
        <div className="w-10 h-1 bg-border rounded-full my-2.5" />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-ink">附近地点</h2>
          {!loading && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
              text-[11px] font-medium text-ink-faded bg-surface-alt rounded-full">
              {places.length}
            </span>
          )}
        </div>
        {/* SegmentedControl mini stays — cosmetic toggle does not affect layout */}
        <SegmentedControl
          options={[
            { key: 'list', label: '列表' },
            { key: 'map', label: '地图' },
          ]}
          activeKey="list"
          onChange={() => {}}
        />
      </div>

      {/* Scrollable place cards */}
      <div className="max-h-[45vh] overflow-y-auto">
        {loading ? (
          /* ---------- loading skeleton ---------- */
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : places.length === 0 ? (
          /* ---------- empty ---------- */
          <div className="text-center py-12 px-4">
            <Search className="w-10 h-10 text-ink-faded/30 mx-auto mb-3" />
            <p className="text-[14px] text-ink-faded font-medium">
              该区域暂无宠物友好地点
            </p>
            <p className="text-[12px] text-ink-faded/60 mt-1">
              换个城市或类型，也许会发现新的宠物友好空间
            </p>
          </div>
        ) : (
          /* ---------- place cards ---------- */
          places.map((place, idx) => {
            const tags = getPlaceTags(place);
            const isLast = idx === places.length - 1;
            return (
              <button
                key={place.id}
                onClick={() => onPlaceClick(place.id)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3
                  ${isLast ? '' : 'border-b border-border-light'}
                  active:bg-surface-alt/50 transition-colors duration-100
                  cursor-pointer border-0 bg-transparent`}
                aria-label={`查看 ${place.name} 详情`}
              >
                {/* Left: type circle icon */}
                <IconBadge
                  icon={TYPE_ICON_MAP[place.type] || <MapPin className="w-4 h-4" />}
                  variant={TYPE_VARIANT_MAP[place.type] || 'teal'}
                  size="md"
                />

                {/* Center: name, tags, address */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-ink truncate">{place.name}</p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant={tag.variant} size="sm">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-[12px] text-ink-faded truncate mt-1.5">
                    {place.address}
                  </p>
                </div>

                {/* Right: distance + open badge + star rating */}
                <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                  <span className="text-[12px] text-ink-faded">
                    {mockDistance(place.id)}
                  </span>
                  <Badge
                    variant={place.isOpen ? 'sage' : 'default'}
                    size="sm"
                  >
                    {place.isOpen ? '营业中' : '休息中'}
                  </Badge>
                  <StarRating rating={place.rating} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
