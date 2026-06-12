'use client';

import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui';
import { PetForm } from '@/components/pet/PetForm';
import type { PetFormData } from '@/components/pet/PetForm';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const CITIES: Record<string, { lat: number; lng: number; districts: string[] }> = {
  '北京': { lat: 39.9042, lng: 116.4074, districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区', '大兴区'] },
  '上海': { lat: 31.2304, lng: 121.4737, districts: ['黄浦区', '徐汇区', '静安区', '浦东新区', '长宁区', '普陀区', '虹口区', '杨浦区'] },
  '深圳': { lat: 22.5431, lng: 114.0579, districts: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区', '龙华区'] },
};

const INTEREST_OPTIONS = [
  { key: 'find-friends', label: '找朋友' },
  { key: 'pet-friendly', label: '宠物友好地点' },
  { key: 'health', label: '健康管理' },
  { key: 'playdate', label: '约玩' },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [newPetId, setNewPetId] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [completing, setCompleting] = useState(false);

  const totalSteps = 4;

  // Step 2: Create pet handler
  const handleCreatePet = async (data: PetFormData) => {
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || '创建宠物失败');
    }
    const result = await res.json();
    setNewPetId(result.pet?.id || result.id);
    setStep(2);
  };

  // Step 3: Save location handler
  const handleSelectCity = async (city: string) => {
    if (!newPetId) return;
    setSelectedCity(city);
    setSavingLocation(true);
    try {
      const info = CITIES[city];
      await fetch(`/api/pets/${newPetId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          district: info.districts[0],
          lat: info.lat,
          lng: info.lng,
        }),
      });
      setStep(3);
    } catch {
      // still advance even if location save fails
      setStep(3);
    } finally {
      setSavingLocation(false);
    }
  };

  // Step 4: Complete handler
  const handleComplete = () => {
    setCompleting(true);
    onComplete();
  };

  // Toggle interest chip
  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-sm px-4 py-6 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-[400px] max-h-[calc(100vh-3rem)] overflow-y-auto bg-surface-white rounded-[14px] shadow-sm mx-auto sm:my-0">
        {/* Step dots + progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? 'bg-teal-500 scale-110'
                    : i < step
                    ? 'bg-teal-500/60'
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-surface-alt rounded-full mb-1">
            <div
              className="h-1 bg-teal-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 pt-4">
          {/* ===== Step 1: Welcome ===== */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-5">
                <PawPrint className="w-[56px] h-[56px] text-teal-500" />
              </div>
              <h2 className="text-[20px] font-semibold text-ink mb-2">欢迎来到 PetPal</h2>
              <p className="text-[14px] text-ink-muted mb-8 leading-relaxed">
                和毛孩子一起探索世界
              </p>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep(1)}
              >
                开始
              </Button>
            </div>
          )}

          {/* ===== Step 2: Create Pet ===== */}
          {step === 1 && (
            <div>
              <h3 className="text-[17px] font-semibold text-ink mb-1 text-center">
                添加你的宠物
              </h3>
              <p className="text-[13px] text-ink-muted mb-4 text-center">
                介绍一下你的毛孩子吧
              </p>
              <PetForm
                onSubmit={handleCreatePet}
                submitLabel="创建宠物"
              />
              <button
                type="button"
                onClick={onComplete}
                className="w-full text-center text-[13px] text-ink-faded hover:text-ink-muted mt-3 py-2 transition-colors"
              >
                稍后再说
              </button>
            </div>
          )}

          {/* ===== Step 3: Choose City ===== */}
          {step === 2 && (
            <div>
              <h3 className="text-[17px] font-semibold text-ink mb-1 text-center">
                选择你的城市
              </h3>
              <p className="text-[13px] text-ink-muted mb-5 text-center">
                方便找到附近的小伙伴和友好地点
              </p>
              <div className="space-y-3">
                {Object.entries(CITIES).map(([city, info]) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    disabled={savingLocation}
                    className={`w-full text-left p-4 rounded-[12px] border-2 transition-all ${
                      selectedCity === city
                        ? 'border-teal-500 bg-teal-50/50'
                        : 'border-border hover:border-teal-500/40 hover:bg-surface-alt'
                    } ${savingLocation ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[16px] font-medium text-ink">{city}</span>
                      <span className="text-[13px] text-ink-muted">
                        {info.districts.length} 个区域
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {savingLocation && (
                <p className="text-[13px] text-ink-muted text-center mt-4">
                  正在保存位置...
                </p>
              )}
            </div>
          )}

          {/* ===== Step 4: Interests ===== */}
          {step === 3 && (
            <div>
              <h3 className="text-[17px] font-semibold text-ink mb-1 text-center">
                你对什么感兴趣？
              </h3>
              <p className="text-[13px] text-ink-muted mb-5 text-center">
                告诉我们你想要的，帮你定制专属体验
              </p>
              <div className="flex flex-wrap gap-2.5 justify-center mb-6">
                {INTEREST_OPTIONS.map((opt) => {
                  const isSelected = selectedInterests.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleInterest(opt.key)}
                      className={`px-4 py-2.5 text-[14px] rounded-[10px] border transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-600 font-medium'
                          : 'border-border text-ink-muted hover:border-teal-500/40 hover:text-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <Button
                className="w-full"
                size="lg"
                loading={completing}
                onClick={handleComplete}
              >
                完成
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
