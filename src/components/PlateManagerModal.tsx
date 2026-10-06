import React, { useState } from 'react';
import { Vehicle } from '../types';
import { LicensePlateBadge } from './LicensePlateBadge';
import { formatPlateCanonical } from '../utils/plateUtils';
import { X, Plus, Trash2, Check, Star, Car, Shield } from 'lucide-react';

interface PlateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onSaveVehicles: (vehicles: Vehicle[]) => void;
  selectedVehicleId: string;
  onSelectVehicleId: (id: string) => void;
}

export const PlateManagerModal: React.FC<PlateManagerModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  onSaveVehicles,
  selectedVehicleId,
  onSelectVehicleId,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddPlate = (e: React.FormEvent) => {
    e.preventDefault();
    const rawPlate = newPlate.trim().toUpperCase();
    if (!rawPlate || rawPlate.length < 4) {
      setError('Unesite ispravnu registarsku oznaku (npr. BG 512-TX)');
      return;
    }

    const cleanPlate = formatPlateCanonical(rawPlate);
    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      plate: cleanPlate,
      nickname: newNickname.trim() || 'Moje vozilo',
      isDefault: vehicles.length === 0,
      color: '#3b82f6',
      icon: 'car',
    };

    const updated = [...vehicles, newVehicle];
    onSaveVehicles(updated);
    onSelectVehicleId(newVehicle.id);
    setNewPlate('');
    setNewNickname('');
    setError('');
    setIsAdding(false);
    onClose();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vehicles.length <= 1) {
      setError('Morate imati bar jedno sačuvano vozilo.');
      return;
    }
    const updated = vehicles.filter((v) => v.id !== id);
    onSaveVehicles(updated);
    if (selectedVehicleId === id) {
      onSelectVehicleId(updated[0].id);
    }
  };

  const handleSetDefault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = vehicles.map((v) => ({
      ...v,
      isDefault: v.id === id,
    }));
    onSaveVehicles(updated);
  };

  return (
    <div
      id="plate-manager-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="plate-manager-dialog"
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Moje Tablice i Vozila</h2>
              <p className="text-xs text-slate-500">Upravljajte registarskim oznakama</p>
            </div>
          </div>
          <button
            id="btn-close-plate-manager"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Vehicles List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {vehicles.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <div
                key={v.id}
                id={`vehicle-card-${v.id}`}
                onClick={() => {
                  onSelectVehicleId(v.id);
                  onClose();
                }}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-2 border-emerald-500 shadow-xs'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{v.nickname}</span>
                    {v.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                        Primarno
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!v.isDefault && (
                      <button
                        title="Postavi kao primarno"
                        onClick={(e) => handleSetDefault(v.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    {vehicles.length > 1 && (
                      <button
                        title="Obriši vozilo"
                        onClick={(e) => handleDelete(v.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <LicensePlateBadge plate={v.plate} size="md" selected={false} />
                  {isSelected ? (
                    <div
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs"
                      title="Izabrana tablica"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-center flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Form */}
        {isAdding ? (
          <form onSubmit={handleAddPlate} className="pt-3 border-t border-slate-100 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Registarska oznaka *</label>
              <input
                type="text"
                placeholder="Npr. BG 512-TX"
                value={newPlate}
                onChange={(e) => {
                  setNewPlate(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 uppercase tracking-wider focus:bg-white"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Naziv / Nadimak vozila</label>
              <input
                type="text"
                placeholder="Npr. Lični auto, Službeni..."
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setError('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Sačuvaj vozilo
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <button
              id="btn-add-new-plate"
              onClick={() => setIsAdding(true)}
              className="w-full py-3 rounded-2xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[16px]">Dodaj novo vozilo / tablicu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
