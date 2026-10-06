import React from 'react';
import { ParkingPaymentSession } from '../types';
import { ParkingHistory } from './ParkingHistory';
import { X, History, Trash2, ShieldAlert } from 'lucide-react';

interface ParkingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ParkingPaymentSession[];
  onClearHistory?: () => void;
  onOpenResetAppData?: () => void;
}

export const ParkingHistoryModal: React.FC<ParkingHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onOpenResetAppData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Istorija Plaćanja</h3>
              <p className="text-xs text-slate-500">Evidencija SMS uplata parkinga</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ParkingHistory history={history} onClearHistory={onClearHistory} />

          {/* Privacy & Uninstall wipe option */}
          {onOpenResetAppData && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">
                    Priprema za deinstalaciju
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Obrišite sve sačuvane tablice, logove i keš
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenResetAppData();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Obriši sve podatke</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
