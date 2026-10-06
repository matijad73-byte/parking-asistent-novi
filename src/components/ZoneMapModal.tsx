import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CityData, ParkingZone, ParkedLocation } from '../types';
import { X, MapPin, CheckCircle, List, Map as MapIcon, ChevronRight } from 'lucide-react';
import { ALL_CITY_ZONE_POLYGONS, BELGRADE_ZONE_POLYGONS } from '../data/zonePolygons';
import { isPointInPolygon } from '../utils/geoHelper';

interface ZoneMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityData;
  selectedZone?: ParkingZone | null;
  onSelectZone?: (zone: ParkingZone) => void;
  userCoords?: { lat: number; lng: number } | null;
  parkedLocation?: ParkedLocation | null;
  isOutsidePaidZone?: boolean;
}

export const ZoneMapModal: React.FC<ZoneMapModalProps> = ({
  isOpen,
  onClose,
  city,
  selectedZone,
  onSelectZone,
  userCoords,
  parkedLocation,
  isOutsidePaidZone,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'streets'>('map');
  const [streetFilter, setStreetFilter] = useState('');

  // When switching to map tab, make sure Leaflet map invalidates its size
  useEffect(() => {
    if (activeTab === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Center coordinates: prioritize user GPS if within city, else city center
    const centerLat = userCoords?.lat || city.lat;
    const centerLng = userCoords?.lng || city.lng;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], 13);
    }

    const map = mapInstanceRef.current;
    const layersGroup = L.layerGroup().addTo(map);

    // 1. Draw Real Zone Polygons for this city if available
    const cityPolygons = ALL_CITY_ZONE_POLYGONS[city.id] || (city.id.includes('beograd') ? BELGRADE_ZONE_POLYGONS : []);
    if (cityPolygons.length > 0) {
      cityPolygons.forEach((poly) => {
        const matchingZone = city.zones.find(
          (z) => z.id === poly.zoneId || z.code === poly.code || z.smsNumber === poly.smsNumber
        );

        const polygonLayer = L.polygon(poly.coordinates, {
          color: poly.color,
          weight: selectedZone?.id === matchingZone?.id ? 4 : 2,
          fillColor: poly.color,
          fillOpacity: selectedZone?.id === matchingZone?.id ? 0.35 : 0.18,
          dashArray: undefined,
        }).addTo(layersGroup);

        polygonLayer.bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
            <b style="color: ${poly.color}; font-size: 14px;">${poly.name}</b><br/>
            SMS Broj: <b>${poly.smsNumber}</b><br/>
            ${matchingZone ? `Cena: <b>${matchingZone.priceRsd} RSD</b> / ${matchingZone.durationMinutes} min<br/>` : ''}
            <span style="color: #64748b; font-size: 11px;">Kliknite da izaberete ovu zonu</span>
          </div>
        `);

        if (matchingZone && onSelectZone) {
          polygonLayer.on('click', () => {
            onSelectZone(matchingZone);
          });
        }
      });
    }

    // 2. Add User's current GPS location marker if available
    if (userCoords) {
      let isInsideAnyPoly = false;
      let matchedPolyName = '';
      for (const poly of cityPolygons) {
        if (isPointInPolygon(userCoords.lat, userCoords.lng, poly.coordinates)) {
          isInsideAnyPoly = true;
          matchedPolyName = poly.name;
          break;
        }
      }

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-9 h-9 rounded-full ${isInsideAnyPoly ? 'bg-amber-500/30' : 'bg-emerald-500/30'} animate-ping"></div>
            <div class="w-6 h-6 rounded-full ${isInsideAnyPoly ? 'bg-amber-500' : 'bg-emerald-600'} border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-white font-bold">
              📍
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(layersGroup);
      userMarker
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px;">
            <b>Vaša trenutna GPS lokacija</b><br/>
            ${
              isInsideAnyPoly
                ? `<span style="color: #b45309; font-weight: bold;">Unutar: ${matchedPolyName}</span>`
                : `<span style="color: #059669; font-weight: bold;">✓ Van zone naplate (Besplatno)</span>`
            }
          </div>
        `)
        .openPopup();
    }

    // 3. Add Parked Car Marker if saved
    if (parkedLocation) {
      const carIcon = L.divIcon({
        className: 'custom-car-marker',
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl text-white font-bold text-xs">
            🚗
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([parkedLocation.lat, parkedLocation.lng], { icon: carIcon })
        .addTo(layersGroup)
        .bindPopup(`<b>Parkiran auto</b><br/>${parkedLocation.vehiclePlate}<br/>${parkedLocation.address || ''}`);
    }

    // Cleanup when closing
    return () => {
      layersGroup.clearLayers();
    };
  }, [isOpen, city, userCoords, parkedLocation, selectedZone, onSelectZone]);

  // Clean up full map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      id="zone-map-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="zone-map-dialog"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Zone & Ulice - {city.name}</h3>
              <p className="text-[11px] text-slate-500">
                {city.operator ? `${city.operator} • ` : ''}Poligoni i spisak ulica
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  activeTab === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>
              <button
                onClick={() => setActiveTab('streets')}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  activeTab === 'streets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Ulice</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Banner if outside paid zone (Shown ONLY on Map tab) */}
        {activeTab === 'map' && isOutsidePaidZone && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Nalazite se na zelenoj tački izvan obojenih poligona – Parking je besplatan!</span>
          </div>
        )}

        {/* Content View: MAP or STREETS */}
        {/* 1. Map Tab Container */}
        <div className={`flex-1 relative w-full h-full bg-slate-100 ${activeTab === 'map' ? 'block' : 'hidden'}`}>
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* 2. Streets Tab Container (Purely Text with Streets & Search) */}
        {activeTab === 'streets' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
            {/* Search Streets Input */}
            <div className="sticky top-0 z-10 bg-slate-50 pb-1">
              <input
                type="text"
                value={streetFilter}
                onChange={(e) => setStreetFilter(e.target.value)}
                placeholder={`Pretraži ulice u gradu ${city.name}...`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            {city.operator && (
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Zvanični operater:</p>
                <p className="text-sm font-bold text-slate-900">{city.operator}</p>
                {city.paymentSchedule && (
                  <p className="text-xs text-slate-600 mt-1">{city.paymentSchedule}</p>
                )}
              </div>
            )}

            {city.zones.map((zone) => {
              const streetsList = zone.streets || [];
              const filteredStreets = streetFilter.trim()
                ? streetsList.filter((s) => s.toLowerCase().includes(streetFilter.toLowerCase()))
                : streetsList;

              if (streetFilter.trim() && filteredStreets.length === 0 && !zone.name.toLowerCase().includes(streetFilter.toLowerCase())) {
                return null;
              }

              return (
                <div
                  key={zone.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-xs"
                        style={{ backgroundColor: zone.color }}
                      />
                      <h4 className="font-bold text-sm text-slate-900">{zone.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                      SMS {zone.smsNumber}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between font-medium">
                    <span>Cena: <b className="text-slate-900">{zone.priceRsd} RSD</b> / {zone.durationMinutes} min</span>
                    {zone.maxDurationMinutes && (
                      <span className="text-amber-700 font-bold">Maks. {zone.maxDurationMinutes} min</span>
                    )}
                  </div>

                  {streetsList.length > 0 ? (
                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Spisak ulica ({filteredStreets.length}):
                      </p>
                      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5 text-xs text-slate-800 border border-slate-200/70 max-h-56 overflow-y-auto">
                        {filteredStreets.length > 0 ? (
                          filteredStreets.map((st, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-slate-400 font-bold flex-shrink-0">•</span>
                              <span className="font-medium">{st}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">Nema ulica koje odgovaraju pretrazi.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 border border-slate-200/60">
                      <p className="font-medium">
                        {zone.description || `Sve ulice i parking mesta obuhvaćena zonom ${zone.name}.`}
                      </p>
                    </div>
                  )}

                  {onSelectZone && (
                    <button
                      onClick={() => {
                        onSelectZone(zone);
                        onClose();
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span>Izaberi ovu zonu ({zone.name.split('(')[0]})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend / Footer info bar (Shown ONLY on Map tab) */}
        {activeTab === 'map' && (
          <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> A
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> 1
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 2
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 3
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Plava
                </span>
              </div>
              {selectedZone ? (
                <span className="text-slate-900 font-bold truncate">
                  Izabrano: {selectedZone.name}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  Bez zone (Besplatan parking)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
