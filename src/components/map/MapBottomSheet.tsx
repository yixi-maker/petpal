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
import { Badge, IconBadge } from '@/components/ui';

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
    <div className="flex items-start gap-3 px-3.5 py-3 border-b border-border-light animate-pulse">
      <div className="w-[36px] h-[36px] rounded-[9px] bg-surface-alt shrink-0" />
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
        rounded-t-[30px] border-x border-t border-white/70 bg-white/80 backdrop-blur-2xl
        shadow-[0_-24px_56px_rgba(16,80,75,0.18)]
        animate-slide-up"
    >
      {/* Drag handle — thinner, softer */}
      <div className="flex justify-center">
        <div className="my-2 w-8 h-[3px] rounded-full bg-border/60" />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-ink">附近地点</h2>
          {!loading && (
            <span className="inline-flex items-center justify-center text-[11px] text-ink-faded bg-surface-alt px-2 py-0.5 rounded-full">
              {places.length}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable place cards */}
      <div className="max-h-[42vh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+92px)]">
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
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Search className="w-6 h-6 text-teal-500/30 mb-3" />
            <p className="text-[14px] text-ink-faded font-medium">
              该区域暂无宠物友好地点
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
                className={`w-full flex items-start gap-3 px-3.5 py-3 text-left
                  border-b border-border-light active:bg-surface-alt transition-colors
                  ${isLast ? 'border-0' : ''}`}
                aria-label={`查看 ${place.name} 详情`}
              >
                {/* Left: IconBadge 36px */}
                <IconBadge
                  icon={TYPE_ICON_MAP[place.type] || <MapPin className="w-4 h-4" />}
                  variant={TYPE_VARIANT_MAP[place.type] || 'teal'}
                  size="md"
                  className="shrink-0 !w-[36px] !h-[36px]"
                />

                {/* Center column */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink truncate">
                    {place.name}
                  </p>

                  {tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant={tag.variant} size="sm">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="mt-1 text-[12px] text-ink-faded truncate max-w-[200px]">
                    {place.address}
                  </p>
                </div>

                {/* Right column */}
                <div className="shrink-0 flex flex-col items-end gap-1">
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
