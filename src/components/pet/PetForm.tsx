'use client';

import { useRef, useState } from 'react';
import { Button, Input, Avatar } from '@/components/ui';
import { Camera, Link as LinkIcon, Trash2, UploadCloud } from 'lucide-react';

export interface PetFormData {
  name: string;
  type: string;
  breed?: string;
  birthday?: string;
  gender?: string;
  size?: string;
  personalityTags?: string[];
  bio?: string;
  avatar?: string;
}

interface PetFormProps {
  initialData?: PetFormData;
  onSubmit: (data: PetFormData) => Promise<void>;
  submitLabel: string;
}

function normalizeDateInput(raw?: string): string {
  if (!raw) return '';
  if (/^\d+$/.test(raw)) {
    const date = new Date(Number(raw));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return raw.split('T')[0] || '';
}

export function PetForm({ initialData, onSubmit, submitLabel }: PetFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'DOG');
  const [breed, setBreed] = useState(initialData?.breed || '');
  const [birthday, setBirthday] = useState(normalizeDateInput(initialData?.birthday));
  const [gender, setGender] = useState(initialData?.gender || 'UNKNOWN');
  const [size, setSize] = useState(initialData?.size || 'MEDIUM');
  const [tagsInput, setTagsInput] = useState((initialData?.personalityTags || []).join('、'));
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatar, setAvatar] = useState(initialData?.avatar || '');
  const [avatarUploaded, setAvatarUploaded] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const petType = type === 'DOG' || type === 'CAT' ? type : undefined;

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setError('');
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '头像上传失败，请重试');
        return;
      }

      setAvatar(data.url);
      setAvatarUploaded(true);
      setTimeout(() => setAvatarUploaded(false), 2000);
    } catch {
      setError('头像上传失败，请重试');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('请输入宠物昵称'); return; }
    setLoading(true);
    const tags = tagsInput.split(/[,，、]/).map(t => t.trim()).filter(Boolean);
    try {
      await onSubmit({ name, type, breed, birthday, gender, size, personalityTags: tags, bio, avatar });
    } catch {
      setError('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_14px_34px_rgba(16,80,75,0.08)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-ink">宠物头像</p>
            <p className="mt-0.5 text-[12px] text-ink-faded">上传一张清晰的正脸照，会显示在主页和动态里</p>
          </div>
          <div className="relative">
            <Avatar
              src={avatar}
              size="xl"
              petType={petType}
              className="h-[76px] w-[76px] border-[3px] border-white shadow-[0_12px_26px_rgba(16,80,75,0.14)]"
            />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-sm">
              <Camera className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(29,138,128,0.20)] transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UploadCloud className="h-4 w-4" />
            {uploadingAvatar ? '上传中...' : avatarUploaded ? '✓ 上传成功' : avatar ? '更换图片' : '上传图片'}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={() => setAvatar('')}
              className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
              aria-label="移除头像"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
        />

        <div className="mt-3">
          <Input
            label="头像链接"
            placeholder="也可以粘贴图片 URL"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />
          <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-faded">
            <LinkIcon className="h-3 w-3" />
            支持 JPG / PNG / WebP，单张不超过 5MB
          </p>
        </div>
      </div>

      <Input label="昵称 *" placeholder="给毛孩子取个名字" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />

      <div>
        <label className="block text-sm font-medium text-ink mb-2">类型 *</label>
        <div className="flex gap-3">
          {[
            { key: 'DOG', label: '🐶 狗狗', emoji: '🐶' },
            { key: 'CAT', label: '🐱 猫猫', emoji: '🐱' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`flex-1 py-3 text-sm rounded-xl border-2 transition ${
                type === key ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-border-light text-ink-faded'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Input label="品种" placeholder="如 金毛、英短" value={breed} onChange={(e) => setBreed(e.target.value)} />

      <Input label="生日" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />

      <div>
        <label className="block text-sm font-medium text-ink mb-2">性别</label>
        <div className="flex gap-2">
          {[
            { key: 'MALE', label: '♂ 男生' },
            { key: 'FEMALE', label: '♀ 女生' },
            { key: 'UNKNOWN', label: '未知' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setGender(key)}
              className={`flex-1 py-2.5 text-sm rounded-xl border transition ${
                gender === key ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-border-light text-ink-faded'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2">体型</label>
        <div className="flex gap-2">
          {[
            { key: 'SMALL', label: '小型' },
            { key: 'MEDIUM', label: '中型' },
            { key: 'LARGE', label: '大型' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSize(key)}
              className={`flex-1 py-2.5 text-sm rounded-xl border transition ${
                size === key ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-border-light text-ink-faded'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Input label="性格标签" placeholder="如 活泼、亲人、贪吃（用逗号分隔）" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />

      <div>
        <label className="block text-sm font-medium text-ink mb-1">简介</label>
        <textarea
          className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={3}
          placeholder="介绍一下你的毛孩子..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
        />
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <Button type="submit" className="w-full" loading={loading} disabled={uploadingAvatar}>{submitLabel}</Button>
    </form>
  );
}
