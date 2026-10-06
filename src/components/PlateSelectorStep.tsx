import React from 'react';
import { Vehicle } from '../types';
import { LicensePlateBadge } from './LicensePlateBadge';
import { Plus, ArrowRight, Car, CheckCircle2 } from 'lucide-react';

interface PlateSelectorStepProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
  onOpenPlateManager: () => void;
  onNext: () => void;
}

export const PlateSelectorStep: React.FC<PlateSelectorStepProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicleId,
  onOpenPlateManager,
  onNext,
}) => {
  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div id="step-plate-selector" className="space-y-4 animate-fade-in">
      {/* Step Indicator Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Izaberite Tablicu</h2>
          <p className="text-sm text-slate-600">Za koje vozilo plaćate parking?</p>
        </div>
      </div>

      {/* Vehicles Cards List */}
      <div className="space-y-2.5">
        {vehicles.map((v) => {
          const isSelected = v.id === selectedVehicleId;
          return (
            <div
              key={v.id}
              id={`select-plate-${v.id}`}
              onClick={() => onSelectVehicleId(v.id)}
              className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-emerald-50/80 border-2 border-emerald-500 shadow-xs'
                  : 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                  }`}
                >
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{v.nickname}</span>
                    {v.isDefault && (
                      <span className="text-[10px] text-blue-600 font-semibold">★ Primarno</span>
                    )}
                  </div>
                  <div className="mt-1">
                    <LicensePlateBadge plate={v.plate} size="md" selected={false} />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-slate-400 flex items-center justify-center" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Delete plate shortcut */}
      <button
        id="btn-quick-add-plate"
        onClick={onOpenPlateManager}
        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-[#eddddd] hover:bg-[#e4d0d0] text-sm font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
      >
        <Plus className="w-4 h-4 text-slate-700" />
        <span className="text-[17px]">Dodaj / Obriši tablicu</span>
      </button>

      {/* Next Step Button */}
      <div className="pt-2">
        <button
          id="btn-next-to-zone"
          onClick={onNext}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#09a630] hover:bg-[#08902a] text-white font-black text-lg flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
        >
          <span className="text-[20px]">Izabrano: {selectedVehicle?.plate || 'Tablica'}</span>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
