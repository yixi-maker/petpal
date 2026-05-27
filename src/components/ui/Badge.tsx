interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'coral' | 'sage' | 'mist' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-surface-alt text-ink-muted',
  coral: 'bg-coral-50 text-coral-600',
  sage: 'bg-sage-50 text-sage-600',
  mist: 'bg-mist-50 text-mist-600',
  warning: 'bg-warning-50 text-warning-500',
  danger: 'bg-danger-50 text-danger-500',
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
