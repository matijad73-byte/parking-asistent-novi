import React from 'react';

interface SerbianCoatOfArmsProps {
  size?: number;
  cyrillicCity?: string;
  className?: string;
}

/**
 * Autentični crveni štit sa belim krstom i 4 ocila (ognjila) Republike Srbije,
 * uz opciona ćirilična slova grada ispod štita (npr. "БГ"), identično pravim tablicama.
 */
export const SerbianCoatOfArms: React.FC<SerbianCoatOfArmsProps> = ({
  size = 24,
  cyrillicCity,
  className = '',
}) => {
  const width = size;
  const height = Math.round(size * 1.22);

  return (
    <div className={`inline-flex flex-col items-center justify-center flex-shrink-0 select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 122"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
        aria-label="Grb Republike Srbije"
      >
        {/* 1. Spoljni reljefni srebrni obrub štita */}
        <path
          d="M 6,6
              H 94
              V 68
              C 94,96 56,116 50,118
              C 44,116 6,96 6,68
              Z"
          fill="url(#serbianShieldGradient)"
          stroke="#ffffff"
          strokeWidth="3.5"
        />

        {/* 2. Unutrašnja reljefna senka za utisnuti metalni izgled */}
        <path
          d="M 10,10
              H 90
              V 67
              C 90,92 55,111 50,113
              C 45,111 10,92 10,67
              Z"
          fill="none"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="2"
        />

        {/* 3. Beli reljefni krst */}
        {/* Vertikalni krak */}
        <rect x="44.5" y="9" width="11" height="98" rx="1" fill="#ffffff" />
        {/* Horizontalni krak */}
        <rect x="9" y="46.5" width="82" height="11" rx="1" fill="#ffffff" />

        {/* 4. Četiri srpska ocila (ognjila / С) bridovima okrenuta ka gredi krsta */}
        {/* Gore levo */}
        <path
          d="M 36,22 C 22,23 20,31 20,36 C 20,41 22,49 36,50 L 37,44 C 27,43 26,38 26,36 C 26,34 27,29 37,28 Z"
          fill="#ffffff"
        />
        {/* Dole levo */}
        <path
          d="M 36,58 C 22,59 20,67 20,72 C 20,77 22,85 36,86 L 37,80 C 27,79 26,74 26,72 C 26,70 27,65 37,64 Z"
          fill="#ffffff"
        />
        {/* Gore desno (ogledalsko) */}
        <path
          d="M 64,22 C 78,23 80,31 80,36 C 80,41 78,49 64,50 L 63,44 C 73,43 74,38 74,36 C 74,34 73,29 63,28 Z"
          fill="#ffffff"
        />
        {/* Dole desno (ogledalsko) */}
        <path
          d="M 64,58 C 78,59 80,67 80,72 C 80,77 78,85 64,86 L 63,80 C 73,79 74,74 74,72 C 74,70 73,65 63,64 Z"
          fill="#ffffff"
        />

        {/* Definicija autentične crvene boje štita */}
        <defs>
          <linearGradient id="serbianShieldGradient" x1="50" y1="6" x2="50" y2="118" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d91438" />
            <stop offset="1" stopColor="#a30e28" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ćirilična oznaka grada direktno ispod vrha štita (npr. БГ) - uvećana za 20% */}
      {cyrillicCity && (
        <span className="font-sans font-black text-[11px] sm:text-[12px] leading-none text-slate-900 tracking-tighter mt-0.5 text-center uppercase">
          {cyrillicCity}
        </span>
      )}
    </div>
  );
};
