interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'teal' | 'sage' | 'sea' | 'amber' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-surface-alt text-ink-muted',
  teal: 'bg-teal-50 text-teal-600',
  sage: 'bg-sage-50 text-sage-600',
  sea: 'bg-sea-50 text-sea-500',
  amber: 'bg-amber-50 text-amber-500',
  rose: 'bg-rose-50 text-rose-500',
};

const sizes: Record<string, string> = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-[12px]',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-[5px] ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
