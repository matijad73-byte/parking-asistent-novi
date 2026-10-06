import React from 'react';
import { ShieldCheck, Check, Smartphone, Lock, Info } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 pt-6 pb-5 flex items-center gap-3.5 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-extrabold uppercase tracking-wide">
              Pravna usklađenost i privatnost
            </span>
            <h2 className="text-lg font-black text-white mt-0.5">
              Uslovi korišćenja aplikacije
            </h2>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <p className="text-blue-950 font-medium leading-snug">
              Dobrodošli u aplikaciju za brzo i sigurno plaćanje parkinga SMS porukom i praćenje vremena parkiranja u gradovima Srbije i regiona.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black text-xs">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  1. Slanje SMS-a putem zvanične aplikacije Vašeg telefona
                </h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Aplikacija priprema i prosleđuje SMS poruku sa brojem registarske tablice direktno na zvanični četvorocifreni broj lokalnog parking servisa (npr. 9111, 9112, 9119...). Poruku šaljete Vi lično iz Vaše fabričke SMS aplikacije.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  2. Nema skrivenih troškova i posredovanja
                </h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Aplikacija je 100% besplatna za korišćenje i ne uzima proviziju. Cena karte se naplaćuje po zvaničnim tarifama javnih komunalnih preduzeća i Vašeg mobilnog operatera, bez ikakve marže.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black text-xs">
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  3. Potpuna zaštita privatnosti (Lokalno skladištenje)
                </h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Vaše registarske tablice, sačuvane lokacije parkiranog automobila i istorija uplata čuvaju se isključivo u lokalnoj memoriji Vašeg uređaja (offline-first). Podaci se nikada ne šalju eksternim serverima niti dele sa trećim licima.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black text-xs">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  4. Automatsko brisanje podataka pri deinstalaciji
                </h4>
                <p className="text-slate-600 text-xs mt-0.5">
                  Svi podaci čuvaju se isključivo u internoj memoriji vašeg uređaja. Prilikom deinstalacije aplikacije sa telefona, operativni sistem automatski i trajno briše sve podatke i logove bez ostavljanja tragova.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] leading-snug">
            <strong>Važna napomena za vozače:</strong> Uvek proverite tablu na stubu parking mesta na licu mesta i sačekajte povratnu SMS potvrdu od parking servisa pre napuštanja vozila.
          </div>
        </div>

        {/* Footer / Accept Button */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          <button
            id="btn-accept-terms"
            type="button"
            onClick={onAccept}
            className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>Prihvatam uslove i nastavi</span>
          </button>
          <p className="text-[10px] text-center text-slate-600 font-medium">
            Klikom na dugme potvrđujete da ste pročitali i prihvatili uslove korišćenja.
          </p>
        </div>
      </div>
    </div>
  );
};
