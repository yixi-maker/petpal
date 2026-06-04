'use client';

interface StatusRingProps {
  label: string;        // e.g. "活力"
  value: string;        // e.g. "充沛"
  level: 'high' | 'medium' | 'low';  // color coding
  className?: string;
}

const ringColors: Record<string, string> = {
  high: 'border-teal-400',
  medium: 'border-amber-400',
  low: 'border-ink-faded/30',
};

const valueColors: Record<string, string> = {
  high: 'text-teal-700',
  medium: 'text-amber-500',
  low: 'text-ink-faded',
};

export function StatusRing({ label, value, level, className = '' }: StatusRingProps) {
  const isCollecting = value === '收集';

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className={`relative flex flex-col items-center justify-center w-[70px] h-[70px] rounded-[22px] border-[3px] bg-white/75
          shadow-[inset_0_2px_6px_rgba(16,80,75,0.06),0_12px_28px_rgba(16,80,75,0.10)] backdrop-blur-xl
          ${ringColors[level]}`}
      >
        <span className={`text-[14px] font-semibold ${valueColors[level]}`}>
          {value}
        </span>
        <span className="mt-0.5 text-[10px] text-ink-faded">{label}</span>

        {isCollecting && (
          <span className="absolute top-2 right-2 w-[8px] h-[8px] rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>
    </div>
  );
}
