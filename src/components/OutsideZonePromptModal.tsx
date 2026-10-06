import React from 'react';
import { ParkingZone, CityData } from '../types';
import { X, MapPinOff, AlertTriangle, Send } from 'lucide-react';

interface OutsideZonePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSendAnyway: () => void;
  zone: ParkingZone;
  city: CityData;
  vehiclePlate: string;
}

export const OutsideZonePromptModal: React.FC<OutsideZonePromptModalProps> = ({
  isOpen,
  onClose,
  onConfirmSendAnyway,
  zone,
  city,
  vehiclePlate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-50 px-6 pt-6 pb-5 border-b border-amber-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <MapPinOff className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wide">
                GPS Lokacija
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Nalazite se van zone parkiranja
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
            Vaša trenutna GPS lokacija je van pokrivenosti zonskog sistema parkiranja u gradu{' '}
            <strong className="text-slate-900 font-bold">{city.name}</strong>.
          </p>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Proverite saobraćajni znak</span>
            </div>
            <p className="text-amber-850">
              Na vašoj trenutnoj lokaciji parkiranje je verovatno besplatno, ili se nalazite van teritorije obuhvaćene naplatom.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Ukoliko plaćate unapred za drugu lokaciju ili ste sigurni da se nalazite u zoni <strong>{zone.name}</strong>, možete nastaviti sa slanjem SMS-a.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 bg-white flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Otkaži (Nemoj slati)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmSendAnyway();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-800" />
            <span>Ipak plati ovu zonu ({zone.smsNumber})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
