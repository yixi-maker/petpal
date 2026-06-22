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
  Navigation,
} from 'lucide-react';
import { Badge } from '@/components/ui';

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

const TYPE_THUMB_MAP: Record<string, string> = {
  HOSPITAL: 'from-rose-50 via-white to-teal-50',
  PARK: 'from-sage-100 via-white to-sea-100',
  MALL: 'from-teal-50 via-white to-sage-50',
  CAFE: 'from-amber-50 via-white to-teal-50',
  RESTAURANT: 'from-amber-50 via-white to-sage-50',
  GROOMING: 'from-sea-100 via-white to-teal-50',
  BOARDING: 'from-sage-50 via-white to-sea-100',
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
          className={`w-3 h-3 ${
            star <= rating
              ? 'text-amber-500 fill-amber-500'
              : star - 0.5 <= rating
              ? 'text-amber-500 fill-amber-500'
              : 'text-ink-faded/30'
          }`}
        />
      ))}
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
    <div className="mx-3 mb-2 flex animate-pulse items-start gap-3 rounded-[18px] bg-white/60 p-2">
      <div className="h-[62px] w-[82px] shrink-0 rounded-[14px] bg-surface-alt" />
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
      className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 max-w-mobile mx-auto
        rounded-t-[32px] border-x border-t border-white/76 bg-white/82 backdrop-blur-2xl
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
          <h2 className="text-[14px] font-semibold text-ink">附近宠物友好地点</h2>
          {!loading && (
            <span className="inline-flex items-center justify-center text-[11px] text-ink-faded bg-surface-alt px-2 py-0.5 rounded-full">
              {places.length}
            </span>
          )}
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700"
          aria-label="导航"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable place cards */}
      <div className="max-h-[44vh] overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+96px)]">
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
                className={`mb-2 w-full rounded-[20px] border border-white/72 bg-white/72 p-2 text-left shadow-[0_10px_24px_rgba(16,80,75,0.08)] backdrop-blur-xl transition-all active:scale-[0.99] active:bg-white/88
                  ${isLast ? 'mb-0' : ''}`}
                aria-label={`查看 ${place.name} 详情`}
              >
                <div className="flex items-stretch gap-3">
                  <div className={`flex h-[72px] w-[92px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${TYPE_THUMB_MAP[place.type] || 'from-teal-50 via-white to-sea-50'} text-teal-700 shadow-inner`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/82 text-teal-700 shadow-sm">
                      {TYPE_ICON_MAP[place.type] || <MapPin className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {place.name}
                        </p>
                        <p className="text-[11px] text-ink-faded truncate max-w-[180px] mt-0.5">
                          {place.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[12px] text-ink-faded">{mockDistance(place.id)}</span>
                        <Badge
                          variant={place.isOpen ? 'sage' : 'default'}
                          size="sm"
                        >
                          {place.isOpen ? '营业中' : '休息中'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <StarRating rating={place.rating} />
                      {tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant={tag.variant} size="sm">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
