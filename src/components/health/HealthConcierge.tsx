'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, Button } from '@/components/ui';
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
      <div className="bg-gradient-to-br from-sage-50/30 via-surface-white to-teal-50/20 rounded-[16px] shadow-sm p-5">
        {currentPet ? (
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-[17px] font-semibold text-ink">
                Hi，我来帮你判断 {currentPet.name} 的健康状况
              </h2>
              <p className="text-[13px] text-ink-faded mt-1">
                AI 健康助手 · 初步分诊参考
              </p>
            </div>
            <Avatar
              src={currentPet.avatar}
              petType={petType}
              size="lg"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-[17px] font-semibold text-ink mb-2">
              AI 健康助手
            </h2>
            <p className="text-[13px] text-ink-faded">
              请先在「我的」选择宠物
            </p>
            <Link
              href="/me"
              className="inline-block mt-2 text-[13px] text-teal-500 hover:text-teal-600 font-medium transition-colors"
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
            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-surface-alt/30"
          >
            <div className="flex items-center gap-3">
              {(() => {
                const cfg = riskBadgeConfig[lastTriageResult.riskLevel];
                return (
                  <span
                    className={`px-3 py-1 rounded-full text-[13px] font-semibold ${cfg.bg} ${cfg.text}`}
                  >
                    {cfg.label}
                  </span>
                );
              })()}
              <span className="text-[14px] text-ink-muted">
                {lastTriageResult.shouldSeeVet ? '建议就医' : '居家观察'}
              </span>
            </div>
            <span className="text-[13px] text-teal-500 font-medium flex items-center gap-1 flex-shrink-0">
              查看完整结果
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
      ) : (
        <Button className="w-full" size="lg" onClick={onStartTriage}>
          <Stethoscope className="w-4 h-4 mr-2" />
          开始分诊
        </Button>
      )}

      {/* ===== c) Quick Actions Row ===== */}
      <div className="flex gap-3">
        <button
          onClick={onToggleEmergency}
          className="flex-1 bg-rose-50 rounded-[10px] px-3 py-2 flex items-center justify-center gap-1.5
            hover:bg-rose-100 active:scale-[0.97] transition-all duration-150"
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-[12px] font-medium text-rose-600">急诊速查</span>
        </button>
        <button
          onClick={onToggleChecklist}
          className="flex-1 bg-sea-50 rounded-[10px] px-3 py-2 flex items-center justify-center gap-1.5
            hover:bg-sea-100 active:scale-[0.97] transition-all duration-150"
        >
          <ClipboardList className="w-4 h-4 text-sea-500" />
          <span className="text-[12px] font-medium text-sea-600">就医准备</span>
        </button>
        <Link
          href="/map?type=HOSPITAL"
          className="flex-1 bg-teal-50 rounded-[10px] px-3 py-2 flex items-center justify-center gap-1.5
            hover:bg-teal-100 active:scale-[0.97] transition-all duration-150"
        >
          <MapPin className="w-4 h-4 text-teal-500" />
          <span className="text-[12px] font-medium text-teal-600">附近医院</span>
        </Link>
      </div>
    </div>
  );
}
