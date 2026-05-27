import { PawPrint } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes: Record<string, string> = {
  sm: 'w-[28px] h-[28px]',
  md: 'w-[36px] h-[36px]',
  lg: 'w-[48px] h-[48px]',
  xl: 'w-[72px] h-[72px]',
};

const iconSizes: Record<string, number> = { sm: 14, md: 18, lg: 22, xl: 32 };

export function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover border border-border-light ${className}`}
      />
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-surface-alt flex items-center justify-center
      border border-border-light ${className}`}>
      <PawPrint className="text-ink-faded" size={iconSizes[size]} />
    </div>
  );
}
