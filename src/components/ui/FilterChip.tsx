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
      className={`inline-flex px-3 py-1.5 text-[13px] font-medium rounded-full whitespace-nowrap
        transition-all duration-150
        ${active
          ? 'bg-ink text-surface-white shadow-sm'
          : 'bg-surface-white text-ink-muted border border-border hover:border-ink-faded/30 hover:text-ink'
        } ${className}`}
    >
      {label}
    </button>
  );
}
