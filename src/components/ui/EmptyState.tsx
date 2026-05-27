import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && <div className="mb-4 text-ink-faded/40">{icon}</div>}
      <h3 className="text-[15px] font-medium text-ink mb-1.5">{title}</h3>
      {description && <p className="text-[13px] text-ink-faded max-w-[260px] leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
