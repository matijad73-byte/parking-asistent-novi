import React, { useState } from 'react';
import { X, Share2, Smartphone, Check, Send, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../config/version';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen) return null;

  // Use the active working URL for sharing so recipients always open the live app
  const getShareUrl = (): string => {
    if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
      return window.location.origin + window.location.pathname;
    }
    return APP_CONFIG.publicShareUrl;
  };

  const handleSendLink = async () => {
    const targetUrl = getShareUrl();
    const shareData = {
      title: APP_CONFIG.name,
      text: 'Brzo SMS plaćanje parkinga po zonama – radi 100% samostalno bez interneta:',
      url: targetUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => {
          setShareSuccess(false);
          onClose();
        }, 1200);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback if Web Share API is not supported or was cancelled
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 flex flex-col max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Podeli Aplikaciju</h2>
              <p className="text-xs text-slate-500">Pošaljite aplikaciju kolegama i prijateljima</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button: Pošalji link */}
        <div className="space-y-3">
          <button
            id="btn-send-share-link"
            type="button"
            onClick={handleSendLink}
            className="w-full py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {shareSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
                <span>Poslato / Link pripremljen!</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Pošalji link (Viber / WhatsApp / SMS)</span>
              </>
            )}
          </button>

          {shareSuccess && (
            <p className="text-xs text-center text-emerald-600 font-bold animate-fade-in">
              ✓ Link je uspešno pripremljen i poslat!
            </p>
          )}
        </div>

        {/* Simple Beginner Explanation */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Jednostavno za sve korisnike:</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Kada prijatelj otvori link, aplikacija se odmah otvara u pregledaču bez ikakvog prijavljivanja ili Google naloga. Može odmah da je koristi ili instalira na telefon sa 1 dodirom.
          </p>
        </div>

        {/* How to add to home screen */}
        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-blue-950">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Kako prijatelj instalira na ekran:</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            U pregledaču telefona (Chrome ili Safari) samo dodirne <b>„Instaliraj“</b> ili meni <b>„Dodaj na početni ekran“</b>. Ikonica <b>Parking</b> se odmah pojavljuje na ekranu i radi 100% offline.
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
        >
          Zatvori
        </button>
      </div>
    </div>
  );
};
