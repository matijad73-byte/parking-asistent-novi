import React from 'react';
import { Vehicle } from '../types';
import { SerbianCoatOfArms } from './SerbianCoatOfArms';
import { parseSerbianPlate } from '../utils/plateUtils';

interface RealisticPlateButtonProps {
  vehicle: Vehicle;
  onClick: () => void;
  className?: string;
}

export const RealisticPlateButton: React.FC<RealisticPlateButtonProps> = ({
  vehicle,
  onClick,
  className = '',
}) => {
  const rawPlate = vehicle?.plate || 'BG 512-TX';
  const parsed = parseSerbianPlate(rawPlate);

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Plate Button Outer Frame (Crni plastični nosač tablice sa šrafovima) */}
      <button
        type="button"
        id="btn-plate-selector-main"
        onClick={onClick}
        aria-label={`Izabrana tablica ${parsed.formatted}. Kliknite za izbor ili promenu tablice.`}
        className="group relative w-full max-w-[350px] sm:max-w-[405px] bg-[#101214] p-[3px] sm:p-[4px] rounded-[14px] sm:rounded-[16px] shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all duration-200 border border-slate-700/80 cursor-pointer select-none"
      >
        {/* Subtle screw bolt heads on left & right */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-slate-400 to-slate-700 border border-slate-800 shadow-inner opacity-80 z-20" />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-br from-slate-400 to-slate-700 border border-slate-800 shadow-inner opacity-80 z-20" />

        {/* License Plate Inner Surface (Beli reljefni aluminijumski lim tablice) */}
        <div className="relative w-full h-[66px] sm:h-[76px] bg-gradient-to-b from-[#ffffff] via-[#fafafa] to-[#f0f2f5] rounded-[10px] sm:rounded-[12px] border-[2.5px] border-[#101214] flex items-center justify-between overflow-hidden shadow-inner pl-0 pr-3 sm:pr-4">
          {/* Blue Left Strip (SRB) - Autentična plava traka bez zvezdica sa oznakom SRB pri dnu */}
          <div className="h-full w-10 sm:w-12 bg-[#0038A8] flex flex-col items-center justify-end pb-2 px-0.5 text-white flex-shrink-0 select-none shadow-sm">
            <span className="font-sans font-black text-[13px] sm:text-[15px] tracking-wider text-white uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              SRB
            </span>
          </div>

          {/* Glavni sadržaj tablice: [Grad Latinica] [Grb + Grad Ćirilica] [Brojevi] [Jasno uočljiva crtica] [Sufiks slova] (+20% uvećana slova i brojevi) */}
          <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-2 overflow-hidden flex-nowrap">
            {/* 1. Oznaka grada na latinici (npr. "BG") - uvećana za 20% */}
            <span className="font-sans font-black text-[29px] sm:text-[37px] text-[#111827] tracking-tight leading-none drop-shadow-[0_1px_0.5px_rgba(0,0,0,0.3)] select-none flex-shrink-0">
              {parsed.city}
            </span>

            {/* 2. Grb Republike Srbije sa ćiriličnom oznakom grada direktno ispod štita (npr. "БГ") */}
            <SerbianCoatOfArms
              size={25}
              cyrillicCity={parsed.cityCyrillic}
              className="mx-0.5 sm:mx-1 flex-shrink-0 scale-95 sm:scale-105"
            />

            {/* 3. Registarski broj (npr. "512") - uvećan za 20% */}
            <span className="font-sans font-black text-[29px] sm:text-[37px] text-[#111827] tracking-tight leading-none drop-shadow-[0_1px_0.5px_rgba(0,0,0,0.3)] select-none flex-shrink-0">
              {parsed.numbers}
            </span>

            {/* 4. Autentični razdelnik / crtica između broja i slova (fiksne veličine, garantovano vidljiva na mobilnim telefonima) */}
            <span
              className="inline-block w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#111827] rounded-[1px] mx-0.5 sm:mx-1 flex-shrink-0 select-none shadow-[0_0.5px_0.5px_rgba(0,0,0,0.3)]"
              aria-label="-"
            />

            {/* 5. Dva slova na kraju tablice (npr. "TX" ili "KM") - uvećana za 20% */}
            <span className="font-sans font-black text-[29px] sm:text-[37px] text-[#111827] tracking-tight leading-none drop-shadow-[0_1px_0.5px_rgba(0,0,0,0.3)] select-none flex-shrink-0">
              {parsed.suffix}
            </span>
          </div>

          {/* Hover highlight overlay */}
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
        </div>
      </button>
    </div>
  );
};
