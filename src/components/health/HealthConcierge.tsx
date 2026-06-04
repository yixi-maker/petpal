'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { AIResultCard } from '@/components/health/AIResultCard';
import { AlertTriangle, Camera, ChevronDown, ChevronUp, ClipboardList, MapPin, SendHorizontal, ShieldCheck, Stethoscope } from 'lucide-react';
import type { AITriageResult } from '@/lib/ai-provider';

interface HealthConciergeProps {
  currentPet: { id: number; name: string; type: string; avatar?: string | null } | null;
  lastTriageResult?: AITriageResult | null;
  onStartTriage: () => void;
  onToggleEmergency: () => void;
  onToggleChecklist: () => void;
}

const riskBadgeConfig = {
  LOW: { label: '低风险', bg: 'bg-sage-100', text: 'text-sage-600' },
  MEDIUM: { label: '中风险', bg: 'bg-amber-50', text: 'text-amber-500' },
  HIGH: { label: '高风险', bg: 'bg-rose-50', text: 'text-rose-500' },
};

export function HealthConcierge({
  currentPet,
  lastTriageResult,
  onStartTriage,
  onToggleEmergency,
  onToggleChecklist,
}: HealthConciergeProps) {
  const [resultExpanded, setResultExpanded] = useState(false);

  const petType =
    currentPet?.type === 'DOG' || currentPet?.type === 'CAT'
      ? (currentPet.type as 'DOG' | 'CAT')
      : undefined;

  return (
    <div className="space-y-4">
      {/* ===== a) AI Greeting Hero ===== */}
      <div className="petpal-glass relative overflow-hidden rounded-[30px] p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(122,174,198,0.32),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.76),rgba(232,245,241,0.58))]" />
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full border border-white/70 bg-white/20" />
        {currentPet ? (
          <div className="relative">
            <div className="mb-5 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="mb-6 text-[12px] font-semibold text-teal-700/78">AI Health Assistant</p>
                <h2 className="text-[22px] font-semibold leading-tight text-ink">
                  Hi，我来帮你。
                </h2>
                <p className="mt-1 max-w-[210px] text-[13px] leading-relaxed text-ink-muted">
                  描述 {currentPet.name} 的症状，上传图片后获得初步分诊和风险判断。
                </p>
              </div>
              <div className="relative shrink-0">
                <Avatar
                  src={currentPet.avatar}
                  petType={petType}
                  size="xl"
                  className="h-[86px] w-[86px] rounded-full border-4 border-white/82 shadow-[0_16px_34px_rgba(16,80,75,0.16)]"
                />
                <span className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-600 text-white shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/74 bg-white/64 p-2.5 shadow-[0_12px_28px_rgba(16,80,75,0.10)] backdrop-blur-xl">
              <button
                type="button"
                onClick={onStartTriage}
                className="flex w-full items-center gap-2 rounded-[18px] bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-teal-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Camera className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink-faded">描述症状或上传图片...</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
                  <SendHorizontal className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/74 text-teal-600 shadow-[0_12px_26px_rgba(16,80,75,0.10)]">
              <Stethoscope className="w-7 h-7" />
            </div>
            <p className="text-[15px] font-semibold text-ink">
              请先在「我的」选择宠物
            </p>
            <Link
              href="/me"
              className="mt-4 inline-block rounded-full bg-teal-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(29,138,128,0.22)] transition-colors hover:bg-teal-700"
            >
              去选择 &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* ===== b) Last Triage Result Card or CTA ===== */}
      {lastTriageResult ? (
        <div className="overflow-hidden rounded-[24px] border border-white/72 bg-white/78 shadow-[0_14px_34px_rgba(16,80,75,0.10)] backdrop-blur-xl">
          {/* Brief summary header */}
          <button
            onClick={() => setResultExpanded(!resultExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-alt/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              {(() => {
                const cfg = riskBadgeConfig[lastTriageResult.riskLevel];
                return (
                  <span
                    className={`px-3 py-1 rounded-full text-[13px] font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.label}
                  </span>
                );
              })()}
              <span className="text-[14px] text-ink-muted truncate">
                {lastTriageResult.shouldSeeVet ? '建议就医' : '居家观察'}
              </span>
            </div>
            <span className="text-[13px] text-teal-500 font-medium flex items-center gap-1 shrink-0 ml-2">
              {resultExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>

          {/* Expanded full result */}
          {resultExpanded && (
            <div className="px-4 pb-4">
              <AIResultCard result={lastTriageResult} />
            </div>
          )}
        </div>
      ) : currentPet ? (
        <div className="rounded-[20px] border border-white/70 bg-white/68 p-3 shadow-[0_12px_28px_rgba(16,80,75,0.08)] backdrop-blur-xl">
          <p className="text-center text-[12px] leading-relaxed text-ink-faded">
            AI 仅做初步分诊参考；如出现持续呕吐、呼吸异常、外伤或精神极差，请优先就医。
          </p>
        </div>
      ) : null}

      {/* ===== c) Quick Actions Row ===== */}
      {currentPet && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onToggleEmergency}
            className="min-w-[80px] rounded-[18px] bg-rose-50/76 border border-rose-100 px-2.5 py-3 text-center shadow-[0_8px_18px_rgba(220,74,74,0.06)]
              transition-all duration-150 hover:bg-rose-50 active:scale-[0.97]"
          >
            <AlertTriangle className="mx-auto mb-1 h-[14px] w-[14px] text-rose-500" />
            <span className="text-[11px] font-medium text-rose-600">急诊速查</span>
          </button>
          <button
            onClick={onToggleChecklist}
            className="min-w-[80px] rounded-[18px] bg-sea-50/76 border border-sea-100 px-2.5 py-3 text-center shadow-[0_8px_18px_rgba(80,144,173,0.06)]
              transition-all duration-150 hover:bg-sea-50 active:scale-[0.97]"
          >
            <ClipboardList className="mx-auto mb-1 h-[14px] w-[14px] text-sea-500" />
            <span className="text-[11px] font-medium text-sea-600">就医准备</span>
          </button>
          <Link
            href="/map?type=HOSPITAL"
            className="min-w-[80px] rounded-[18px] bg-teal-50/76 border border-teal-100 px-2.5 py-3 text-center shadow-[0_8px_18px_rgba(29,138,128,0.06)]
              transition-all duration-150 hover:bg-teal-50 active:scale-[0.97]"
          >
            <MapPin className="mx-auto mb-1 h-[14px] w-[14px] text-teal-500" />
            <span className="text-[11px] font-medium text-teal-600">附近医院</span>
          </Link>
        </div>
      )}
    </div>
  );
}
