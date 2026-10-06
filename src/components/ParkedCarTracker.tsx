import React, { useState, useEffect } from 'react';
import { ParkedLocation, Vehicle } from '../types';
import { LicensePlateBadge } from './LicensePlateBadge';
import {
  calculateDistanceMeters,
  formatDistance,
  calculateBearing,
  reverseGeocode,
} from '../utils/geoHelper';
import {
  MapPin,
  Navigation,
  Clock,
  Trash2,
  Edit3,
  Check,
  Share2,
  ExternalLink,
  Car,
  Plus,
} from 'lucide-react';

interface ParkedCarTrackerProps {
  parkedLocation: ParkedLocation | null;
  userCoords: { lat: number; lng: number } | null;
  vehicles: Vehicle[];
  onSaveParkedLocation: (location: ParkedLocation | null) => void;
  onOpenMap: () => void;
  onTriggerGps: () => void;
}

export const ParkedCarTracker: React.FC<ParkedCarTrackerProps> = ({
  parkedLocation,
  userCoords,
  vehicles,
  onSaveParkedLocation,
  onOpenMap,
  onTriggerGps,
}) => {
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number>(0);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(parkedLocation?.note || '');
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [selectedPlateForNew, setSelectedPlateForNew] = useState(
    vehicles[0]?.plate || 'BG 512-TX'
  );

  // Update distance & bearing when userCoords or parkedLocation change
  useEffect(() => {
    if (parkedLocation && userCoords) {
      const dist = calculateDistanceMeters(
        userCoords.lat,
        userCoords.lng,
        parkedLocation.lat,
        parkedLocation.lng
      );
      setDistanceMeters(dist);

      const angle = calculateBearing(
        userCoords.lat,
        userCoords.lng,
        parkedLocation.lat,
        parkedLocation.lng
      );
      setBearing(angle);
    } else {
      setDistanceMeters(null);
    }
  }, [parkedLocation, userCoords]);

  // Sync note
  useEffect(() => {
    if (parkedLocation) {
      setNoteText(parkedLocation.note || '');
    }
  }, [parkedLocation]);

  const handleSaveCurrentSpot = async () => {
    if (!userCoords) {
      onTriggerGps();
      return;
    }
    setIsSavingNew(true);
    const address = await reverseGeocode(userCoords.lat, userCoords.lng);
    const newLoc: ParkedLocation = {
      lat: userCoords.lat,
      lng: userCoords.lng,
      address,
      savedAt: Date.now(),
      vehiclePlate: selectedPlateForNew,
      note: noteText.trim() || undefined,
    };
    onSaveParkedLocation(newLoc);
    setIsSavingNew(false);
  };

  const handleUpdateNote = () => {
    if (!parkedLocation) return;
    onSaveParkedLocation({
      ...parkedLocation,
      note: noteText.trim() || undefined,
    });
    setIsEditingNote(false);
  };

  const handleClearLocation = () => {
    onSaveParkedLocation(null);
  };

  const handleOpenGoogleMaps = () => {
    if (!parkedLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parkedLocation.lat},${parkedLocation.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const handleShareLocation = () => {
    if (!parkedLocation) return;
    const text = `Moj auto (${parkedLocation.vehiclePlate}) je parkiran ovde: https://maps.google.com/?q=${parkedLocation.lat},${parkedLocation.lng}`;
    if (navigator.share) {
      navigator.share({
        title: 'Lokacija parkiranog auta',
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  const minutesAgo = parkedLocation
    ? Math.max(1, Math.round((Date.now() - parkedLocation.savedAt) / 60000))
    : 0;

  return (
    <div id="parked-car-tracker-view" className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Gde sam parkirao</h2>
            <p className="text-xs text-slate-500">Lokacija i navigacija do vašeg auta</p>
          </div>
        </div>

        {parkedLocation && (
          <button
            onClick={handleClearLocation}
            title="Obriši lokaciju"
            className="p-2 rounded-xl bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {parkedLocation ? (
        <div
          id="saved-parked-location-card"
          className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4"
        >
          {/* Top Plate & Time */}
          <div className="flex items-center justify-between">
            <LicensePlateBadge plate={parkedLocation.vehiclePlate} size="md" />
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {minutesAgo < 60 ? `Pre ${minutesAgo} min` : `Pre ${(minutesAgo / 60).toFixed(1)} h`}
              </span>
            </div>
          </div>

          {/* Compass & Distance Visual Needle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Rotating Compass Indicator */}
              <div className="relative w-14 h-14 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs">
                <div
                  style={{ transform: `rotate(${bearing}deg)` }}
                  className="transition-transform duration-500 text-blue-600"
                >
                  <Navigation className="w-7 h-7 fill-blue-600 drop-shadow-xs" />
                </div>
                <div className="absolute top-1 text-[8px] font-bold text-slate-400">N</div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Udaljenost od auta:
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {distanceMeters !== null ? formatDistance(distanceMeters) : 'Očitavanje...'}
                </span>
              </div>
            </div>

            {/* In-app map button */}
            <button
              id="btn-open-car-map"
              onClick={onOpenMap}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-700" />
              <span>Mapa</span>
            </button>
          </div>

          {/* Address & Coordinates */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              <span>Adresa / Pozicija:</span>
            </div>
            <p className="text-xs font-medium text-slate-900 pl-5">
              {parkedLocation.address ||
                `Koordinate: ${parkedLocation.lat.toFixed(5)}, ${parkedLocation.lng.toFixed(5)}`}
            </p>
          </div>

          {/* Parking Notes / Spot info */}
          <div className="pt-2 border-t border-slate-100">
            {isEditingNote ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Npr. Sprat -1, stub B12, preko puta rampe..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={handleUpdateNote}
                    className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Sačuvaj</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <div className="text-slate-600 italic truncate pr-2">
                  {parkedLocation.note ? `"${parkedLocation.note}"` : '+ Dodaj belešku (npr. sprat, broj mesta)'}
                </div>
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Izmeni</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Navigate in Google Maps & Share */}
          <div className="pt-1 flex gap-2.5">
            <button
              id="btn-navigate-to-car"
              onClick={handleOpenGoogleMaps}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white" />
              <span>Navigiraj do auta</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
            <button
              onClick={handleShareLocation}
              title="Podeli lokaciju auta"
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State: Prompt to save current location */
        <div className="p-6 bg-white border border-dashed border-slate-300 rounded-3xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6 text-slate-700" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Nema sačuvane lokacije auta</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Kada se parkirate, sačuvajte lokaciju jednim klikom kako biste lako pronašli auto.
            </p>
          </div>

          {/* Select which plate to park */}
          <div className="max-w-xs mx-auto text-left space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600">Za tablicu:</label>
            <select
              value={selectedPlateForNew}
              onChange={(e) => setSelectedPlateForNew(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 shadow-xs"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.plate}>
                  {v.plate} - {v.nickname}
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-save-current-parking-spot"
            onClick={handleSaveCurrentSpot}
            disabled={isSavingNew}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isSavingNew ? 'Čuvam lokaciju...' : 'Sačuvaj trenutnu lokaciju parkiranja'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
