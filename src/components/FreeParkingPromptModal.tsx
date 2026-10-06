import React from 'react';
import { ParkingZone, CityData } from '../types';
import { ParkingTimeStatus } from '../utils/parkingSchedule';
import { X, Moon, Clock, ShieldCheck, Send, CheckCircle } from 'lucide-react';

interface FreeParkingPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSendAnyway: () => void;
  zone: ParkingZone;
  city: CityData;
  timeStatus: ParkingTimeStatus;
  vehiclePlate: string;
}

export const FreeParkingPromptModal: React.FC<FreeParkingPromptModalProps> = ({
  isOpen,
  onClose,
  onConfirmSendAnyway,
  zone,
  city,
  timeStatus,
  vehiclePlate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Badge & Close */}
        <div className="bg-emerald-50 px-6 pt-6 pb-5 border-b border-emerald-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wide">
                Besplatno parkiranje
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Parking je trenutno besplatan!
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            U zoni <strong className="text-slate-900 font-bold">{zone.name}</strong> u gradu{' '}
            <strong className="text-slate-900 font-bold">{city.name}</strong> parkiranje se u ovom trenutku{' '}
            <strong className="text-emerald-700 font-bold">ne naplaćuje</strong>.
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Radno vreme naplate:</span>
                <p className="text-slate-600 mt-0.5">{timeStatus.scheduleText}</p>
              </div>
            </div>
            {timeStatus.nextPaymentStart && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">
                  Sledeća naplata: <strong className="text-slate-900">{timeStatus.nextPaymentStart}</strong>
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 italic">
            Nema potrebe da šaljete SMS poruku jer novac neće biti naplaćen, ili ćete dobiti poruku da je parkiranje van vremena naplate.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 bg-white flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>U redu, nemoj slati SMS</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmSendAnyway();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Ipak pošalji SMS ({zone.smsNumber})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
