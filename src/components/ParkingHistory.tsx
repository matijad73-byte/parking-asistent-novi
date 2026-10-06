import React from 'react';
import { ParkingPaymentSession } from '../types';
import { LicensePlateBadge } from './LicensePlateBadge';
import { History, Receipt, Trash2 } from 'lucide-react';

interface ParkingHistoryProps {
  history: ParkingPaymentSession[];
  onClearHistory?: () => void;
}

export const ParkingHistory: React.FC<ParkingHistoryProps> = ({ history, onClearHistory }) => {
  const totalSpent = history.reduce((sum, item) => sum + item.priceRsd, 0);

  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-2.5 shadow-xs animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <History className="w-6 h-6 text-slate-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Nema prethodnih uplata</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">Istorija vaših SMS uplata parkinga pojaviće se ovde.</p>
      </div>
    );
  }

  return (
    <div id="parking-history-view" className="space-y-3.5 animate-fade-in">
      {/* Header & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Istorija Plaćanja</h2>
            <p className="text-xs text-slate-500">Evidencija svih poslatih SMS parking poruka</p>
          </div>
        </div>

        {onClearHistory && (
          <button
            onClick={onClearHistory}
            className="p-2 rounded-xl bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors shadow-xs cursor-pointer"
            title="Obriši istoriju"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Summary Box */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-600 font-medium">Ukupno uplaćeno:</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-900">{totalSpent} RSD</span>
          <span className="text-[11px] text-slate-500 ml-1.5 font-medium">({history.length} uplate)</span>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {history.map((item) => {
          const dateStr = new Date(item.startedAt).toLocaleDateString('sr-RS', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const timeStr = new Date(item.startedAt).toLocaleTimeString('sr-RS', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <LicensePlateBadge plate={item.vehiclePlate} size="sm" />
                  <span className="text-xs font-bold text-slate-900">
                    {item.cityName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{item.zoneName}</span>
                  <span>•</span>
                  <span className="font-mono">SMS {item.smsNumber}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700">
                  {item.priceRsd} RSD
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {dateStr} {timeStr}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
