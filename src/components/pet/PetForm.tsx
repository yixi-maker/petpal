'use client';

import { useState } from 'react';
import { Button, Input, Avatar } from '@/components/ui';

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

export function PetForm({ initialData, onSubmit, submitLabel }: PetFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'DOG');
  const [breed, setBreed] = useState(initialData?.breed || '');
  const [birthday, setBirthday] = useState(initialData?.birthday?.split('T')[0] || '');
  const [gender, setGender] = useState(initialData?.gender || 'UNKNOWN');
  const [size, setSize] = useState(initialData?.size || 'MEDIUM');
  const [tagsInput, setTagsInput] = useState((initialData?.personalityTags || []).join('、'));
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatar, setAvatar] = useState(initialData?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('请输入宠物昵称'); return; }
    setLoading(true);
    const tags = tagsInput.split(/[,，、]/).map(t => t.trim()).filter(Boolean);
    await onSubmit({ name, type, breed, birthday, gender, size, personalityTags: tags, bio, avatar });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-center mb-4">
        <Avatar src={avatar} size="xl" />
      </div>

      <Input label="头像链接" placeholder="可选，输入图片 URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} />

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

      <Button type="submit" className="w-full" loading={loading}>{submitLabel}</Button>
    </form>
  );
}
