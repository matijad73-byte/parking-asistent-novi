import React from 'react';
import { SerbianCoatOfArms } from './SerbianCoatOfArms';
import { parseSerbianPlate } from '../utils/plateUtils';

interface LicensePlateBadgeProps {
  plate: string;
  country?: string; // e.g. "SRB"
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  className?: string;
  id?: string;
}

export const LicensePlateBadge: React.FC<LicensePlateBadgeProps> = ({
  plate,
  country = 'SRB',
  size = 'md',
  selected = false,
  className = '',
  id,
}) => {
  const parsed = parseSerbianPlate(plate);

  const containerSizes = {
    sm: 'h-[38px] px-2 border-[1.5px] rounded-md gap-1 text-[14px] sm:text-[16px]',
    md: 'h-[46px] sm:h-[50px] px-2.5 border-[2px] rounded-lg gap-1.5 text-[19px] sm:text-[22px]',
    lg: 'h-[58px] sm:h-[64px] px-3 border-[2.5px] rounded-xl gap-2 text-[24px] sm:text-[29px]',
    xl: 'h-[68px] sm:h-[76px] px-3.5 border-[3px] rounded-xl gap-2.5 text-[29px] sm:text-[36px]',
  };

  const blueBandSizes = {
    sm: 'w-6 pb-1 text-[10px]',
    md: 'w-8 pb-1.5 text-xs sm:text-[13px]',
    lg: 'w-10 pb-1.5 text-sm sm:text-base',
    xl: 'w-12 pb-2 text-base sm:text-lg',
  };

  const coatSizes = {
    sm: 15,
    md: 19,
    lg: 24,
    xl: 28,
  };

  const separatorSizes = {
    sm: 'w-1.5 h-1.5 rounded-[1px] mx-0.5',
    md: 'w-2 h-2 rounded-[1.5px] mx-0.5 sm:mx-1',
    lg: 'w-2.5 h-2.5 rounded-[1.5px] mx-1',
    xl: 'w-3 h-3 rounded-[2px] mx-1.5',
  };

  return (
    <div
      id={id || `plate-${plate.replace(/\s+/g, '-')}`}
      className={`inline-flex items-center bg-white font-sans font-black text-slate-950 tracking-tight shadow-sm transition-all duration-200 border-slate-900 overflow-hidden select-none ${
        containerSizes[size]
      } ${
        selected
          ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-slate-900 border-blue-600 shadow-md'
          : 'hover:border-slate-700'
      } ${className}`}
    >
      {/* Authentic Blue Strip (SRB) */}
      <div
        className={`h-full bg-[#0038A8] flex flex-col items-center justify-end -ml-2 text-white font-sans font-black leading-none select-none flex-shrink-0 ${blueBandSizes[size]}`}
      >
        <span className="tracking-tighter uppercase drop-shadow-xs font-black">
          {country}
        </span>
      </div>

      {/* Plate content layout: [City] [Coat + Cyrillic] [Numbers] [Separator ▪] [Suffix] */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-0.5 sm:px-1 flex-nowrap">
        {/* 1. Latin City code */}
        <span className="leading-none text-slate-950 drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.2)]">
          {parsed.city}
        </span>

        {/* 2. Coat of Arms with Cyrillic city below */}
        <SerbianCoatOfArms
          size={coatSizes[size]}
          cyrillicCity={parsed.cityCyrillic}
          className="mx-0.5"
        />

        {/* 3. Numbers */}
        <span className="leading-none text-slate-950 drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.2)]">
          {parsed.numbers}
        </span>

        {/* 4. Guaranteed visible centered separator square / dash */}
        <span
          className={`inline-block bg-slate-950 flex-shrink-0 shadow-[0_0.5px_0.5px_rgba(0,0,0,0.2)] ${separatorSizes[size]}`}
          aria-label="-"
        />

        {/* 5. Suffix letters */}
        <span className="leading-none text-slate-950 drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.2)]">
          {parsed.suffix}
        </span>
      </div>
    </div>
  );
};
