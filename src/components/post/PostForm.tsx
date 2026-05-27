'use client';

import { useState } from 'react';
import { usePet } from '@/contexts/PetContext';
import { Button, Avatar } from '@/components/ui';
import { Image, MapPin, Send } from 'lucide-react';

interface PostFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function PostForm({ onSuccess, onClose }: PostFormProps) {
  const { currentPet } = usePet();
  const [content, setContent] = useState('');
  const [fuzzyLocation, setFuzzyLocation] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const maxLength = 500;
  const charCount = content.length;

  const handleSubmit = async () => {
    if (!currentPet) {
      setError('请先创建宠物');
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      setError('请输入内容');
      return;
    }

    if (trimmed.length > maxLength) {
      setError(`内容不能超过${maxLength}字`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const images = imageUrls
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, i) => ({ url, order: i }));

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorPetId: currentPet.id,
          content: trimmed,
          mediaType: images.length > 0 ? 'IMAGE' : 'TEXT',
          fuzzyLocation: fuzzyLocation.trim() || undefined,
          images: images.length > 0 ? images : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '发布失败');
      }

      setContent('');
      setFuzzyLocation('');
      setImageUrls('');
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  if (!currentPet) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        请先创建宠物后再发布动态
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={currentPet.avatar} size="md" />
        <div>
          <div className="text-sm font-medium text-gray-800">{currentPet.name}</div>
          <div className="text-xs text-gray-400">{currentPet.breed || currentPet.type}</div>
        </div>
      </div>

      {/* Content textarea */}
      <textarea
        className="w-full min-h-[120px] p-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-brand-300 placeholder-gray-300"
        placeholder="分享毛孩子的日常..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={maxLength}
      />
      <div className={`text-right text-xs mb-3 ${charCount > maxLength ? 'text-red-500' : 'text-gray-400'}`}>
        {charCount}/{maxLength}
      </div>

      {/* Image URLs input */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Image className="w-4 h-4" />
          <span>图片链接（用逗号分隔多个链接）</span>
        </div>
        <input
          type="text"
          className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-300 placeholder-gray-300"
          placeholder="https://..."
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
        />
      </div>

      {/* Fuzzy location input */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <MapPin className="w-4 h-4" />
          <span>模糊位置（如：朝阳区 / 家附近）</span>
        </div>
        <input
          type="text"
          className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-300 placeholder-gray-300"
          placeholder="可选"
          value={fuzzyLocation}
          onChange={(e) => setFuzzyLocation(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-500 mb-3">{error}</div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={!content.trim()}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" />
        发布
      </Button>
    </div>
  );
}
