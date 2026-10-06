import React, { useState, useMemo } from 'react';
import { CityData, ParkingZone } from '../types';
import { VALJEVO_OFFICIAL_STREETS } from '../data/valjevoParkingData';
import { CITY_ZONE_STREETS } from '../data/cityStreetsData';
import { normalizeStreetSearch } from '../utils/geoHelper';
import {
  Search,
  MapPin,
  Check,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export interface StreetDisplayItem {
  id: string;
  name: string;
  segmentDescription?: string;
  zone: ParkingZone | null;
  zoneName: string;
  zoneCode: string;
  zoneColor: string;
  smsNumber?: string;
  priceRsd?: number;
  isFree: boolean;
}

interface OfficialStreetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityData;
  onSelectStreet: (streetName: string, zone?: ParkingZone | null) => void;
  currentStreet?: string;
}

export const OfficialStreetPickerModal: React.FC<OfficialStreetPickerModalProps> = ({
  isOpen,
  onClose,
  city,
  onSelectStreet,
  currentStreet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  // Build the unified street list for the active city
  const allCityStreets = useMemo<StreetDisplayItem[]>(() => {
    if (!city) return [];

    if (city.id === 'valjevo') {
      return VALJEVO_OFFICIAL_STREETS.map((item) => {
        const isFree = item.zoneId === 'free';
        const zone = isFree
          ? null
          : city.zones.find((z) => z.id === item.zoneId) ||
            (item.zoneId === 'va-1' ? city.zones[0] : city.zones[1]);
        return {
          id: item.id,
          name: item.name,
          segmentDescription: item.segmentDescription,
          zone,
          zoneName: zone ? zone.name : 'Van zone naplate',
          zoneCode: zone ? zone.code : 'FREE',
          zoneColor: zone ? zone.color : '#10b981',
          smsNumber: zone?.smsNumber,
          priceRsd: zone?.priceRsd,
          isFree,
        };
      });
    }

    // For other regional cities: combine zone.streets and CITY_ZONE_STREETS
    const items: StreetDisplayItem[] = [];
    const seenNames = new Set<string>();
    const masterCityStreets = CITY_ZONE_STREETS[city.id] || {};

    for (const zone of city.zones) {
      const zoneStreetsFromObj = zone.streets || [];
      const zoneStreetsFromMaster = masterCityStreets[zone.id] || [];
      const combined = Array.from(new Set([...zoneStreetsFromObj, ...zoneStreetsFromMaster]));

      for (const strName of combined) {
        const trimmed = strName.trim();
        if (!trimmed || seenNames.has(trimmed.toLowerCase())) continue;
        seenNames.add(trimmed.toLowerCase());
        items.push({
          id: `${city.id}-${zone.id}-${trimmed}`,
          name: trimmed,
          zone,
          zoneName: zone.name,
          zoneCode: zone.code,
          zoneColor: zone.color,
          smsNumber: zone.smsNumber,
          priceRsd: zone.priceRsd,
          isFree: false,
        });
      }
    }
    return items;
  }, [city]);

  // Extract unique zones present in the street list
  const availableZones = useMemo(() => {
    const zonesMap = new Map<string, { id: string; name: string; color: string; count: number }>();
    for (const item of allCityStreets) {
      if (item.isFree || !item.zone) {
        const existing = zonesMap.get('free') || { id: 'free', name: 'Besplatno', color: '#10b981', count: 0 };
        existing.count++;
        zonesMap.set('free', existing);
      } else {
        const existing = zonesMap.get(item.zone.id) || {
          id: item.zone.id,
          name: item.zone.name,
          color: item.zone.color,
          count: 0,
        };
        existing.count++;
        zonesMap.set(item.zone.id, existing);
      }
    }
    return Array.from(zonesMap.values());
  }, [allCityStreets]);

  // Filtered street list
  const filteredStreets = useMemo(() => {
    let list = allCityStreets;
    if (selectedZoneFilter !== 'all') {
      if (selectedZoneFilter === 'free') {
        list = list.filter((s) => s.isFree);
      } else {
        list = list.filter((s) => s.zone?.id === selectedZoneFilter);
      }
    }

    if (!searchTerm.trim()) {
      return list;
    }

    const termNorm = normalizeStreetSearch(searchTerm);
    return list.filter((s) => {
      const nameNorm = normalizeStreetSearch(s.name);
      const descNorm = s.segmentDescription ? normalizeStreetSearch(s.segmentDescription) : '';
      return nameNorm.includes(termNorm) || descNorm.includes(termNorm);
    });
  }, [allCityStreets, searchTerm, selectedZoneFilter]);

  if (!isOpen) return null;

  const operatorName = city.operator || `JKP Parking servis ${city.name}`;

  return (
    <div
      id="official-street-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0e1b2e] rounded-3xl shadow-2xl border border-blue-900/60 overflow-hidden max-h-[90vh] flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#142640] border-b border-blue-900/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">Ulice u gradu: {city.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/25 text-blue-300 border border-blue-400/35">
                  {operatorName}
                </span>
              </div>
              <p className="text-xs text-blue-300/80 mt-0.5">
                Zvaničan spisak ulica pod naplatom preduzeća
              </p>
            </div>
          </div>
          <button
            id="close-official-street-picker-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Zatvori"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3.5 bg-[#102035] border-b border-blue-900/40 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="official-street-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Pretraži ulice u ${city.name} (latinica ili ćirilica)...`}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#0a1524] border border-blue-800/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedZoneFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedZoneFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              Sve ulice ({allCityStreets.length})
            </button>
            {availableZones.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZoneFilter(z.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedZoneFilter === z.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: z.color }}
                />
                <span>{z.name}</span>
                <span className="text-[10px] opacity-75">({z.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Unlisted Option: Free Parking */}
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-800/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Niste na spisku? Ulica van spiska JKP-a je besplatna.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectStreet(searchTerm.trim() || 'Ulica van zone naplate', null);
              onClose();
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-colors shadow-xs"
          >
            Postavi: Besplatan parking
          </button>
        </div>

        {/* Street List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh]">
          {filteredStreets.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <MapPin className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-300">
                  Nema ulica koje odgovaraju pretrazi „{searchTerm}“
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ako ulica nije na zvaničnom spisku {operatorName}, parkiranje je{' '}
                  <strong className="text-emerald-400">besplatno</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectStreet(searchTerm.trim() || 'Ulica van zone naplate', null);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Označi „{searchTerm.trim() || 'Ovu ulicu'}“ kao besplatno parkiranje</span>
              </button>
            </div>
          ) : (
            filteredStreets.map((street) => {
              const isSelected =
                currentStreet &&
                (normalizeStreetSearch(currentStreet) === normalizeStreetSearch(street.name) ||
                  currentStreet.toLowerCase().includes(street.name.toLowerCase()));

              return (
                <div
                  key={street.id}
                  onClick={() => {
                    onSelectStreet(street.name, street.zone);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-blue-900/30 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-[#12233b]/70 hover:bg-[#182c49] border-blue-950/70 hover:border-blue-800/80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                        {street.name}
                      </h4>
                      {street.isFree ? (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Besplatno
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white border"
                          style={{
                            backgroundColor: `${street.zoneColor}33`,
                            borderColor: street.zoneColor,
                            color: street.zoneColor,
                          }}
                        >
                          {street.zoneName}
                        </span>
                      )}
                    </div>
                    {street.segmentDescription && (
                      <p className="text-xs text-slate-300/90 mt-1 leading-snug">
                        {street.segmentDescription}
                      </p>
                    )}
                    {!street.isFree && street.priceRsd && (
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>Cena: <strong className="text-slate-200">{street.priceRsd} RSD/h</strong></span>
                        {street.smsNumber && (
                          <span>SMS broj: <strong className="text-blue-300">{street.smsNumber}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 text-blue-300 group-hover:text-white text-xs font-bold transition-all border border-blue-500/30"
                      >
                        Izaberi
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info notice */}
        <div className="p-3.5 bg-[#0a1524] border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Spisak preuzet iz zvanične odluke grada / javnog preduzeća.</span>
          </div>
          <span className="font-semibold text-slate-300">
            {filteredStreets.length} {filteredStreets.length === 1 ? 'ulica' : 'ulica'}
          </span>
        </div>
      </div>
    </div>
  );
};
