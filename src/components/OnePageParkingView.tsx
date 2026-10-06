import React, { useState } from 'react';
import {
  Vehicle,
  CityData,
  ParkingZone,
  ZoneDetectionResult,
} from '../types';
import { RealisticPlateButton } from './RealisticPlateButton';
import { checkParkingPaymentStatus, ParkingTimeStatus } from '../utils/parkingSchedule';
import { FreeParkingPromptModal } from './FreeParkingPromptModal';
import { OutsideZonePromptModal } from './OutsideZonePromptModal';
import { unlockAudioContext } from '../utils/audioAlert';
import {
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notificationHelper';
import { triggerNativeSms } from '../utils/smsHelper';
import {
  MapPin,
  Send,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';

// Helper to determine whether a hex color is perceived as light/bright or dark
function isLightColor(colorHex?: string): boolean {
  if (!colorHex) return false;
  let hex = colorHex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  // Perceived luminance (standard ITU-R BT.709 / YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 155;
}

const formatStreetWithHouseNumber = (info?: ZoneDetectionResult | null): string => {
  if (!info) return '';
  const baseStreet = info.streetMatched || info.streetName;
  if (baseStreet) {
    if (info.houseNumber) {
      if (new RegExp(`\\b${info.houseNumber}\\b`).test(baseStreet)) {
        return baseStreet;
      }
      return `${baseStreet} ${info.houseNumber}`;
    }
    return baseStreet;
  }
  if (info.address) {
    const firstPart = info.address.split(',')[0].trim();
    const cleanStreet = firstPart.replace(/\s*\([^)]*\)/g, '').trim();
    return cleanStreet || info.address;
  }
  return '';
};

interface OnePageParkingViewProps {
  vehicle: Vehicle;
  onOpenPlateManager: () => void;
  selectedCity: CityData;
  onOpenCityPicker: () => void;
  userCoords: { lat: number; lng: number } | null;
  isDetectingLocation: boolean;
  onRefreshGps: () => void;
  autoDetectedInfo: ZoneDetectionResult | null;
  onPaymentTriggered: (zone: ParkingZone) => void;
  onMarkAsFreeParking?: () => void;
  onResetToAutoDetected?: () => void;
  onOpenTerms?: () => void;
}

export const OnePageParkingView: React.FC<OnePageParkingViewProps> = ({
  vehicle,
  onOpenPlateManager,
  selectedCity,
  onOpenCityPicker,
  userCoords,
  isDetectingLocation,
  onRefreshGps,
  autoDetectedInfo,
  onPaymentTriggered,
  onMarkAsFreeParking,
  onOpenTerms,
}) => {
  // Modal states for user prompts
  const [promptFreeZone, setPromptFreeZone] = useState<{
    zone: ParkingZone;
    status: ParkingTimeStatus;
  } | null>(null);
  const [promptOutsideZone, setPromptOutsideZone] = useState<ParkingZone | null>(null);
  const [justMarkedFreeToast, setJustMarkedFreeToast] = useState(false);

  // If autoDetectedInfo detected a zone (e.g. Crvena zona in Valjevo), the user is inside a paid zone!
  const detectedZoneId = autoDetectedInfo?.zone?.id;
  const isOutsidePaidZone = detectedZoneId ? false : (autoDetectedInfo?.isOutsidePaidZone ?? false);

  // Active detected zone for time schedule check
  const detectedZone = selectedCity.zones.find((z) => z.id === detectedZoneId);
  const currentActiveTimeStatus = detectedZone
    ? checkParkingPaymentStatus(selectedCity, detectedZone)
    : checkParkingPaymentStatus(selectedCity);

  // Is parking currently free (either geographically confirmed outside paid zone with NO zone detected, or parking is free according to time schedule / weekend / night)?
  const isNoPaymentRequired = !detectedZone && isOutsidePaidZone
    ? true
    : (detectedZone ? currentActiveTimeStatus.isFreeNow : false);

  // Execute payment: unlocks audio, triggers SMS app and initiates session
  const executePayment = async (zone: ParkingZone) => {
    // 1. Unlock Web Audio API in user touch gesture
    unlockAudioContext();
    // 2. Request push notification permission if needed
    if (isNotificationSupported() && Notification.permission !== 'granted') {
      try {
        await requestNotificationPermission();
      } catch {}
    }
    // 3. Trigger native SMS application on the device with plate filled in
    triggerNativeSms(zone.smsNumber, vehicle.plate);
    // 4. Notify parent to start timer session and 5-min alert
    onPaymentTriggered(zone);
  };

  // Handle click on a zone card
  const handleZoneClick = (zone: ParkingZone) => {
    // Check 1: Is parking currently free (Sunday, Saturday for blue zone, after working hours)?
    const timeStatus = checkParkingPaymentStatus(selectedCity, zone);
    if (timeStatus.isFreeNow) {
      setPromptFreeZone({ zone, status: timeStatus });
      return;
    }

    // Check 2: Is user location outside the paid parking zone?
    if (userCoords && isOutsidePaidZone) {
      setPromptOutsideZone(zone);
      return;
    }

    // Direct payment
    executePayment(zone);
  };

  const handleTriggerMarkAsFree = () => {
    if (onMarkAsFreeParking) {
      onMarkAsFreeParking();
      setJustMarkedFreeToast(true);
      setTimeout(() => setJustMarkedFreeToast(false), 4000);
    }
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* 1. TOP: Realistic License Plate Button (Click to open plate manager) */}
      <div className="pt-0.5 pb-0.5">
        <RealisticPlateButton
          vehicle={vehicle}
          onClick={onOpenPlateManager}
        />
      </div>

      {/* 2. City & GPS Information Header */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-[#12243d] border border-blue-900/60 shadow-xs space-y-2">
        {/* Row 1: City name on left, Ažuriraj & Promeni grad on right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-[#1a3356] text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-800/60">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="font-extrabold text-white text-[15px] sm:text-base tracking-tight truncate">
              {selectedCity.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            <button
              type="button"
              onClick={onRefreshGps}
              className="px-2.5 py-1.5 rounded-xl bg-[#183153] hover:bg-[#20406d] text-blue-100 text-xs font-bold transition-colors border border-blue-800/60 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Ažuriraj GPS lokaciju"
            >
              <RefreshCw className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin text-blue-400' : ''}`} />
              <span>Ažuriraj</span>
            </button>
            <button
              type="button"
              onClick={onOpenCityPicker}
              className="px-2.5 py-1.5 rounded-xl bg-[#183153] hover:bg-[#20406d] text-blue-100 text-xs font-bold transition-colors border border-blue-800/60 flex items-center gap-1 active:scale-95 cursor-pointer"
              title="Promeni grad"
            >
              <span>Promeni grad</span>
              <ChevronRight className="w-3 h-3 text-blue-300" />
            </button>
          </div>
        </div>

        {/* Row 2: Full address (seen completely, no truncation) */}
        <div className="pt-2 border-t border-blue-900/40 text-xs text-blue-200/90 leading-relaxed font-medium">
          {isDetectingLocation ? (
            <div className="flex items-center gap-1.5 text-blue-400">
              <RefreshCw className="w-3 h-3 animate-spin flex-shrink-0" />
              <span>Očitavanje GPS lokacije...</span>
            </div>
          ) : (autoDetectedInfo?.address || autoDetectedInfo?.streetName || autoDetectedInfo?.streetMatched) ? (
            <div className="flex items-start gap-1.5 text-slate-200 break-words">
              <span className="text-blue-400 flex-shrink-0 mt-0.5">📍</span>
              <span className="leading-snug">
                {formatStreetWithHouseNumber(autoDetectedInfo)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-blue-300/60 text-[11px]">
              <span>Adresa nije očitana (dodirnite „Ažuriraj“ za očitavanje lokacije)</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. PROMINENT REAL-TIME PARKING STATUS BANNER */}
      {currentActiveTimeStatus.isFreeNow ? (
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#092925] border border-emerald-500/50 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-emerald-200 text-xs sm:text-sm tracking-tight">
                  ⏰ Vreme bez naplate parkinga
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/90 truncate">
                {currentActiveTimeStatus.message}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-600/40 flex-shrink-0">
            Besplatno
          </span>
        </div>
      ) : isOutsidePaidZone ? (
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#0a2f20] border border-emerald-500/50 shadow-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                  🛡️ Van zone naplate
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/90 truncate">
                {autoDetectedInfo?.reason || 'Van zone naplate. Nema potrebe za slanjem SMS poruke.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmation toast when marked as free */}
      {justMarkedFreeToast && (
        <div className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
          <span>Lokacija uspešno sačuvana kao besplatan parking (0 RSD)!</span>
        </div>
      )}

      {/* 4. PARKING ZONES LIST */}
      <div className="space-y-2">
        {/* City Paid Zones */}
        {selectedCity.zones.map((zone) => {
          const zoneTimeStatus = checkParkingPaymentStatus(selectedCity, zone);
          const isFreeAtThisMoment = zoneTimeStatus.isFreeNow;

          // Paid zone is active ONLY if:
          // 1. We are NOT outside a paid zone
          // 2. Parking is NOT currently free (not weekend, not after working hours, not unzoned)
          // 3. This specific zone matches the detected zone
          const isPaidParkingActive = !isNoPaymentRequired && !isFreeAtThisMoment;
          const isVehicleInZone = isPaidParkingActive && detectedZoneId === zone.id;
          const isDaily = zone.durationMinutes >= 1440;
          const isLight = isLightColor(zone.color);

          return (
            <button
              key={zone.id}
              id={`zone-btn-${zone.id}`}
              type="button"
              onClick={() => handleZoneClick(zone)}
              style={
                isVehicleInZone
                  ? {
                      backgroundColor: zone.color || '#2563eb',
                      borderColor: isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.5)',
                      boxShadow: `0 6px 20px ${zone.color || '#2563eb'}80, 0 0 0 2px ${
                        isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.5)'
                      }`,
                    }
                  : {
                      borderLeftWidth: '4px',
                      borderLeftColor: zone.color || '#3b82f6',
                    }
              }
              className={`group w-full relative py-2.5 px-3 sm:px-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer select-none active:scale-[0.985] flex flex-col justify-center gap-1 shadow-xs ${
                isVehicleInZone
                  ? 'border-2 ring-1'
                  : 'bg-[#0f1d31] border-slate-800/80 hover:border-slate-700 hover:bg-[#142640] text-white'
              }`}
            >
              {/* Row 1: Zone name + SMS number in continuation + "Vozilo u zoni" status badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                  {/* Dot indicator */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      isVehicleInZone
                        ? isLight
                          ? 'bg-slate-950 ring-1 ring-black/40'
                          : 'bg-white ring-1 ring-white/50'
                        : 'ring-1 ring-white/20'
                    }`}
                    style={
                      !isVehicleInZone
                        ? { backgroundColor: zone.color || '#3b82f6' }
                        : undefined
                    }
                  />

                  {/* Zone Name - letters highlighted in zone's color (Crvena zona = red, Plava zona = blue, etc.) */}
                  <h3
                    className={`font-black text-[14px] sm:text-[15px] leading-tight truncate ${
                      isVehicleInZone
                        ? isLight
                          ? 'text-slate-950 font-black'
                          : 'text-white font-black'
                        : ''
                    }`}
                    style={
                      !isVehicleInZone
                        ? { color: zone.color || '#60a5fa' }
                        : undefined
                    }
                  >
                    {zone.name}
                  </h3>

                  {/* SMS Number badge directly in continuation */}
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-black shadow-2xs flex items-center gap-1 flex-shrink-0 ${
                      isVehicleInZone
                        ? isLight
                          ? 'bg-slate-950 text-white'
                          : 'bg-black/30 text-white border border-white/30'
                        : 'border'
                    }`}
                    style={
                      !isVehicleInZone
                        ? {
                            backgroundColor: `${zone.color || '#2563eb'}22`,
                            borderColor: `${zone.color || '#2563eb'}70`,
                            color: zone.color || '#93c5fd',
                          }
                        : undefined
                    }
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>SMS {zone.smsNumber}</span>
                  </span>

                  {/* Colored status badge if vehicle is inside this active paid zone */}
                  {isVehicleInZone && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black shadow-2xs animate-pulse flex-shrink-0 ${
                        isLight
                          ? 'bg-black text-amber-300 border border-black/40'
                          : 'bg-white text-slate-900 border border-white/40'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLight ? 'bg-amber-300' : 'bg-slate-900'
                        }`}
                      />
                      Vozilo u zoni
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Duration & Price (Compact) */}
              <div
                className={`flex items-center gap-2 text-xs font-semibold flex-wrap ${
                  isVehicleInZone
                    ? isLight
                      ? 'text-slate-900'
                      : 'text-white/95'
                    : 'text-slate-300'
                }`}
              >
                <span className="font-bold">
                  {isDaily ? 'Celodnevno' : `${zone.durationMinutes} min`}
                </span>
                <span
                  className={
                    isVehicleInZone
                      ? isLight
                        ? 'text-slate-900/40'
                        : 'text-white/40'
                      : 'text-slate-500'
                  }
                >
                  •
                </span>
                <span
                  className={`font-black text-xs sm:text-sm ${
                    isVehicleInZone
                      ? isLight
                        ? 'text-slate-950'
                        : 'text-amber-200'
                      : 'text-amber-300'
                  }`}
                >
                  {zone.priceRsd} RSD
                </span>
                {zone.maxDurationHours && zone.maxDurationHours < 24 && (
                  <>
                    <span
                      className={
                        isVehicleInZone
                          ? isLight
                            ? 'text-slate-900/40'
                            : 'text-white/40'
                          : 'text-blue-400/50'
                      }
                    >
                      •
                    </span>
                    <span
                      className={`text-[11px] ${
                        isVehicleInZone
                          ? isLight
                            ? 'text-slate-800'
                            : 'text-white/80'
                          : 'text-slate-400'
                      }`}
                    >
                      Maks. {zone.maxDurationHours}h
                    </span>
                  </>
                )}
              </div>

              {/* Row 3: Working hours / additional zone info */}
              {zone.workingHours && (
                <p
                  className={`text-[11px] truncate flex items-center gap-1 ${
                    isVehicleInZone
                      ? isLight
                        ? 'text-slate-800 font-medium'
                        : 'text-white/85 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  <span>⏱ {zone.workingHours.split('(')[0].trim()}</span>
                  {zone.workingHours.includes('(') && (
                    <span
                      className={`font-semibold ${
                        isVehicleInZone
                          ? isLight
                            ? 'text-slate-950 font-bold'
                            : 'text-emerald-300 font-bold'
                          : 'text-emerald-400 font-medium'
                      }`}
                    >
                      ({zone.workingHours.split('(')[1]}
                    </span>
                  )}
                </p>
              )}
            </button>
          );
        })}

        {selectedCity.zones.length === 0 && (
          <div className="p-8 text-center bg-[#12243d] rounded-2xl border border-dashed border-blue-900/60 text-slate-400 text-xs">
            Nema dostupnih zona za izabrani grad.
          </div>
        )}

        {/* Optional secondary action if user parked in private courtyard or non-zone spot */}
        <div className="pt-1 flex justify-center">
          <button
            id="btn-mark-free-courtyard"
            type="button"
            onClick={handleTriggerMarkAsFree}
            className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Parkirani ste u dvorištu ili van zone? Sačuvaj lokaciju (0 RSD)</span>
          </button>
        </div>
      </div>

      {/* Privacy & Legal Compliance */}
      <div className="pt-2 pb-1 flex items-center justify-center">
        {onOpenTerms && (
          <button
            type="button"
            onClick={onOpenTerms}
            className="flex items-center gap-1.5 text-[11px] text-blue-300 hover:text-white transition-colors py-1 px-3 rounded-full hover:bg-blue-900/40 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Uslovi korišćenja & Privatnost</span>
          </button>
        )}
      </div>

      {/* Free Parking Pop-up Prompt (Requirement 4) */}
      {promptFreeZone && (
        <FreeParkingPromptModal
          isOpen={true}
          onClose={() => setPromptFreeZone(null)}
          onConfirmSendAnyway={() => {
            const z = promptFreeZone.zone;
            setPromptFreeZone(null);
            executePayment(z);
          }}
          zone={promptFreeZone.zone}
          city={selectedCity}
          timeStatus={promptFreeZone.status}
          vehiclePlate={vehicle.plate}
        />
      )}

      {/* Outside Zone Pop-up Prompt (Requirement 5) */}
      {promptOutsideZone && (
        <OutsideZonePromptModal
          isOpen={true}
          onClose={() => setPromptOutsideZone(null)}
          onConfirmSendAnyway={() => {
            const z = promptOutsideZone;
            setPromptOutsideZone(null);
            executePayment(z);
          }}
          zone={promptOutsideZone}
          city={selectedCity}
          vehiclePlate={vehicle.plate}
        />
      )}
    </div>
  );
};
