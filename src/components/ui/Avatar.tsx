import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const iconSizeMap: Record<string, number> = { sm: 14, md: 18, lg: 24, xl: 32 };

export function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`${sizeMap[size]} rounded-full bg-brand-100 flex items-center justify-center ${className}`}>
      <User className="text-brand-500" size={iconSizeMap[size]} />
    </div>
  );
}
