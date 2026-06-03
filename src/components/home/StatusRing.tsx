'use client';

interface StatusRingProps {
  label: string;        // e.g. "活力"
  value: string;        // e.g. "充沛"
  level: 'high' | 'medium' | 'low';  // color coding
  className?: string;
}

const ringColors: Record<string, string> = {
  high: 'border-teal-500',
  medium: 'border-amber-500',
  low: 'border-ink-faded/30',
};

export function StatusRing({ label, value, level, className = '' }: StatusRingProps) {
  const isCollecting = value === '收集';

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Ring circle */}
      <div
        className={`relative w-[68px] h-[68px] rounded-full bg-surface-white shadow-xs
          border-[3px] flex items-center justify-center
          ${ringColors[level]}`}
      >
        {/* Center value text */}
        <span className="text-[14px] font-semibold text-ink">
          {value}
        </span>

        {/* Pulsing dot for collecting state */}
        {isCollecting && (
          <span className="absolute top-1.5 right-1.5 w-[8px] h-[8px] rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>

      {/* Label below */}
      <span className="text-[11px] text-ink-faded">{label}</span>
    </div>
  );
}
