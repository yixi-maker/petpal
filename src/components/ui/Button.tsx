import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  primary: 'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-sm',
  secondary: 'bg-surface-alt text-ink hover:bg-border',
  outline: 'border border-border text-ink hover:bg-surface-alt',
  ghost: 'text-ink-muted hover:bg-surface-alt',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-[13px] rounded-[6px]',
  md: 'px-4 py-2.5 text-[14px] rounded-[8px]',
  lg: 'px-5 py-3 text-[15px] rounded-[10px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
