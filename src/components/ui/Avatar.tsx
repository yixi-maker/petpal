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

const iconSizes: Record<string, number> = { sm: 14, md: 18, lg: 24, xl: 36 };

// Premium DOG silhouette — warm beige background, rounded head, soft brown inner ears, nose & eye dots
function DogAvatar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="狗狗头像"
    >
      <defs>
        <radialGradient id="dog-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#F7F3ED" />
          <stop offset="100%" stopColor="#EDE7DC" />
        </radialGradient>
      </defs>
      {/* Outer circle with subtle inset shadow feel */}
      <circle cx="24" cy="24" r="24" fill="#F3EFE8" />
      <circle cx="24" cy="24" r="22" fill="url(#dog-bg)" />
      {/* Left ear — soft brown fill */}
      <ellipse cx="11" cy="14" rx="7" ry="10" fill="#D4B896" transform="rotate(-12 11 14)" />
      <ellipse cx="11" cy="14" rx="4.5" ry="7" fill="#C4A882" transform="rotate(-12 11 14)" />
      {/* Right ear — soft brown fill */}
      <ellipse cx="37" cy="14" rx="7" ry="10" fill="#D4B896" transform="rotate(12 37 14)" />
      <ellipse cx="37" cy="14" rx="4.5" ry="7" fill="#C4A882" transform="rotate(12 37 14)" />
      {/* Head */}
      <ellipse cx="24" cy="26" rx="15" ry="14" fill="#F3EFE8" />
      {/* Eyes */}
      <circle cx="18" cy="24" r="2.5" fill="#3D3230" />
      <circle cx="30" cy="24" r="2.5" fill="#3D3230" />
      {/* Eye highlights */}
      <circle cx="17" cy="23" r="0.8" fill="#FFFFFF" opacity="0.7" />
      <circle cx="29" cy="23" r="0.8" fill="#FFFFFF" opacity="0.7" />
      {/* Nose */}
      <ellipse cx="24" cy="30.5" rx="3" ry="2" fill="#2D2422" />
      {/* Nose highlight */}
      <ellipse cx="23" cy="29.8" rx="1.2" ry="0.7" fill="#FFFFFF" opacity="0.15" />
      {/* Mouth hint */}
      <path
        d="M21 33 Q24 36 27 33"
        stroke="#C4A882"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Elegant CAT silhouette — warm gray background, pointed ears, pink-beige inner ears, almond eyes
function CatAvatar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="猫咪头像"
    >
      <defs>
        <radialGradient id="cat-bg" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#F2F0ED" />
          <stop offset="100%" stopColor="#E8E5DF" />
        </radialGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="24" cy="24" r="24" fill="#EDEAE5" />
      <circle cx="24" cy="24" r="22" fill="url(#cat-bg)" />
      {/* Left ear — pointed triangle, outer gray */}
      <polygon points="8,8 18,21 13,21" fill="#D5CFC7" />
      {/* Left ear — inner pink-beige */}
      <polygon points="11,12 16,20 13,20" fill="#E8D5C8" />
      {/* Right ear — pointed triangle, outer gray */}
      <polygon points="40,8 30,21 35,21" fill="#D5CFC7" />
      {/* Right ear — inner pink-beige */}
      <polygon points="37,12 32,20 35,20" fill="#E8D5C8" />
      {/* Head */}
      <circle cx="24" cy="27" r="14.5" fill="#EDEAE5" />
      {/* Eyes — almond shape */}
      <ellipse cx="18.5" cy="25" rx="2.8" ry="3.2" fill="#3A3330" />
      <ellipse cx="29.5" cy="25" rx="2.8" ry="3.2" fill="#3A3330" />
      {/* Eye highlights */}
      <ellipse cx="17.5" cy="24" rx="1" ry="1.2" fill="#FFFFFF" opacity="0.8" />
      <ellipse cx="28.5" cy="24" rx="1" ry="1.2" fill="#FFFFFF" opacity="0.8" />
      {/* Nose — small triangle */}
      <polygon points="23,30 25,30 24,31.5" fill="#E8909A" />
      {/* Mouth — subtle curves */}
      <path
        d="M21 32 Q22.5 35 24 31.5 Q25.5 35 27 32"
        stroke="#C4BBB5"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Whisker hints */}
      <line x1="11" y1="28" x2="16" y2="29" stroke="#C4BBB5" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="11" y1="31" x2="16" y2="31" stroke="#C4BBB5" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="37" y1="28" x2="32" y2="29" stroke="#C4BBB5" strokeWidth="0.6" strokeLinecap="round" />
      <line x1="37" y1="31" x2="32" y2="31" stroke="#C4BBB5" strokeWidth="0.6" strokeLinecap="round" />
    </svg>
  );
}

export function Avatar({ src, alt = '', size = 'md', className = '', petType }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover border border-border shadow-xs ${className}`}
      />
    );
  }

  const containerClass = `${sizes[size]} rounded-full flex items-center justify-center ${className}`;

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

  // Default fallback: simple human/paw silhouette
  return (
    <div className={`${containerClass} bg-surface-alt border border-border-light`}>
      <PawPrint className="text-teal-500" size={iconSizes[size]} />
    </div>
  );
}
