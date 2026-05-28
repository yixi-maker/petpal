'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  Clock,
  Phone,
  Send,
} from 'lucide-react';
import { Avatar, Button, Badge } from '@/components/ui';

interface ReviewPet {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  avatar: string | null;
}

interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  pet: ReviewPet;
}

interface PlaceDetail {
  id: number;
  name: string;
  type: string;
  city: string;
  district: string | null;
  lat: number;
  lng: number;
  address: string;
  phone: string | null;
  rating: number;
  isOpen: boolean;
  openHours: string | null;
  petFriendlyTags: string[];
  reviewCount: number;
  reviews: Review[];
}

interface UserPet {
  id: number;
  name: string;
  type: string;
  avatar: string | null;
}

const TYPE_ICON_MAP: Record<string, React.ReactNode> = {
  HOSPITAL: <Stethoscope className="w-4 h-4" />,
  PARK: <TreePine className="w-4 h-4" />,
  MALL: <ShoppingBag className="w-4 h-4" />,
  CAFE: <Coffee className="w-4 h-4" />,
  RESTAURANT: <UtensilsCrossed className="w-4 h-4" />,
  GROOMING: <Scissors className="w-4 h-4" />,
  BOARDING: <Home className="w-4 h-4" />,
};

const TYPE_CIRCLE_MAP: Record<string, string> = {
  HOSPITAL: 'bg-rose-50 text-rose-500',
  PARK: 'bg-sage-50 text-sage-500',
  MALL: 'bg-teal-50 text-teal-500',
  CAFE: 'bg-teal-50 text-teal-500',
  RESTAURANT: 'bg-teal-50 text-teal-500',
  GROOMING: 'bg-sea-50 text-sea-500',
  BOARDING: 'bg-sea-50 text-sea-500',
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

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${
            star <= rating
              ? 'text-amber-500 fill-amber-500'
              : 'text-ink-faded/30'
          }`}
        />
      ))}
      <span className={`${size === 'md' ? 'text-[14px]' : 'text-[12px]'} text-ink-faded ml-1`}>{rating}</span>
    </div>
  );
}

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPlace = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/places/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlace(data.place);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserPets = useCallback(async () => {
    try {
      const res = await fetch('/api/pets');
      if (res.ok) {
        const data = await res.json();
        setUserPets(data.pets || []);
        if (data.pets?.length > 0) {
          setSelectedPetId(data.pets[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPlace();
    fetchUserPets();
  }, [fetchPlace, fetchUserPets]);

  const handleSubmitReview = async () => {
    setError('');
    if (!selectedPetId) {
      setError('请先创建宠物');
      return;
    }
    if (!reviewContent.trim()) {
      setError('请输入评价内容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/places/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: selectedPetId,
          rating: reviewRating,
          content: reviewContent.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Add the new review to the list
        if (place) {
          setPlace({
            ...place,
            reviews: [data.review, ...place.reviews],
            reviewCount: place.reviewCount + 1,
          });
        }
        setReviewContent('');
        setReviewRating(5);
      } else {
        const data = await res.json();
        setError(data.error || '提交失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <MapPin className="w-12 h-12 text-ink-faded/30 mb-4" />
        <p className="text-[15px] text-ink-faded font-medium">地点不存在</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-teal-500 text-[14px]"
        >
          返回上页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header with back button */}
      <div className="sticky top-0 bg-surface z-20 px-4 py-3 flex items-center gap-3 border-b border-border-light">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-surface-alt rounded-[8px] transition-colors"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5 text-ink-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold text-ink truncate">地点详情</h1>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="h-[200px] bg-gradient-to-br from-sea-50 to-surface-alt flex items-center justify-center relative">
        <div className="text-center">
          <MapPin className="w-10 h-10 text-ink-faded/30 mx-auto mb-2" />
          <p className="text-[14px] text-ink-faded">接入高德地图后显示位置</p>
        </div>
        {/* AMAP integration point: replace the above div with an actual map component */}
      </div>

      <div className="px-4 py-4 space-y-4 max-w-mobile mx-auto">
        {/* Place info card */}
        <div className="bg-surface-white rounded-[12px] p-4 shadow-card">
          {/* Name + type badge */}
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={`w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0 ${
                TYPE_CIRCLE_MAP[place.type] || 'bg-surface-alt text-ink-faded'
              }`}
            >
              {TYPE_ICON_MAP[place.type] || <MapPin className="w-3.5 h-3.5" />}
            </div>
            <h2 className="text-[20px] font-semibold text-ink truncate">{place.name}</h2>
            <Badge variant="teal" size="sm">{TYPE_LABEL_MAP[place.type]}</Badge>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-3">
            <StarRating rating={place.rating} size="md" />
            <span className="text-[14px] text-ink-faded">{place.reviewCount} 条评价</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-[14px] text-ink-muted mb-3">
            <Clock className="w-4 h-4" />
            {place.isOpen ? (
              <Badge variant="sage" size="sm">营业中</Badge>
            ) : (
              <Badge variant="default" size="sm">休息中</Badge>
            )}
            {place.openHours && <span>{place.openHours}</span>}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-[14px] text-ink-muted mb-3">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-ink-faded" />
            <span>{place.address}</span>
          </div>

          {/* Phone */}
          {place.phone && (
            <div className="flex items-start gap-2 text-[14px] text-ink-muted mb-3">
              <Phone className="w-4 h-4 shrink-0 mt-0.5 text-ink-faded" />
              <span>{place.phone}</span>
            </div>
          )}

          {/* Pet friendly tags */}
          {place.petFriendlyTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {place.petFriendlyTags.map((tag, i) => (
                <Badge key={i} variant="teal" size="sm">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Navigate button */}
          <Button
            variant="outline"
            onClick={() => alert('导航功能将在接入高德地图后启用，需要配置 AMAP_KEY 环境变量')}
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-1.5" />
            导航到此
          </Button>
        </div>

        {/* Reviews section */}
        <div className="bg-surface-white rounded-[12px] p-4 shadow-card">
          <h2 className="text-[15px] font-semibold text-ink mb-4">
            用户评价 ({place.reviewCount})
          </h2>

          {place.reviews.length === 0 ? (
            <p className="text-[14px] text-ink-faded text-center py-6">暂无评价，来写第一条吧</p>
          ) : (
            <div className="space-y-4">
              {place.reviews.map((review) => (
                <div key={review.id} className="flex gap-3">
                  <Avatar
                    src={review.pet.avatar}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-ink">{review.pet.name}</span>
                      <span className="text-[12px] text-ink-faded">
                        {review.pet.breed || review.pet.type}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-[14px] text-ink-muted mt-1.5 leading-relaxed">
                      {review.content}
                    </p>
                    <p className="text-[12px] text-ink-faded mt-1">
                      {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add review form */}
        <div className="bg-surface-white rounded-[12px] p-4 shadow-card">
          <h2 className="text-[15px] font-semibold text-ink mb-4">写评价</h2>

          {userPets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[14px] text-ink-faded">请先创建宠物后发表评价</p>
              <button
                onClick={() => router.push('/pets/new')}
                className="mt-2 text-[14px] text-teal-500 font-medium"
              >
                去创建宠物
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pet selector */}
              <div>
                <label className="text-[13px] font-medium text-ink-muted mb-1.5 block">使用宠物身份</label>
                <div className="flex gap-2">
                  {userPets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => setSelectedPetId(pet.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-[8px] border transition-colors ${
                        selectedPetId === pet.id
                          ? 'border-teal-500 bg-teal-50 text-teal-500'
                          : 'border-border text-ink-muted hover:border-ink-faded/30 hover:text-ink'
                      }`}
                    >
                      <Avatar src={pet.avatar} size="sm" />
                      {pet.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating selector */}
              <div>
                <label className="text-[13px] font-medium text-ink-muted mb-1.5 block">评分</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 transition"
                      aria-label={`${star} 星`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-ink-faded/25'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-[13px] font-medium text-ink-muted mb-1.5 block">评价内容</label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="分享一下你的体验吧..."
                  className="w-full px-3.5 py-2.5 text-[14px] text-ink bg-surface-white border border-border
                    rounded-[8px] placeholder:text-ink-faded/50
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
                    transition duration-150 resize-none"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[12px] text-ink-faded">{reviewContent.length}/500</span>
                  {error && <span className="text-[12px] text-rose-500">{error}</span>}
                </div>
              </div>

              <Button
                onClick={handleSubmitReview}
                loading={submitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-1.5" />
                发布评价
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}
