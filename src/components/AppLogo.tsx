import React from 'react';

export const AppLogoIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`relative rounded-xl bg-[#16382B] flex items-center justify-center overflow-hidden shadow-sm shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sun */}
        <circle cx="72" cy="33" r="14" fill="#F77F00" />
        
        {/* Outer tent frame in mint green */}
        <path
          d="M50 26L22 75H78L50 26Z"
          stroke="#40916C"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Base bar */}
        <rect x="14" y="76" width="72" height="9" rx="4.5" fill="#52B788" />

        {/* Inner doorway light mint triangle */}
        <polygon points="50,56 41,74 59,74" fill="#D8F3DC" />
      </svg>
    </div>
  );
};

export const BaliCampingBadge: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => {
  return (
    <div className={`relative rounded-full bg-[#FAF9F5] border-2 border-[#1B4332] flex items-center justify-center overflow-hidden shadow-xs shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Sky */}
        <circle cx="50" cy="50" r="48" fill="#F4EDE2" stroke="#1B4332" strokeWidth="4" />
        
        {/* Mountain (Mount Agung) */}
        <path d="M18 64 L50 24 L82 64 Z" fill="#74C0FC" opacity="0.8" />
        <path d="M42 34 L50 24 L58 34 L52 32 Z" fill="#FFFFFF" />
        
        {/* Sun/Hills */}
        <path d="M30 65 Q 55 45, 80 62 L80 80 L20 80 Z" fill="#F59E0B" />
        
        {/* Lake Water */}
        <path d="M20 74 Q 50 68, 80 74 L80 90 L20 90 Z" fill="#38B2AC" opacity="0.7" />

        {/* Balinese Meru / Temple roof silhouette */}
        <path d="M22 68 L26 68 L24 64 Z M21 64 L27 64 L24 60 Z M22 60 L26 60 L24 55 Z M24 55 L24 51" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" fill="#1B4332" />
        
        {/* Tent */}
        <polygon points="64,55 52,72 76,72" fill="#E8590C" stroke="#1B4332" strokeWidth="2" />
        <polygon points="64,55 60,72 68,72" fill="#FFA94D" />
      </svg>
    </div>
  );
};
