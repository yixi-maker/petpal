import { PawPrint } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  petType?: 'DOG' | 'CAT';
}

const sizes: Record<string, string> = {
  sm: 'w-[28px] h-[28px]',
  md: 'w-[36px] h-[36px]',
  lg: 'w-[48px] h-[48px]',
  xl: 'w-[72px] h-[72px]',
};

const iconSizes: Record<string, number> = { sm: 14, md: 18, lg: 22, xl: 32 };

// DOG silhouette - rounded head, floppy ears
function DogAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="狗狗头像">
      <circle cx="24" cy="26" r="14" fill="#E8E6E2" />
      <ellipse cx="14" cy="20" rx="6" ry="10" fill="#E8E6E2" />
      <ellipse cx="34" cy="20" rx="6" ry="10" fill="#E8E6E2" />
      <circle cx="19" cy="24" r="2.5" fill="#979A9F" />
      <circle cx="29" cy="24" r="2.5" fill="#979A9F" />
      <ellipse cx="24" cy="30" rx="4" ry="2.5" fill="#979A9F" />
    </svg>
  );
}

// CAT silhouette - round head, pointy ears
function CatAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="猫咪头像">
      <circle cx="24" cy="26" r="15" fill="#E8E6E2" />
      <polygon points="12,12 18,20 14,20" fill="#E8E6E2" />
      <polygon points="36,12 30,20 34,20" fill="#E8E6E2" />
      <ellipse cx="19" cy="25" rx="2.5" ry="3" fill="#979A9F" />
      <ellipse cx="29" cy="25" rx="2.5" ry="3" fill="#979A9F" />
      <ellipse cx="24" cy="31" rx="2" ry="1.5" fill="#979A9F" />
    </svg>
  );
}

export function Avatar({ src, alt = '', size = 'md', className = '', petType }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover border border-border-light ${className}`}
      />
    );
  }

  const containerClass = `${sizes[size]} rounded-full bg-surface-alt flex items-center justify-center border border-border-light ${className}`;

  if (petType === 'DOG') {
    return (
      <div className={containerClass}>
        <DogAvatar size={iconSizes[size]} />
      </div>
    );
  }

  if (petType === 'CAT') {
    return (
      <div className={containerClass}>
        <CatAvatar size={iconSizes[size]} />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <PawPrint className="text-teal-500" size={iconSizes[size]} />
    </div>
  );
}
