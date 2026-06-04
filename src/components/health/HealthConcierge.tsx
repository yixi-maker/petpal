'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { AIResultCard } from '@/components/health/AIResultCard';
import { Stethoscope, AlertTriangle, ClipboardList, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
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
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-sage-50/40 via-surface-white to-teal-50/30 p-5 shadow-sm border border-border-light">
        {currentPet ? (
          <div className="relative">
            {/* Greeting row: text + avatar */}
            <div className="flex items-start gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-ink">
                  Hi，我来帮你判断 {currentPet.name} 的健康状况
                </h2>
                <p className="mt-1 text-[12px] text-ink-faded/70">
                  AI 健康助手 · 初步分诊参考
                </p>
              </div>
              <Avatar
                src={currentPet.avatar}
                petType={petType}
                size="md"
                className="h-[48px] w-[48px] shrink-0 rounded-full border-2 border-white/80 shadow-sm"
              />
            </div>

            {/* CTA button */}
            <button
              type="button"
              onClick={onStartTriage}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-teal-500 px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-teal-600 active:bg-teal-700"
            >
              <Stethoscope className="h-4 w-4" />
              开始一次健康分诊
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Stethoscope className="w-10 h-10 text-teal-500/30 mb-3" />
            <p className="text-[14px] text-ink-faded">
              请先在「我的」选择宠物
            </p>
            <Link
              href="/me"
              className="mt-3 inline-block rounded-full bg-teal-500 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-600"
            >
              去选择 &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* ===== b) Last Triage Result Card or CTA ===== */}
      {lastTriageResult ? (
        <div className="bg-surface-white rounded-[12px] border border-border shadow-sm overflow-hidden">
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
        <div className="rounded-[18px] border border-white/70 bg-white/75 p-3 shadow-[0_14px_34px_rgba(16,80,75,0.10)] backdrop-blur-xl">
          <p className="text-center text-[12px] leading-relaxed text-ink-faded">
            AI 仅做初步分诊参考；如出现持续呕吐、呼吸异常、外伤或精神极差，请优先就医。
          </p>
        </div>
      ) : null}

      {/* ===== c) Quick Actions Row ===== */}
      {currentPet && (
        <div className="flex gap-2">
          <button
            onClick={onToggleEmergency}
            className="flex-1 min-w-[80px] rounded-[10px] bg-rose-50/70 border border-rose-100 px-2.5 py-2.5 text-center
              transition-all duration-150 hover:bg-rose-50 active:scale-[0.97]"
          >
            <AlertTriangle className="mx-auto mb-1 h-[14px] w-[14px] text-rose-500" />
            <span className="text-[11px] font-medium text-rose-600">急诊速查</span>
          </button>
          <button
            onClick={onToggleChecklist}
            className="flex-1 min-w-[80px] rounded-[10px] bg-sea-50/70 border border-sea-100 px-2.5 py-2.5 text-center
              transition-all duration-150 hover:bg-sea-50 active:scale-[0.97]"
          >
            <ClipboardList className="mx-auto mb-1 h-[14px] w-[14px] text-sea-500" />
            <span className="text-[11px] font-medium text-sea-600">就医准备</span>
          </button>
          <Link
            href="/map?type=HOSPITAL"
            className="flex-1 min-w-[80px] rounded-[10px] bg-teal-50/70 border border-teal-100 px-2.5 py-2.5 text-center
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
