interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FilterChip({ label, active = false, onClick, className = '' }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex px-3.5 py-2 text-[13px] font-medium rounded-full whitespace-nowrap
        transition-all duration-150
        ${active
          ? 'bg-gradient-to-br from-teal-500 to-sea-500 text-white shadow-[0_8px_18px_rgba(29,138,128,0.24)]'
          : 'bg-white/70 backdrop-blur-xl text-ink-muted border border-white/70 shadow-[0_4px_14px_rgba(16,80,75,0.08)]'
        } ${className}`}
    >
      {label}
    </button>
  );
}
