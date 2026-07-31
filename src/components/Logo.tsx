import React from 'react';
import { GraduationCap, BookOpen, Award, Sparkles, Flower2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-9 h-9 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const titleSizes = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex items-center gap-3 group select-none">
      {/* EMBLEM / LOGO ICON */}
      <div className="relative">
        {/* Glowing Aura Ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
        
        {/* Main Badge Container */}
        <div
          className={`${iconSizes[size]} relative bg-gradient-to-tr from-emerald-800 via-teal-700 to-indigo-900 text-white rounded-2xl flex items-center justify-center font-black shadow-xl border-2 border-amber-300/60 overflow-hidden`}
        >
          {/* Subtle Watermark Pattern Inside Logo */}
          <div className="absolute -right-2 -bottom-2 text-white/10 pointer-events-none">
            <Flower2 className="w-10 h-10" />
          </div>

          {/* Letter C with Golden Accent */}
          <div className="relative z-10 flex items-center justify-center font-serif tracking-tight">
            <span className="bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent drop-shadow-sm font-black">
              C
            </span>
          </div>

          {/* Mini Cap Badge */}
          <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 border border-amber-200 shadow-xs">
            <GraduationCap className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>

      {/* TYPOGRAPHY */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1
            className={`${titleSizes[size]} font-black tracking-tight bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-900 bg-clip-text text-transparent drop-shadow-2xs whitespace-nowrap`}
          >
            Chường Teacher
          </h1>
        </div>

        {showSubtitle && (
          <p
            className={`${subtitleSizes[size]} font-bold text-emerald-800/90 tracking-wide flex items-center gap-1 mt-0.5`}
          >
            <span>Hệ Thống Lớp Học & Đào Tạo</span>
            <span className="text-amber-500 font-normal">✦</span>
            <span className="text-pink-600">🪷</span>
          </p>
        )}
      </div>
    </div>
  );
};
