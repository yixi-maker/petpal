interface IconBadgeProps {
  icon: React.ReactNode;
  variant?: 'teal' | 'sea' | 'sage' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<string, { background: string; iconColor: string }> = {
  teal: {
    background: 'bg-gradient-to-br from-teal-50 to-teal-100',
    iconColor: 'text-teal-500',
  },
  sea: {
    background: 'bg-gradient-to-br from-sea-50 to-sea-100',
    iconColor: 'text-sea-500',
  },
  sage: {
    background: 'bg-gradient-to-br from-sage-50 to-sage-100',
    iconColor: 'text-sage-500',
  },
  amber: {
    background: 'bg-gradient-to-br from-amber-50 to-amber-100',
    iconColor: 'text-amber-500',
  },
  rose: {
    background: 'bg-gradient-to-br from-rose-50 to-rose-100',
    iconColor: 'text-rose-500',
  },
};

const sizeStyles: Record<string, { container: string; icon: string }> = {
  sm: {
    container: 'w-[32px] h-[32px] rounded-[7px]',
    icon: 'w-[16px] h-[16px]',
  },
  md: {
    container: 'w-[40px] h-[40px] rounded-[9px]',
    icon: 'w-[20px] h-[20px]',
  },
  lg: {
    container: 'w-[48px] h-[48px] rounded-[11px]',
    icon: 'w-[24px] h-[24px]',
  },
};

export function IconBadge({
  icon,
  variant = 'teal',
  size = 'md',
  className = '',
}: IconBadgeProps) {
  const { background, iconColor } = variantStyles[variant];
  const { container, icon: iconSize } = sizeStyles[size];

  return (
    <div
      className={`flex items-center justify-center shadow-xs border border-white/60 ${background} ${container} ${className}`}
    >
      <span className={`${iconColor} ${iconSize} flex items-center justify-center`}>
        {icon}
      </span>
    </div>
  );
}
