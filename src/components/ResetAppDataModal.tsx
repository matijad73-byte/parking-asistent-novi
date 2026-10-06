import React, { useState } from 'react';
import { clearAllApplicationData } from '../utils/storage';
import {
  Trash2,
  ShieldAlert,
  CheckCircle2,
  HardDrive,
  Smartphone,
  X,
  RefreshCw,
} from 'lucide-react';

interface ResetAppDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataResetComplete: () => void;
}

export const ResetAppDataModal: React.FC<ResetAppDataModalProps> = ({
  isOpen,
  onClose,
  onDataResetComplete,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteReset = async () => {
    setIsClearing(true);
    try {
      await clearAllApplicationData();
      setIsSuccess(true);
      setTimeout(() => {
        setIsClearing(false);
        onDataResetComplete();
      }, 1200);
    } catch (err) {
      console.error('Greška pri brisanju podataka:', err);
      setIsClearing(false);
      onDataResetComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 pt-5 pb-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                Privatnost & Čišćenje
              </span>
              <h3 className="text-base font-black text-white">
                Brisanje podataka i logova
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Svi podaci su trajno obrisani!
              </h4>
              <p className="text-xs text-slate-600">
                Lokalna memorija, tablice, logovi i keš su u potpunosti uklonjeni sa telefona.
              </p>
            </div>
          ) : (
            <>
              {/* Info Box about uninstall on mobile */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Smartphone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Pri deinstalaciji sa telefona:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Operativni sistem (Android / iOS) automatski briše privremene podatke kada deinstalirate aplikaciju sa početnog ekrana.
                </p>
              </div>

              {/* What will be wiped */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <HardDrive className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Šta se trajno briše sa uređaja:</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-2 list-disc list-inside">
                  <li>Sve sačuvane <strong>registarske tablice</strong> i vozila</li>
                  <li>Kompletna <strong>istorija SMS uplata</strong> i vremenski logovi</li>
                  <li>Zabeležena lokacija <strong>parkiranog automobila</strong> i GPS beleške</li>
                  <li>Lokalni <strong>keš, kolačići i offline radnici</strong> (PWA Service Worker)</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-snug flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Ova radnja je <strong>nepovratna</strong>. Nakon brisanja aplikacija će se restartovati u fabričko stanje kao pri prvoj instalaciji.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        {!isSuccess && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
            {!isConfirming ? (
              <button
                type="button"
                onClick={() => setIsConfirming(true)}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Obriši sve podatke i logove pre deinstalacije</span>
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-center font-bold text-rose-700">
                  Da li ste sigurni? Svi podaci će biti trajno uklonjeni.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    disabled={isClearing}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Odustani
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    disabled={isClearing}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isClearing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Brisanje...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Potvrdi i obriši</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
