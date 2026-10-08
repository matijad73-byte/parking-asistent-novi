import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  Check,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { APP_CONFIG } from '../config/version';

interface PlayStoreExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const PlayStoreExportModal: React.FC<PlayStoreExportModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasPrompt, setHasPrompt] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!((window as any).deferredPrompt || deferredPrompt);
  });

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

  const isViber =
    typeof navigator !== 'undefined' &&
    /viber/i.test(navigator.userAgent);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('parking_app_installed') === 'true'
    ) {
      setIsInstalled(true);
    }

    const checkPrompt = () => {
      setHasPrompt(!!((window as any).deferredPrompt || deferredPrompt));
    };

    checkPrompt();
    window.addEventListener('pwa-prompt-ready', checkPrompt);
    window.addEventListener('pwa-app-installed', () => {
      setIsInstalled(true);
      setHasPrompt(false);
    });

    return () => {
      window.removeEventListener('pwa-prompt-ready', checkPrompt);
    };
  }, [deferredPrompt]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPrompt || deferredPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('Korisnik je prihvatio instalaciju');
          setIsInstalled(true);
          try {
            localStorage.setItem('parking_app_installed', 'true');
          } catch {}
          setTimeout(() => {
            onClose();
          }, 800);
        }
        (window as any).deferredPrompt = null;
        setHasPrompt(false);
      } catch (e) {
        console.warn('Install prompt error:', e);
      }
    } else {
      const guideEl = document.getElementById('pwa-guide-steps');
      if (guideEl) {
        guideEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      id="play-store-export-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="play-store-export-dialog"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-base">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Instalacija na Telefon
              </h2>
              <p className="text-xs text-slate-500">
                Dodajte ikonicu na početni ekran • 100% radi bez interneta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1 text-xs">
          {isInstalled ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div className="font-black text-emerald-950 text-base">
                Aplikacija je već instalirana!
              </div>
              <p className="text-emerald-800 text-xs leading-relaxed">
                Aplikaciju možete pokrenuti direktno sa početnog ekrana vašeg telefona preko ikonice <b>Parking</b>.
              </p>
            </div>
          ) : (
            <>
              {/* Viber In-App Guidance Banner */}
              {isViber && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-start gap-2.5 animate-fade-in shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-black text-sm shadow-xs">
                    V
                  </div>
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-purple-900 block mb-0.5">Otvorili ste link u Viber pregledaču:</span>
                    Za instalaciju na početni ekran jednim dodirom, dodirnite <b>⋮ (tri tačke)</b> u gornjem desnom uglu Vibera i izaberite <b>„Otvori u Chrome-u“</b> (Open in Browser/Chrome).
                  </div>
                </div>
              )}

              {/* PRIMARY 1-CLICK ACTION CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-200" />
                    <span className="font-bold text-sm text-white">1 Dodirom na Ekran</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-black text-[10px] tracking-wider uppercase">
                    Bez preuzimanja fajlova
                  </span>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Aplikacija ne traži skidanje komplikovanih fajlova. Dodaje se odmah na vaš početni ekran i otvara se u punom ekranu, brzo i sigurno.
                </p>

                <button
                  id="btn-hero-install-instant"
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-emerald-50 active:scale-[0.98] text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                  <span>Instaliraj Aplikaciju na Telefon</span>
                </button>
              </div>

              {/* Step-by-step guides for Android and iOS */}
              <div id="pwa-guide-steps" className="space-y-2.5">
                {/* Android Guide */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      Android (Chrome / Brave / Samsung Internet):
                    </span>
                    {!isIOS && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Vaš telefon
                      </span>
                    )}
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-xs pl-0.5 leading-relaxed">
                    <li>
                      U gornjem desnom uglu pregledača dodirnite meni sa tri tačkice (<b>⋮</b>).
                    </li>
                    <li>
                      Izaberite opciju <b>„Instaliraj aplikaciju“</b> ili <b>„Dodaj na početni ekran“</b>.
                    </li>
                    <li>
                      Ikonica <b>Parking</b> se pojavljuje na vašem telefonu i spremna je za upotrebu!
                    </li>
                  </ol>
                </div>

                {/* iPhone / iOS Guide */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      Apple iPhone / iPad (Safari):
                    </span>
                    {isIOS && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Vaš telefon
                      </span>
                    )}
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-xs pl-0.5 leading-relaxed">
                    <li>
                      Otvorite stranicu u <b>Safari</b> pregledaču.
                    </li>
                    <li>
                      Dodirnite dugme <b>Deli</b> na dnu ekrana (kvadrat sa strelicom na gore ⎋).
                    </li>
                    <li>
                      U meniju izaberite <b>„Dodaj na početni ekran“</b> (Add to Home Screen ➕).
                    </li>
                    <li>
                      U gornjem desnom uglu dodirnite <b>„Dodaj“</b>.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Benefits */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                  <WifiOff className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <div className="font-bold text-slate-900 text-xs">100% Offline</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Radi i bez interneta</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="font-bold text-slate-900 text-xs">Bezbedno</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Lokalno na telefonu</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex-shrink-0 flex items-center justify-between gap-2">
          <a
            href="/privacy-policy.html"
            target="_blank"
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Politika privatnosti
          </a>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs cursor-pointer"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
};
