import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, CityData, ParkingZone, ZoneDetectionResult, CustomLocationOverride } from '../types';
import { REGIONAL_CITIES } from '../data/citiesData';
import { findBestZoneForLocation, findZoneByStreetName } from '../utils/geoHelper';
import { checkParkingPaymentStatus, ParkingTimeStatus } from '../utils/parkingSchedule';
import { triggerNativeSms } from '../utils/smsHelper';
import { unlockAudioContext } from '../utils/audioAlert';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSupported,
} from '../utils/notificationHelper';
import {
  MapPin,
  Compass,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  PenTool,
  CheckCircle2,
  Calendar,
  Check,
  X,
  Moon,
  LogOut,
  ShieldCheck,
  Hash,
  Layers,
  Map as MapIcon,
  SlidersHorizontal,
  BookmarkCheck,
  Search,
  Send,
  Zap,
  Bell,
} from 'lucide-react';

interface ZoneSelectorStepProps {
  vehicle: Vehicle;
  selectedCity: CityData;
  onSelectCity: (city: CityData) => void;
  selectedZone: ParkingZone | null;
  onSelectZone: (zone: ParkingZone) => void;
  userCoords: { lat: number; lng: number } | null;
  isDetectingLocation: boolean;
  onDetectLocation: () => void;
  autoDetectedInfo?: ZoneDetectionResult | null;
  onOpenMap?: () => void;
  onBack: () => void;
  onNext?: () => void;
  onPaymentCompleted?: (options: { autoSaveLocation: boolean }) => void;
  customCities?: CityData[];
  onSaveCustomCity?: (city: CityData) => void;
  onSaveLocationOverride?: (override: CustomLocationOverride) => void;
  isOnline?: boolean;
}

export const ZoneSelectorStep: React.FC<ZoneSelectorStepProps> = ({
  vehicle,
  selectedCity,
  onSelectCity,
  selectedZone,
  onSelectZone,
  userCoords,
  isDetectingLocation,
  onDetectLocation,
  autoDetectedInfo,
  onOpenMap,
  onBack,
  onNext,
  onPaymentCompleted,
  customCities = [],
  onSaveCustomCity,
  onSaveLocationOverride,
}) => {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [zoneTypeFilter, setZoneTypeFilter] = useState<'all' | 'hourly' | 'daily'>('all');

  // Manual interactive inputs for Zone dropdown & SMS number
  const [manualSmsInput, setManualSmsInput] = useState<string>(selectedZone?.smsNumber || '');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(selectedZone?.id || '');
  const [isManualOverrideActive, setIsManualOverrideActive] = useState<boolean>(false);
  const [isManualSubmenuOpen, setIsManualSubmenuOpen] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermissionStatus());

  // Exit App Modal state when parking is free
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // Calibration / Custom Override Modal state
  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState(false);
  const [overrideName, setOverrideName] = useState('');
  const [overrideType, setOverrideType] = useState<'free' | 'zone'>('free');
  const [overrideZoneId, setOverrideZoneId] = useState<string>('zone-red');
  const [overrideRadius, setOverrideRadius] = useState<number>(300);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Full custom creation modal state
  const [isCustomCityModalOpen, setIsCustomCityModalOpen] = useState(false);
  const [manualCustomCityName, setManualCustomCityName] = useState('');
  const [manualCustomZoneName, setManualCustomZoneName] = useState('');
  const [manualCustomSmsNumber, setManualCustomSmsNumber] = useState('');
  const [manualCustomPrice, setManualCustomPrice] = useState('60');
  const [manualCustomDuration, setManualCustomDuration] = useState('60');
  const [manualCustomColor, setManualCustomColor] = useState('#ef4444');
  const [manualCustomWorkingHours, setManualCustomWorkingHours] = useState('Pon-Pet 07:00-21:00, Sub 07:00-14:00');
  const [manualCustomError, setManualCustomError] = useState('');

  // Street search inside city zones
  const [streetSearchQuery, setStreetSearchQuery] = useState('');
  const [expandedZoneStreets, setExpandedZoneStreets] = useState<Record<string, boolean>>({});

  const matchedStreetZone = useMemo(() => {
    if (!streetSearchQuery.trim()) return null;
    return findZoneByStreetName(streetSearchQuery.trim(), selectedCity);
  }, [streetSearchQuery, selectedCity]);

  // Live timer tick for accurate time status checking
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  // Sync state when selectedZone or selectedCity changes
  useEffect(() => {
    if (selectedZone) {
      setSelectedZoneId(selectedZone.id);
      setManualSmsInput(selectedZone.smsNumber);
    }
  }, [selectedZone, selectedCity]);

  // Check parking schedule status (free vs active)
  const timeStatus: ParkingTimeStatus = checkParkingPaymentStatus(
    selectedCity,
    selectedZone || undefined
  );

  // Dynamically detect zone or unzoned area for the selected city and user coordinates
  const activeZoneDetection = useMemo(() => {
    if (autoDetectedInfo && autoDetectedInfo.city.id === selectedCity.id) {
      return autoDetectedInfo;
    }
    if (userCoords) {
      return findBestZoneForLocation(userCoords.lat, userCoords.lng, selectedCity);
    }
    return autoDetectedInfo || null;
  }, [autoDetectedInfo, userCoords, selectedCity]);

  // Calculate if current GPS is outside the paid parking zone of the selected city
  const isOutsidePaidParkingZone = activeZoneDetection?.zone
    ? false
    : (activeZoneDetection?.isOutsidePaidZone ?? false);

  // Parking is considered FREE if time schedule is free (Sunday/after-hours), or confirmed outside paid zone with no zone selected
  const isParkingFreeCondition = timeStatus.isFreeNow || (!selectedZone && isOutsidePaidParkingZone);

  // Combine standard regional cities + custom cities
  const allAvailableCities = [...customCities, ...REGIONAL_CITIES];
  const filteredCities = allAvailableCities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const displayedZones = selectedCity.zones.filter((z) => {
    if (zoneTypeFilter === 'hourly') return z.durationMinutes < 1440;
    if (zoneTypeFilter === 'daily') return z.durationMinutes >= 1440;
    return true;
  });

  // Handle Zone Dropdown Selection in Manual Entry Box
  const handleManualZoneDropdownChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setIsManualOverrideActive(true);
    const foundZone = selectedCity.zones.find((z) => z.id === zoneId);
    if (foundZone) {
      setManualSmsInput(foundZone.smsNumber);
      onSelectZone(foundZone);
    }
  };

  // Handle SMS Number input change with Auto Zone Detection
  const handleManualSmsInputChange = (inputVal: string) => {
    const cleanNumber = inputVal.replace(/[^\d+]/g, '');
    setManualSmsInput(cleanNumber);
    setIsManualOverrideActive(true);

    if (cleanNumber.length >= 3) {
      // 1. Check if matches any zone in current city
      const matchInCurrentCity = selectedCity.zones.find(
        (z) => z.smsNumber === cleanNumber
      );
      if (matchInCurrentCity) {
        setSelectedZoneId(matchInCurrentCity.id);
        onSelectZone(matchInCurrentCity);
        return;
      }

      // 2. Check if matches any zone across all regional cities
      for (const city of REGIONAL_CITIES) {
        const matchAny = city.zones.find((z) => z.smsNumber === cleanNumber);
        if (matchAny) {
          setSelectedZoneId(matchAny.id);
          onSelectZone(matchAny);
          return;
        }
      }

      // 3. Fallback: Create dynamic custom zone for this manual SMS number
      const dynamicZone: ParkingZone = {
        id: `manual-sms-${cleanNumber}`,
        name: `Manuelna Zona (SMS ${cleanNumber})`,
        code: cleanNumber.slice(-2),
        smsNumber: cleanNumber,
        priceRsd: 60,
        durationMinutes: 60,
        color: '#3b82f6',
        description: `Manuelno unet SMS broj: ${cleanNumber}`,
        workingHours: selectedCity.paymentSchedule,
      };
      setSelectedZoneId(dynamicZone.id);
      onSelectZone(dynamicZone);
    }
  };

  const handleExitAppClick = () => {
    setIsExitModalOpen(true);
    try {
      if (window.navigator && (window.navigator as any).app && (window.navigator as any).app.exitApp) {
        (window.navigator as any).app.exitApp();
      }
      window.close();
    } catch (e) {
      console.log('Close request handled by modal fallback');
    }
  };

  const handleCreateCustomCity = (e: React.FormEvent) => {
    e.preventDefault();
    const cityTrim = manualCustomCityName.trim();
    const zoneTrim = manualCustomZoneName.trim();
    const smsTrim = manualCustomSmsNumber.trim().replace(/\s+/g, '');

    if (!cityTrim) {
      setManualCustomError('Unesite naziv grada (npr. Zlatibor, Budva, Vrnjačka Banja)');
      return;
    }
    if (!zoneTrim) {
      setManualCustomError('Unesite naziv zone (npr. Crvena zona, Dnevna karta)');
      return;
    }
    if (!smsTrim || smsTrim.length < 3) {
      setManualCustomError('Unesite ispravan SMS broj (npr. 9111, 8211, 9241)');
      return;
    }

    const priceNum = parseInt(manualCustomPrice, 10) || 60;
    const durationNum = parseInt(manualCustomDuration, 10) || 60;

    const newZone: ParkingZone = {
      id: `custom-zone-${Date.now()}`,
      name: zoneTrim,
      code: zoneTrim.slice(0, 2).toUpperCase(),
      smsNumber: smsTrim,
      priceRsd: priceNum,
      durationMinutes: durationNum,
      color: manualCustomColor,
      description: `Manuelno uneta zona za ${cityTrim}`,
      workingHours: manualCustomWorkingHours || 'Pon-Pet 07:00-21:00, Sub 07:00-14:00',
    };

    const newCity: CityData = {
      id: `custom-city-${Date.now()}`,
      name: cityTrim,
      country: 'SRB',
      lat: userCoords?.lat || 44.7866,
      lng: userCoords?.lng || 20.4489,
      radiusKm: 10,
      paymentSchedule: manualCustomWorkingHours || 'Pon-Pet 07:00-21:00, Sub 07:00-14:00',
      zones: [newZone],
      infoNotice: 'Prilagođeni manuelni unos grada i zone.',
    };

    if (onSaveCustomCity) {
      onSaveCustomCity(newCity);
    }
    onSelectCity(newCity);
    onSelectZone(newZone);
    setIsManualOverrideActive(true);
    setManualSmsInput(smsTrim);
    setIsCustomCityModalOpen(false);
    setManualCustomCityName('');
    setManualCustomZoneName('');
    setManualCustomSmsNumber('');
    setManualCustomError('');
  };

  const handleDirectPay = async () => {
    const targetSms = selectedZone?.smsNumber || manualSmsInput;
    if (!targetSms) return;

    // 1. Unlock Web Audio API during this direct user click gesture
    unlockAudioContext();

    // 2. Request notification permission if not yet granted
    if (isNotificationSupported() && Notification.permission !== 'granted') {
      try {
        const granted = await requestNotificationPermission();
        setNotifPermission(granted ? 'granted' : 'denied');
      } catch {}
    }

    triggerNativeSms(targetSms, vehicle.plate);
    if (onPaymentCompleted) {
      setTimeout(() => {
        onPaymentCompleted({ autoSaveLocation: true });
      }, 400);
    } else if (onNext) {
      onNext();
    }
  };

  return (
    <div id="step-zone-selector" className="space-y-3.5 animate-fade-in text-slate-900">
      {/* Step Header with GPS Auto-Detect Button inline */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
            2
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
              Izbor Zone i Plaćanje
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-tight truncate">
              Izaberite zonu i pošaljite SMS
            </p>
          </div>
        </div>

        <button
          id="btn-auto-detect-gps"
          onClick={onDetectLocation}
          disabled={isDetectingLocation}
          className="w-[140px] sm:w-[150px] py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 flex-shrink-0 text-center cursor-pointer"
          title="Automatski prepoznaj grad i zonu preko GPS-a"
        >
          <Compass className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
          <span>{isDetectingLocation ? 'Očitavam...' : 'Očitaj GPS'}</span>
        </button>
      </div>

      {/* BANNER 1: Auto-detected Free Parking / Outside Paid Zone */}
      {isOutsidePaidParkingZone && (
        <div
          id="alert-out-of-zone-smart"
          className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex flex-col gap-2.5 shadow-sm animate-fade-in"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-bold text-sm">
                ✓
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950 tracking-tight">
                    Nalazite se VAN zone naplate (Besplatno)
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                    0 RSD / Slobodno
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-snug font-medium">
                  {activeZoneDetection?.reason || `Vaša GPS lokacija je izvan definisanih zona parkiranja u gradu ${selectedCity.name}. Parking je slobodan.`}
                </p>
                {activeZoneDetection?.suburbName && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Naselje: {activeZoneDetection.suburbName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons on Free Parking banner */}
          <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/70 flex-wrap">
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Prikaži poligone na mapi</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOverrideName(activeZoneDetection?.suburbName || activeZoneDetection?.streetName || 'Moja lokacija');
                setOverrideType('free');
                setIsCalibrateModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-200" />
              <span>★ Zapamti lokaciju kao Besplatno</span>
            </button>
          </div>
        </div>
      )}

      {/* BANNER: Granica zona (npr. Karađorđeva ulica u Valjevu) */}
      {!isOutsidePaidParkingZone && activeZoneDetection?.isBorderZone && (
        <div
          id="alert-border-zone-notice"
          className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col gap-2.5 shadow-sm animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs font-bold text-base">
              ⚠️
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-amber-950 tracking-tight">
                  Granica zona: {activeZoneDetection.zone?.name} / {activeZoneDetection.alternativeZone?.name}
                </h4>
                <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                  Proverite tablu na ulici
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-snug font-medium">
                {activeZoneDetection.borderExplanation ||
                  'Nalazite se na samoj granici dve zone. Zavisno od strane ulice ili parking mesta na kojem se nalazite, odaberite zonu:'}
              </p>
              {/* Dual-choice interactive buttons for quick 1-tap switching */}
              <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                {activeZoneDetection.zone && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectZone(activeZoneDetection.zone!);
                      setSelectedZoneId(activeZoneDetection.zone!.id);
                      setManualSmsInput(activeZoneDetection.zone!.smsNumber);
                      setIsManualOverrideActive(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                      selectedZone?.id === activeZoneDetection.zone.id
                        ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-sm'
                        : 'bg-white hover:bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    <span>👉 {activeZoneDetection.zone.name} ({activeZoneDetection.zone.smsNumber})</span>
                  </button>
                )}
                {activeZoneDetection.alternativeZone && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectZone(activeZoneDetection.alternativeZone!);
                      setSelectedZoneId(activeZoneDetection.alternativeZone!.id);
                      setManualSmsInput(activeZoneDetection.alternativeZone!.smsNumber);
                      setIsManualOverrideActive(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                      selectedZone?.id === activeZoneDetection.alternativeZone.id
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-sm'
                        : 'bg-white hover:bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    <span>👉 {activeZoneDetection.alternativeZone.name} ({activeZoneDetection.alternativeZone.smsNumber})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* City Selector */}
      <div className="relative space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-700" />
            <span>Grad:</span>
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Kliknite za promenu</span>
        </div>

        {/* City Trigger Box */}
        <div
          id="city-dropdown-trigger"
          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          className="w-full p-3 bg-white border-2 border-slate-300 hover:border-slate-900 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-xs hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xs">
              {selectedCity.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                  {selectedCity.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 uppercase font-mono font-bold">
                  {selectedCity.country}
                </span>
              </div>
              <p className="text-[14px] text-slate-600 font-bold">
                {selectedCity.zones.length} dostupnih parking zona
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              isCityDropdownOpen ? 'rotate-180 text-slate-900' : ''
            }`}
          />
        </div>

        {/* City Dropdown Menu */}
        {isCityDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <input
                type="text"
                placeholder="Pretraži grad po imenu..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-900"
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              <div
                onClick={() => {
                  setIsCityDropdownOpen(false);
                  setIsCustomCityModalOpen(true);
                }}
                className="p-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-2 cursor-pointer transition-colors border border-blue-200"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>+ Unesi manuelno novi grad / zonu</span>
              </div>

              {filteredCities.map((city) => (
                <div
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    onSelectZone(city.zones[0]);
                    setSelectedZoneId(city.zones[0].id);
                    setManualSmsInput(city.zones[0].smsNumber);
                    setIsCityDropdownOpen(false);
                    setCitySearch('');
                  }}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    city.id === selectedCity.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold">{city.name}</span>
                    <span className="text-xs opacity-75 font-mono">({city.zones.length} zona)</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      city.id === selectedCity.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {city.country}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Free Parking Status Banner */}
      {!isOutsidePaidParkingZone && timeStatus.isFreeNow && (
        <div
          id="alert-parking-free-schedule"
          className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-2.5 shadow-xs animate-fade-in"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
            <Moon className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-emerald-950 tracking-tight">
                {timeStatus.title}
              </h4>
              <span className="px-2 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-bold text-[14px] uppercase tracking-wide">
                Besplatno
              </span>
            </div>
            <p className="text-[14px] text-emerald-900 leading-snug font-medium">
              {timeStatus.message}
            </p>
            {timeStatus.nextPaymentStart && (
              <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-0.5">
                <Clock className="w-3 h-3 text-emerald-700" />
                <span>Sledeći termin: <b className="underline">{timeStatus.nextPaymentStart}</b></span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* CASE A: PARKING IS FREE (Compact trigger box to fit in 1 screen) */}
      {isParkingFreeCondition ? (
        <div id="free-parking-compact-section" className="space-y-2 animate-fade-in">
          <div
            id="manual-zone-trigger-box"
            onClick={() => setIsManualSubmenuOpen(true)}
            style={
              isManualOverrideActive && selectedZone
                ? {
                    backgroundColor: selectedZone.color,
                    borderColor:
                      selectedZone.color?.toLowerCase() === '#f59e0b' ||
                      selectedZone.color?.toLowerCase() === '#eab308' ||
                      selectedZone.color?.toLowerCase() === '#facc15'
                        ? '#b45309'
                        : 'rgba(0, 0, 0, 0.3)',
                    boxShadow: `0 8px 24px -3px ${selectedZone.color}75`,
                  }
                : {}
            }
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all shadow-xs hover:shadow-md group ${
              isManualOverrideActive && selectedZone
                ? selectedZone.color?.toLowerCase() === '#f59e0b' ||
                  selectedZone.color?.toLowerCase() === '#eab308' ||
                  selectedZone.color?.toLowerCase() === '#facc15'
                  ? 'text-slate-950 ring-2 ring-amber-400'
                  : 'text-white ring-2 ring-black/20'
                : 'bg-white border-slate-300 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  isManualOverrideActive && selectedZone
                    ? 'bg-black/20 text-current backdrop-blur-xs font-black'
                    : 'bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700'
                }`}
              >
                <PenTool className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm sm:text-base font-black tracking-tight ${
                      isManualOverrideActive && selectedZone
                        ? 'text-current'
                        : 'text-slate-900'
                    }`}
                  >
                    {isManualOverrideActive && selectedZone
                      ? `✓ Manuelno izabrana: ${selectedZone.name}`
                      : 'Manuelni izbor zone i SMS broja'}
                  </span>
                  {isManualOverrideActive && selectedZone && (
                    <span className="px-2.5 py-0.5 rounded-md bg-black text-white text-xs font-black font-mono shadow-xs">
                      SMS {selectedZone.smsNumber}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs font-medium truncate ${
                    isManualOverrideActive && selectedZone
                      ? 'text-current/90 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {isManualOverrideActive && selectedZone
                    ? `Cena: ${selectedZone.priceRsd} RSD • Kliknite za izmenu ili unos broja`
                    : 'Ako ipak želite da platite (unapred / garaža / posebna zona)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 pl-2 flex-shrink-0">
              <span
                className={`text-xs font-bold ${
                  isManualOverrideActive && selectedZone
                    ? 'text-current underline'
                    : 'text-blue-600 hidden sm:inline'
                }`}
              >
                {isManualOverrideActive ? 'Izmeni' : 'Otvori'}
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                  isManualOverrideActive && selectedZone
                    ? 'text-current'
                    : 'text-slate-500'
                }`}
              />
            </div>
          </div>
        </div>
      ) : (
        /* CASE B: REGULAR HOURS (Show list of zones + optional filter) */
        <div className="space-y-2.5">
          {/* Street Search Bar */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={`Pretraži zonu po ulici u ${selectedCity.name} (npr. Karađorđeva, Pantićeva...)`}
                value={streetSearchQuery}
                onChange={(e) => setStreetSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 focus:border-slate-900 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium shadow-xs focus:outline-none"
              />
              {streetSearchQuery && (
                <button
                  onClick={() => setStreetSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Matched street banner */}
            {matchedStreetZone && (
              <div
                onClick={() => {
                  onSelectZone(matchedStreetZone.zone);
                  setSelectedZoneId(matchedStreetZone.zone.id);
                  setManualSmsInput(matchedStreetZone.zone.smsNumber);
                }}
                className="p-3 bg-blue-50 border-2 border-blue-400 hover:bg-blue-100 rounded-xl flex items-center justify-between cursor-pointer transition-colors shadow-xs animate-fade-in"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: matchedStreetZone.zone.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-blue-950 truncate">
                      Pronađeno: {matchedStreetZone.streetMatched}
                    </p>
                    <p className="text-[11px] text-blue-800 font-medium truncate">
                      Zona: <b>{matchedStreetZone.zone.name}</b> • SMS: <b>{matchedStreetZone.zone.smsNumber}</b> ({matchedStreetZone.zone.priceRsd} RSD)
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs flex-shrink-0 ml-2">
                  Izaberi
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Izaberite zonu ({selectedCity.name}):
            </label>
            {/* Quick filter tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setZoneTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  zoneTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sve
              </button>
              <button
                onClick={() => setZoneTypeFilter('hourly')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  zoneTypeFilter === 'hourly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Na sat
              </button>
              <button
                onClick={() => setZoneTypeFilter('daily')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  zoneTypeFilter === 'daily'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Ceo dan
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {displayedZones.map((zone) => {
              const isSelected = zone.id === selectedZone?.id;
              const isDaily = zone.durationMinutes >= 1440;
              const isAutoDetectedThis = autoDetectedInfo?.zone?.id === zone.id;
              const zoneHours =
                zone.workingHours ||
                selectedCity.paymentSchedule ||
                'Pon-Pet: 07:00 - 21:00, Sub: 07:00 - 14:00';

              const isYellow =
                zone.color?.toLowerCase() === '#f59e0b' ||
                zone.color?.toLowerCase() === '#eab308' ||
                zone.color?.toLowerCase() === '#facc15' ||
                zone.color?.toLowerCase() === '#ffb800' ||
                zone.color?.toLowerCase() === '#fde047';

              return (
                <div
                  key={zone.id}
                  id={`zone-card-${zone.id}`}
                  onClick={() => {
                    onSelectZone(zone);
                    setSelectedZoneId(zone.id);
                    setManualSmsInput(zone.smsNumber);
                  }}
                  style={
                    isSelected
                      ? {
                          backgroundColor: zone.color,
                          borderColor: isYellow ? '#b45309' : 'rgba(0, 0, 0, 0.25)',
                          boxShadow: `0 10px 25px -4px ${zone.color}75, 0 4px 10px -2px ${zone.color}50`,
                        }
                      : {
                          borderLeftColor: zone.color,
                          borderLeftWidth: '6px',
                        }
                  }
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                    isSelected
                      ? isYellow
                        ? 'text-slate-950 ring-3 ring-amber-400/90 scale-[1.015]'
                        : 'text-white ring-3 ring-black/20 scale-[1.015]'
                      : 'bg-white border-slate-200/90 hover:border-slate-400 hover:bg-slate-50/80 text-slate-900 shadow-xs'
                  }`}
                >
                  {/* Highlight pill banner when selected or auto-detected */}
                  {isSelected && (
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-black/15">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                            isYellow
                              ? 'bg-slate-950 text-amber-300'
                              : 'bg-white text-slate-950'
                          }`}
                        >
                          {isAutoDetectedThis ? (
                            <>
                              <span>📍</span>
                              <span>Automatski detektovano GPS-om</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Izabrana zona za plaćanje</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isYellow ? 'text-slate-900' : 'text-white/90'
                        }`}
                      >
                        Aktivno
                      </span>
                    </div>
                  )}

                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        style={{ backgroundColor: isSelected ? (isYellow ? '#0f172a' : '#ffffff') : zone.color }}
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs ring-2 ring-white/80"
                      />
                      <span
                        className={`font-black text-lg sm:text-xl tracking-tight truncate ${
                          isSelected
                            ? isYellow
                              ? 'text-slate-950 font-black'
                              : 'text-white font-black'
                            : ''
                        }`}
                        style={!isSelected ? { color: zone.color || '#1e293b' } : undefined}
                      >
                        {zone.name}
                      </span>
                      {isDaily && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            isSelected
                              ? isYellow
                                ? 'bg-slate-950 text-amber-300'
                                : 'bg-white/90 text-slate-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          Ceo dan
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm shadow-xs flex-shrink-0 ${
                        isSelected
                          ? isYellow
                            ? 'bg-slate-950 text-amber-300 border border-slate-900'
                            : 'bg-black/90 text-white border border-white/40'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      SMS {zone.smsNumber}
                    </span>
                  </div>

                  {/* Duration & Price row */}
                  <div
                    className={`flex items-center justify-between text-xs sm:text-sm font-medium ${
                      isSelected
                        ? isYellow
                          ? 'text-slate-900'
                          : 'text-white/95'
                        : 'text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`w-4 h-4 ${
                          isSelected
                            ? isYellow
                              ? 'text-slate-900'
                              : 'text-white'
                            : 'text-slate-500'
                        }`}
                      />
                      <span className="font-bold">
                        {isDaily
                          ? 'Dnevna karta (Važi 24h od uplate)'
                          : `Trajanje: ${zone.durationMinutes} min`}
                        {zone.maxDurationHours ? ` (Maks. ${zone.maxDurationHours}h)` : ''}
                      </span>
                    </div>
                    <div
                      className={`font-black text-lg sm:text-xl ${
                        isSelected
                          ? isYellow
                            ? 'text-slate-950'
                            : 'text-white'
                          : 'text-slate-900'
                      }`}
                    >
                      {zone.priceRsd} RSD
                    </div>
                  </div>

                  {/* Working Hours for zone */}
                  <div
                    className={`pt-1.5 border-t flex items-center justify-between text-[11px] ${
                      isSelected
                        ? isYellow
                          ? 'border-amber-700/30 text-slate-900 font-bold'
                          : 'border-white/25 text-white/90 font-medium'
                        : 'border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isSelected
                            ? isYellow
                              ? 'text-slate-900'
                              : 'text-white/90'
                            : 'text-slate-500'
                        }`}
                      />
                      <span className="font-semibold">Vreme naplate:</span>
                      <span className="truncate">{zoneHours}</span>
                    </div>
                    {!isSelected && (
                      <span className="text-slate-400 font-bold text-[11px] hover:text-slate-900">
                        Kliknite za izbor
                      </span>
                    )}
                  </div>

                  {/* Covered streets in this zone */}
                  {zone.streets && zone.streets.length > 0 && (
                    <div
                      className={`mt-1 pt-1.5 border-t text-[11px] ${
                        isSelected
                          ? isYellow
                            ? 'border-amber-700/30'
                            : 'border-white/20'
                          : 'border-slate-100'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedZoneStreets((prev) => ({
                            ...prev,
                            [zone.id]: !prev[zone.id],
                          }))
                        }
                        className={`flex items-center justify-between w-full py-1 text-left font-bold transition-opacity hover:opacity-80 cursor-pointer ${
                          isSelected
                            ? isYellow
                              ? 'text-slate-950'
                              : 'text-white'
                            : 'text-blue-700'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span>🛣️</span>
                          <span>Pokrivene ulice ({zone.streets.length})</span>
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            expandedZoneStreets[zone.id] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedZoneStreets[zone.id] && (
                        <div
                          className={`mt-1 p-2 rounded-xl text-[11px] space-y-1 animate-fade-in ${
                            isSelected
                              ? isYellow
                                ? 'bg-amber-400/50 text-slate-950'
                                : 'bg-black/25 text-white'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {zone.streets.map((st, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="opacity-60">•</span>
                              <span className="font-medium">{st}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons: Pošalji SMS i plati, then Nazad at the bottom */}
      <div className="pt-2 flex flex-col gap-2.5">
        {isParkingFreeCondition && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Napomena: Parkiranje se trenutno ne naplaćuje (besplatno).</span>
            </div>
            <button
              id="btn-parking-free-exit"
              type="button"
              onClick={handleExitAppClick}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-white shrink-0" />
              <span>Parking je besplatan – Izađi</span>
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {/* Alarm status & permission activation button before payment */}
          {notifPermission !== 'granted' && isNotificationSupported() ? (
            <button
              type="button"
              onClick={async () => {
                const granted = await requestNotificationPermission();
                setNotifPermission(granted ? 'granted' : 'denied');
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Uključite zvučni alarm 5 min pre isteka</span>
              </div>
              <span className="text-[11px] bg-amber-200 px-2 py-0.5 rounded-lg text-amber-950 font-black">
                Uključi alarm
              </span>
            </button>
          ) : notifPermission === 'granted' ? (
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-emerald-900 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>Zvučni alarm i obaveštenje 5 min pre isteka su uključeni</span>
            </div>
          ) : null}

          {/* Main Direct SMS Pay Button */}
          {(() => {
            const isYellow =
              selectedZone?.color?.toLowerCase() === '#f59e0b' ||
              selectedZone?.color?.toLowerCase() === '#eab308' ||
              selectedZone?.color?.toLowerCase() === '#facc15';
            const targetSms = selectedZone?.smsNumber || manualSmsInput || '9111';
            return (
              <button
                id="btn-direct-sms-pay"
                onClick={handleDirectPay}
                style={{
                  backgroundColor: selectedZone?.color || '#0f172a',
                }}
                className={`w-full py-4.5 px-5 min-h-[62px] rounded-2xl hover:opacity-95 font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99] cursor-pointer ${
                  isYellow ? 'text-slate-950 ring-2 ring-amber-400' : 'text-white'
                }`}
              >
                <Send className="w-5 h-5 flex-shrink-0" />
                <span className="tracking-tight text-center leading-tight">
                  POŠALJI SMS ZA PARKIRANJE ({targetSms})
                  {selectedZone?.priceRsd ? ` – ${selectedZone.priceRsd} RSD` : ''}
                </span>
                <Zap className="w-5 h-5 flex-shrink-0" />
              </button>
            );
          })()}
        </div>

        {/* Button Nazad placed at the bottom */}
        <button
          id="btn-back-to-plates"
          onClick={onBack}
          className="w-full py-3.5 px-4 rounded-2xl border border-slate-300 bg-[#c7a871] hover:bg-[#b89862] text-slate-900 font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900" />
          <span className="text-[16px]">Nazad na izbor tablice</span>
        </button>
      </div>

      {/* Framed bottom action when manual override is active during free parking */}
      {isParkingFreeCondition && isManualOverrideActive && (
        <div className="pt-1">
          <button
            id="btn-exit-free-framed"
            onClick={() => {
              setIsManualOverrideActive(false);
              handleExitAppClick();
            }}
            className="w-full py-3 px-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-[0.99] cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Izađi bez plaćanja (parking je besplatan)</span>
          </button>
        </div>
      )}

      {/* Modal / Podmeni: Manuelni izbor zone i SMS broja */}
      {isManualSubmenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsManualSubmenuOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Manuelni izbor zone i SMS broja
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ako ipak želite da platite (unapred / garaža / posebna zona)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualSubmenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Field 1: Zone Dropdown Selector */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>1. Izaberite Parking Zonu ({selectedCity.name}):</span>
              </label>
              <div className="relative">
                <select
                  id="manual-zone-dropdown"
                  value={selectedZoneId}
                  onChange={(e) => handleManualZoneDropdownChange(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-sm sm:text-base font-bold text-slate-900 appearance-none cursor-pointer focus:outline-none transition-colors"
                >
                  <option value="" disabled>
                    -- Izaberite zonu iz liste --
                  </option>
                  {selectedCity.zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} – SMS {z.smsNumber} ({z.priceRsd} RSD)
                    </option>
                  ))}
                  {selectedZone &&
                    !selectedCity.zones.some((z) => z.id === selectedZone.id) && (
                      <option value={selectedZone.id}>
                        {selectedZone.name} – SMS {selectedZone.smsNumber}
                      </option>
                    )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Field 2: SMS Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span>2. SMS Broj za uplatu:</span>
                </label>
                <span className="text-xs text-slate-500 font-medium">Automatski prepoznaje</span>
              </div>
              <div className="relative">
                <input
                  id="manual-sms-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="Npr. 9111, 9112, 9118, 8211..."
                  value={manualSmsInput}
                  onChange={(e) => handleManualSmsInputChange(e.target.value)}
                  className="w-full p-3.5 pl-12 bg-slate-50 focus:bg-white border-2 border-slate-300 focus:border-slate-900 rounded-2xl text-xl font-black font-mono tracking-widest text-slate-900 focus:outline-none transition-all shadow-inner"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold text-sm">
                  SMS
                </div>
                {manualSmsInput.length >= 3 && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Prepoznato</span>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Zone Preview Pill */}
            {selectedZone && (
              <div
                id="manual-zone-selected-preview"
                style={{
                  backgroundColor: selectedZone.color || '#3b82f6',
                  borderColor:
                    selectedZone.color?.toLowerCase() === '#f59e0b' ||
                    selectedZone.color?.toLowerCase() === '#eab308' ||
                    selectedZone.color?.toLowerCase() === '#facc15'
                      ? '#b45309'
                      : 'rgba(0, 0, 0, 0.25)',
                  boxShadow: `0 8px 20px -3px ${selectedZone.color}70`,
                }}
                className={`p-3.5 border-2 rounded-2xl flex items-center justify-between shadow-md ${
                  selectedZone.color?.toLowerCase() === '#f59e0b' ||
                  selectedZone.color?.toLowerCase() === '#eab308' ||
                  selectedZone.color?.toLowerCase() === '#facc15'
                    ? 'text-slate-950 ring-2 ring-amber-400'
                    : 'text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black tracking-tight block">
                      {selectedZone.name}
                    </span>
                    <p className="text-xs opacity-90 font-bold">
                      {selectedZone.priceRsd} RSD • {selectedZone.durationMinutes >= 1440 ? '24h' : `${selectedZone.durationMinutes} min`}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-black text-white rounded-xl font-mono font-black text-xs shadow-xs">
                  SMS {selectedZone.smsNumber}
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsManualSubmenuOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Otkaži
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsManualOverrideActive(true);
                  setIsManualSubmenuOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Primeni i izaberi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Izlazak iz aplikacije (kada je parking besplatan) */}
      {isExitModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsExitModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Parking je trenutno besplatan!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Vreme naplate parkinga u gradu <b>{selectedCity.name}</b> je isteklo ili se nalazite van zone. Možete bezbedno parkirati bez slanja SMS poruke.
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-medium text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Status:</span>
              </div>
              <p className="pl-5 text-xs text-emerald-800">
                {timeStatus.message}
              </p>
            </div>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  try {
                    window.close();
                  } catch (e) {}
                  setIsExitModalOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Zatvori / Izađi iz aplikacije</span>
              </button>
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Ostani u aplikaciji
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manuelni unos novog grada i zone */}
      {isCustomCityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsCustomCityModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Unos Novog Grada i Zone</h3>
                  <p className="text-xs text-slate-500">Unesite parametre parking servisa</p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomCityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualCustomError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 font-semibold">
                {manualCustomError}
              </div>
            )}

            <form onSubmit={handleCreateCustomCity} className="space-y-3.5">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                  Naziv grada ili lokacije *
                </label>
                <input
                  type="text"
                  placeholder="Npr. Zlatibor, Budva, Vrnjačka Banja..."
                  value={manualCustomCityName}
                  onChange={(e) => setManualCustomCityName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                  Naziv parking zone *
                </label>
                <input
                  type="text"
                  placeholder="Npr. Crvena zona (1h) ili Dnevna karta"
                  value={manualCustomZoneName}
                  onChange={(e) => setManualCustomZoneName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                  SMS broj za uplatu *
                </label>
                <input
                  type="text"
                  placeholder="Npr. 9111, 8211, 9241..."
                  value={manualCustomSmsNumber}
                  onChange={(e) => setManualCustomSmsNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-base font-mono font-black text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                  Vreme naplate (radno vreme)
                </label>
                <input
                  type="text"
                  placeholder="Npr. Pon-Pet 07:00-21:00, Sub 07:00-14:00"
                  value={manualCustomWorkingHours}
                  onChange={(e) => setManualCustomWorkingHours(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                    Cena (RSD)
                  </label>
                  <input
                    type="number"
                    value={manualCustomPrice}
                    onChange={(e) => setManualCustomPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1">
                    Trajanje (minuti)
                  </label>
                  <select
                    value={manualCustomDuration}
                    onChange={(e) => setManualCustomDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  >
                    <option value="30">30 minuta</option>
                    <option value="60">1 sat (60 min)</option>
                    <option value="120">2 sata (120 min)</option>
                    <option value="180">3 sata (180 min)</option>
                    <option value="1440">Celodnevna (24h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block mb-1.5">
                  Boja zone:
                </label>
                <div className="flex items-center gap-2.5">
                  {[
                    { color: '#ef4444', label: 'Crvena' },
                    { color: '#3b82f6', label: 'Plava' },
                    { color: '#10b981', label: 'Zelena' },
                    { color: '#a855f7', label: 'Ljubičasta' },
                    { color: '#f59e0b', label: 'Žuta' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setManualCustomColor(c.color)}
                      style={{ backgroundColor: c.color }}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                        manualCustomColor === c.color
                          ? 'ring-2 ring-slate-900 ring-offset-2 scale-110'
                          : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomCityModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Sačuvaj i izaberi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kalibracija i pamćenje lokacije / zone */}
      {isCalibrateModalOpen && (
        <div
          id="calibrate-location-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsCalibrateModalOpen(false)}
        >
          <div
            id="calibrate-location-dialog"
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Kalibracija zone za ovu lokaciju
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Definišite pravilo kako aplikacija da prepoznaje ovo mesto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCalibrateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Naziv lokacije (opis):
                </label>
                <input
                  type="text"
                  placeholder="Npr. Moja zgrada, Posao, Karaburma, Zvezdara..."
                  value={overrideName}
                  onChange={(e) => setOverrideName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Režim parkiranja na ovoj adresi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideType('free')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      overrideType === 'free'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span>✓</span>
                      <span>Van zone (Besplatno)</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Ne naplaćuje se parking</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOverrideType('zone')}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      overrideType === 'zone'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span>🅿️</span>
                      <span>Konkretna zona</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Uvek izaberi ovu zonu</p>
                  </button>
                </div>
              </div>

              {overrideType === 'zone' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Izaberite zonu koja važi ovde:
                  </label>
                  <select
                    value={overrideZoneId}
                    onChange={(e) => setOverrideZoneId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-slate-900 focus:bg-white"
                  >
                    {selectedCity.zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (SMS {z.smsNumber} – {z.priceRsd} RSD)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Poluprečnik važenja:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[100, 250, 500, 1000].map((radius) => (
                    <button
                      key={radius}
                      type="button"
                      onClick={() => setOverrideRadius(radius)}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        overrideRadius === radius
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCalibrateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Otkaži
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!userCoords) return;
                    const newOverride: CustomLocationOverride = {
                      id: `override-${Date.now()}`,
                      name: overrideName || 'Moja lokacija',
                      lat: userCoords.lat,
                      lng: userCoords.lng,
                      radiusMeters: overrideRadius,
                      isOutsidePaidZone: overrideType === 'free',
                      zoneId: overrideType === 'zone' ? overrideZoneId : undefined,
                      createdAt: Date.now(),
                    };
                    if (onSaveLocationOverride) {
                      onSaveLocationOverride(newOverride);
                    }
                    setSaveSuccessMsg('Lokacija i pravilo uspešno sačuvani!');
                    setTimeout(() => {
                      setSaveSuccessMsg(null);
                      setIsCalibrateModalOpen(false);
                    }, 1200);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sačuvaj pravilo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
