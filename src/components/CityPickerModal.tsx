import React, { useState } from 'react';
import { CityData } from '../types';
import { X, Search, MapPin, Check } from 'lucide-react';

interface CityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityData[];
  selectedCity: CityData;
  onSelectCity: (city: CityData) => void;
}

export const CityPickerModal: React.FC<CityPickerModalProps> = ({
  isOpen,
  onClose,
  cities,
  selectedCity,
  onSelectCity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Izaberite grad</h3>
              <p className="text-xs text-slate-500">Gradovi u Srbiji i regionu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži grad (npr. Beograd, Novi Sad, Niš)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Cities List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-slate-100">
          {filteredCities.map((city) => {
            const isSelected = city.id === selectedCity.id;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-colors text-left ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200/80 font-mono text-slate-700 uppercase">
                    {city.country || 'SRB'}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{city.name}</div>
                    <div className="text-xs text-slate-500">
                      {city.zones.length} {city.zones.length === 1 ? 'zona' : 'zone/opcija'}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
          {filteredCities.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              Nijedan grad ne odgovara pretrazi "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
