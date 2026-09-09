import React from 'react';

interface CyberShieldLogoProps {
  className?: string;
  size?: number;
}

export default function CyberShieldLogo({ className = "w-8 h-8", size }: CyberShieldLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      style={style}
      aria-label="CyberShield Logo"
    >
      <defs>
        <filter id="cs-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="shield-rim-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="40%" stopColor="#0077fe" />
          <stop offset="100%" stopColor="#003580" />
        </linearGradient>

        <linearGradient id="shield-rim-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0066cc" />
          <stop offset="50%" stopColor="#003366" />
          <stop offset="100%" stopColor="#001833" />
        </linearGradient>

        <linearGradient id="shield-face-left" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#0a1a2f" />
          <stop offset="50%" stopColor="#050d18" />
          <stop offset="100%" stopColor="#02050a" />
        </linearGradient>

        <linearGradient id="shield-face-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#060f1c" />
          <stop offset="70%" stopColor="#030810" />
          <stop offset="100%" stopColor="#010306" />
        </linearGradient>

        <linearGradient id="metal-silver-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#dce6f2" />
          <stop offset="60%" stopColor="#9cb0c5" />
          <stop offset="100%" stopColor="#5a7086" />
        </linearGradient>

        <linearGradient id="metal-silver-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ba2ba" />
          <stop offset="50%" stopColor="#475b70" />
          <stop offset="100%" stopColor="#243444" />
        </linearGradient>
      </defs>

      {/* Base Dark Shield Shadow */}
      <path
        d="M 256 16 L 466 96 C 466 310 398 426 256 496 C 114 426 46 310 46 96 Z"
        fill="#020408"
      />

      {/* Outer Glowing Bevel Left */}
      <path
        d="M 256 16 L 256 48 L 74 118 C 74 300 134 402 256 464 L 256 496 C 114 426 46 310 46 96 Z"
        fill="url(#shield-rim-left)"
      />

      {/* Outer Glowing Bevel Right */}
      <path
        d="M 256 16 L 466 96 C 466 310 398 426 256 496 L 256 464 C 378 402 438 300 438 118 L 256 48 Z"
        fill="url(#shield-rim-right)"
      />

      {/* Inner Shield Body Left Side */}
      <path
        d="M 256 48 L 74 118 C 74 300 134 402 256 464 Z"
        fill="url(#shield-face-left)"
      />

      {/* Inner Shield Body Right Side */}
      <path
        d="M 256 48 L 256 464 C 378 402 438 300 438 118 Z"
        fill="url(#shield-face-right)"
      />

      {/* Center Shield Crease Spine Highlight */}
      <line x1="256" y1="48" x2="256" y2="464" stroke="#00d2ff" strokeWidth="2" opacity="0.6" />

      {/* Shield Rim Neon Highlight Streaks */}
      <path
        d="M 256 22 L 460 98 C 460 140 454 185 444 230"
        stroke="#00f6ff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M 52 102 C 52 230 94 340 184 420"
        stroke="#00f6ff"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#cs-neon-glow)"
        opacity="0.8"
      />
      <path
        d="M 256 490 C 230 472 205 450 182 424"
        stroke="#00d2ff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Lower Left Inner Cyan Accent Wing */}
      <path
        d="M 120 286 C 145 350 192 398 256 426 L 256 398 C 206 372 168 332 144 280 Z"
        fill="#00c8ff"
        opacity="0.45"
      />

      {/* Circuit Trace Top Right */}
      <path
        d="M 330 144 L 382 144 L 404 144"
        stroke="#00f0ff"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#cs-neon-glow)"
      />
      <circle cx="410" cy="144" r="10" stroke="#00f0ff" strokeWidth="3" fill="#041220" filter="url(#cs-neon-glow)" />
      <circle cx="410" cy="144" r="4" fill="#00f6ff" />

      {/* Circuit Trace Bottom Left */}
      <path
        d="M 226 356 L 194 326 L 170 326"
        stroke="#00f0ff"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#cs-neon-glow)"
      />
      <circle cx="160" cy="326" r="10" stroke="#00f0ff" strokeWidth="3" fill="#041220" filter="url(#cs-neon-glow)" />
      <circle cx="160" cy="326" r="4" fill="#00f6ff" />

      {/* ==================== "C" EMBLEM ==================== */}
      {/* C Outer Glow / Rim Glow */}
      <path
        d="M 312 122 L 180 122 C 114 122 76 172 76 244 C 76 316 114 366 180 366 L 312 366 L 272 320 L 182 320 C 144 320 122 292 122 244 C 122 196 144 168 182 168 L 272 168 Z"
        fill="#003566"
        opacity="0.7"
      />

      {/* C Main Metallic Body */}
      <path
        d="M 310 124 L 180 124 C 116 124 80 174 80 244 C 80 314 116 364 180 364 L 308 364 L 268 318 L 182 318 C 146 318 126 290 126 244 C 126 198 146 170 182 170 L 268 170 Z"
        fill="url(#metal-silver-light)"
      />

      {/* C Inner Bevel / Cyan Edge Glow */}
      <path
        d="M 80 244 C 80 314 116 364 180 364 L 308 364 L 290 348 L 180 348 C 130 348 98 306 98 244 C 98 182 130 140 180 140 L 290 140 L 310 124 L 180 124 C 116 124 80 174 80 244 Z"
        fill="#00e5ff"
        opacity="0.4"
      />

      {/* C Highlight Cut along Top */}
      <path
        d="M 310 124 L 180 124 C 116 124 80 174 80 244 L 102 244 C 102 188 132 144 180 144 L 286 144 Z"
        fill="#ffffff"
        opacity="0.85"
      />

      {/* ==================== "S" EMBLEM ==================== */}
      {/* S Shadow Backing */}
      <path
        d="M 244 176 L 442 176 L 416 232 L 310 232 C 286 232 274 242 274 254 C 274 266 286 276 310 276 L 396 276 C 438 276 462 302 462 344 C 462 386 432 416 386 416 L 216 416 L 244 366 L 382 366 C 400 366 412 358 412 346 C 412 334 400 326 382 326 L 300 326 C 254 326 226 300 226 256 C 226 210 258 176 304 176 Z"
        fill="#001833"
        opacity="0.9"
      />

      {/* S Main Metallic Body */}
      <path
        d="M 242 178 L 440 178 L 418 228 L 306 228 C 284 228 272 238 272 252 C 272 266 284 274 306 274 L 392 274 C 436 274 460 300 460 342 C 460 384 430 414 384 414 L 218 414 L 246 364 L 382 364 C 402 364 414 356 414 344 C 414 332 402 324 382 324 L 298 324 C 250 324 224 298 224 254 C 224 210 256 178 302 178 Z"
        fill="url(#metal-silver-light)"
      />

      {/* S Top Half Light Bevel */}
      <path
        d="M 242 178 L 440 178 L 418 228 L 390 200 L 272 200 Z"
        fill="#ffffff"
        opacity="0.8"
      />

      {/* S Diagonal Sweep Cyan Reflection */}
      <path
        d="M 306 228 L 418 228 L 392 274 L 306 274 Z"
        fill="#00e5ff"
        opacity="0.35"
      />

      {/* S Bottom Sweep Bevel */}
      <path
        d="M 218 414 L 384 414 C 430 414 460 384 460 342 L 436 342 C 436 372 414 394 382 394 L 236 394 Z"
        fill="url(#metal-silver-dark)"
      />

      {/* Inner Cyan Glow Edge under the S tail */}
      <path
        d="M 218 414 L 246 364 L 260 376 L 236 414 Z"
        fill="#00f6ff"
        filter="url(#cs-neon-glow)"
      />
    </svg>
  );
}
