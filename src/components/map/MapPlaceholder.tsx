export function MapPlaceholder() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* SVG map background */}
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="400" height="300" fill="#F5F0E8" />

        {/* Roads - curved paths */}
        <path
          d="M 0 120 Q 100 130 200 80 T 400 60"
          fill="none"
          stroke="#E0D8CC"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 50 0 Q 60 80 30 160 T 80 300"
          fill="none"
          stroke="#E0D8CC"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 200 0 Q 180 100 250 180 T 300 300"
          fill="none"
          stroke="#E0D8CC"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 350 0 Q 320 90 360 180 T 340 300"
          fill="none"
          stroke="#E0D8CC"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Parks - green polygon blobs */}
        <path
          d="M 80 200 Q 100 180 130 195 Q 150 210 130 225 Q 100 235 80 220 Z"
          fill="#D4E5D4"
          opacity="0.9"
        />
        <path
          d="M 300 50 Q 330 30 360 55 Q 380 80 340 90 Q 310 85 300 65 Z"
          fill="#D4E5D4"
          opacity="0.9"
        />
        <path
          d="M 250 250 Q 280 230 310 255 Q 320 280 290 285 Q 260 280 250 260 Z"
          fill="#D4E5D4"
          opacity="0.85"
        />

        {/* Water - blue polygon blobs */}
        <path
          d="M 20 260 Q 40 240 70 250 Q 90 270 70 285 Q 40 295 20 280 Z"
          fill="#D0DEE8"
          opacity="0.85"
        />
        <path
          d="M 330 170 Q 360 150 390 165 Q 400 190 370 195 Q 340 195 330 180 Z"
          fill="#D0DEE8"
          opacity="0.8"
        />

        {/* Radial gradient circle - current location area */}
        <defs>
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="150" r="50" fill="url(#pulseGrad)" />

        {/* Place markers - colored circles */}
        <circle cx="170" cy="110" r="6" fill="#14b8a6" opacity="0.9" />
        <circle cx="260" cy="80" r="6" fill="#14b8a6" opacity="0.9" />
        <circle cx="120" cy="180" r="6" fill="#14b8a6" opacity="0.9" />
        <circle cx="310" cy="200" r="6" fill="#14b8a6" opacity="0.9" />

        {/* Current location - teal dot with pulse ring */}
        <circle cx="200" cy="150" r="5" fill="#14b8a6" />
        <circle
          cx="200"
          cy="150"
          r="10"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2"
          opacity="0.5"
        />
        <circle
          cx="200"
          cy="150"
          r="16"
          fill="none"
          stroke="#14b8a6"
          strokeWidth="1.5"
          opacity="0.25"
        />
      </svg>

      {/* Overlay text bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface-white/70 backdrop-blur-sm py-2 text-center">
        <p className="text-[11px] text-ink-faded/60">
          接入高德地图后显示完整地图 · 当前数据仅供参考
        </p>
      </div>
    </div>
  );
}
