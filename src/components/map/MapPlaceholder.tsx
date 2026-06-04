export function MapPlaceholder() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EBE6DD]">
      {/* ---------- SVG map illustration ---------- */}
      <svg
        viewBox="0 0 400 320"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Pulsing ring animation for current location */}
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1D8A80" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#1D8A80" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1D8A80" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base fill — warm beige map background */}
        <rect width="400" height="320" fill="#EBE6DD" />

        {/* ---------- Water areas (soft map blue #C5D4DD) ---------- */}
        <path
          d="M -5 72 Q 54 58 112 76 Q 164 92 210 68 Q 262 42 326 64 Q 370 78 405 62 L 405 130 Q 352 148 288 138 Q 210 126 148 142 Q 88 156 24 138 L -5 126 Z"
          fill="#C5D4DD"
          opacity="0.85"
        />
        <path
          d="M 268 228 Q 302 216 340 232 Q 378 246 405 234 L 405 280 L 268 286 Z"
          fill="#C5D4DD"
          opacity="0.7"
        />

        {/* ---------- Parks (sage-tinted green #C5DCC5) ---------- */}
        <path
          d="M 52 176 Q 88 148 132 166 Q 166 182 158 214 Q 148 244 102 238 Q 56 232 44 204 Q 38 190 52 176 Z"
          fill="#C5DCC5"
          opacity="0.88"
        />
        <path
          d="M 244 158 Q 284 138 330 158 Q 365 174 354 212 Q 338 246 294 238 Q 252 230 238 198 Q 230 174 244 158 Z"
          fill="#C5DCC5"
          opacity="0.82"
        />
        <path
          d="M 122 264 Q 156 246 194 260 Q 224 272 216 300 Q 200 322 164 314 Q 128 306 118 284 Q 112 274 122 264 Z"
          fill="#C5DCC5"
          opacity="0.78"
        />

        {/* ---------- Roads (darker beige #D5CFC5) ---------- */}
        {/* Horizontal road */}
        <path
          d="M -5 198 Q 72 210 148 192 Q 226 174 308 190 Q 364 200 405 194"
          fill="none"
          stroke="#D5CFC5"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M -5 198 Q 72 210 148 192 Q 226 174 308 190 Q 364 200 405 194"
          fill="none"
          stroke="#C5BEB5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="12 10"
          opacity="0.5"
        />

        {/* Vertical road 1 */}
        <path
          d="M 148 192 Q 158 240 144 290 Q 138 312 132 325"
          fill="none"
          stroke="#D5CFC5"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 148 192 Q 158 240 144 290 Q 138 312 132 325"
          fill="none"
          stroke="#C5BEB5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="12 10"
          opacity="0.5"
        />

        {/* Road curve 1 */}
        <path
          d="M 308 190 Q 302 234 316 270 Q 324 294 340 312"
          fill="none"
          stroke="#D5CFC5"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 308 190 Q 302 234 316 270 Q 324 294 340 312"
          fill="none"
          stroke="#C5BEB5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
          opacity="0.45"
        />

        {/* Road curve 2 */}
        <path
          d="M 72 198 Q 64 162 74 124 Q 82 94 98 68"
          fill="none"
          stroke="#D5CFC5"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 72 198 Q 64 162 74 124 Q 82 94 98 68"
          fill="none"
          stroke="#C5BEB5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
          opacity="0.45"
        />

        {/* Road curve 3 — diagonal */}
        <path
          d="M 98 68 Q 158 44 226 58 Q 284 70 308 82"
          fill="none"
          stroke="#D5CFC5"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 98 68 Q 158 44 226 58 Q 284 70 308 82"
          fill="none"
          stroke="#C5BEB5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity="0.4"
        />

        {/* ---------- Current location with pulsing ring ---------- */}
        {/* Outer pulsing ring */}
        <circle cx="214" cy="138" r="40" fill="url(#pulseGrad)">
          <animate
            attributeName="r"
            values="40;60;40"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Inner ring */}
        <circle
          cx="214"
          cy="138"
          r="14"
          fill="none"
          stroke="#1D8A80"
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Teal dot */}
        <circle cx="214" cy="138" r="5" fill="#1D8A80" />
        {/* White border ring */}
        <circle
          cx="214"
          cy="138"
          r="9"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* ---------- Place markers (teal-500 8px with white center) ---------- */}
        {[
          { x: 62, y: 108 },
          { x: 288, y: 88 },
          { x: 346, y: 242 },
          { x: 166, y: 272 },
        ].map((pin, index) => (
          <g key={index}>
            <circle cx={pin.x} cy={pin.y} r="4" fill="#1D8A80" />
            <circle cx={pin.x} cy={pin.y} r="1.5" fill="#FFFFFF" />
          </g>
        ))}
      </svg>

      {/* ---------- Overlay text at bottom ---------- */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface-white/70 py-1.5 text-center rounded-t-[8px]">
        <p className="text-[11px] text-ink-faded/50">
          接入高德地图后显示完整地图
        </p>
      </div>
    </div>
  );
}
