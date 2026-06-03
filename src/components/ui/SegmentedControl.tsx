'use client';

interface SegmentOption {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function SegmentedControl({ options, activeKey, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div className={`inline-flex bg-surface-alt rounded-[8px] p-[3px] ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3.5 py-1.5 text-[13px] font-medium rounded-[6px] transition-all duration-150
            ${activeKey === opt.key
              ? 'bg-surface-white text-ink shadow-sm'
              : 'text-ink-faded hover:text-ink-muted'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
