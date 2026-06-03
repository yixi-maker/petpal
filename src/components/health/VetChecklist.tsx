'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';

export function VetChecklist() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-white rounded-[12px] border border-border shadow-sm overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-alt/50"
      >
        <span className="text-[14px] font-medium text-ink flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-500" />
          就医前准备清单
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-ink-faded" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-faded" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          <ul className="space-y-2">
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-teal-500 mt-0.5 shrink-0">&#9679;</span>
              记录症状出现的时间点
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-teal-500 mt-0.5 shrink-0">&#9679;</span>
              拍摄症状照片或视频
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-teal-500 mt-0.5 shrink-0">&#9679;</span>
              带上既往病历和疫苗记录
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-teal-500 mt-0.5 shrink-0">&#9679;</span>
              提前电话预约
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-teal-500 mt-0.5 shrink-0">&#9679;</span>
              准备宠物基本信息（年龄、体重、绝育状态）
            </li>
            <li className="text-[13px] text-ink-muted flex items-start gap-2">
              <span className="text-teal-500 mt-0.5 shrink-0">&#9679;</span>
              如可能中毒，带上误食物品样本
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
