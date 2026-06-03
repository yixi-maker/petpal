'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EmergencyGuideProps {
  defaultExpanded?: boolean;
}

export function EmergencyGuide({ defaultExpanded = false }: EmergencyGuideProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div className="bg-surface-white rounded-[12px] border border-border shadow-sm overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-alt/50"
      >
        <span className="text-[14px] font-medium text-teal-500">急诊症状速查</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-teal-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-teal-500" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <ul className="space-y-1.5">
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              呼吸困难或喘息
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              严重外伤或骨折
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              持续呕吐超过 24 小时
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              意识模糊或昏迷
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              中毒（误食药物/化学品）
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              超过 24 小时拒食
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-rose-400 mt-0.5 shrink-0">&#9679;</span>
              尿血或便血
            </li>
          </ul>

          <div className="bg-amber-50 rounded-[8px] p-3">
            <p className="text-[13px] text-amber-600 leading-relaxed">
              如出现以上任何情况，请立即前往最近宠物医院就诊
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
