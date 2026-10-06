import React, { useState, useEffect } from 'react';
import {
  Vehicle,
  CityData,
  ParkingZone,
  ParkedLocation,
  ParkingPaymentSession,
  ZoneDetectionResult,
  CustomLocationOverride,
} from './types';
import { REGIONAL_CITIES } from './data/citiesData';
import {
  getStoredVehicles,
  saveStoredVehicles,
  getSelectedVehicleId,
  saveSelectedVehicleId,
  getStoredParkedLocation,
  saveStoredParkedLocation,
  getStoredActiveSession,
  saveStoredActiveSession,
  getStoredHistory,
  addHistorySession,
  getStoredCustomCities,
  addOrUpdateCustomCity,
  getStoredLocationOverrides,
  saveStoredLocationOverrides,
  addOrUpdateLocationOverride,
} from './utils/storage';
import {
  findNearestCityAndZone,
  findBestZoneForLocation,
  reverseGeocode,
  reverseGeocodeDetails,
  calculateDistanceMeters,
} from './utils/geoHelper';
import { OnePageParkingView } from './components/OnePageParkingView';
import { ActiveSessionCard } from './components/ActiveSessionCard';
import { PlateManagerModal } from './components/PlateManagerModal';
import { CityPickerModal } from './components/CityPickerModal';
import { ParkedCarTrackerModal } from './components/ParkedCarTrackerModal';
import { ParkingHistoryModal } from './components/ParkingHistoryModal';
import { ZoneMapModal } from './components/ZoneMapModal';
import { ShareAppModal } from './components/ShareAppModal';
import { PlayStoreExportModal } from './components/PlayStoreExportModal';
import { TermsAndConditionsModal } from './components/TermsAndConditionsModal';
import { ResetAppDataModal } from './components/ResetAppDataModal';
import { OfficialStreetPickerModal } from './components/OfficialStreetPickerModal';
import { matchValjevoStreet } from './data/valjevoParkingData';
import { findZoneByStreetName } from './utils/geoHelper';
import { APP_CONFIG } from './config/version';
import {
  MapPin,
  History,
  Download,
  Share2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  X,
} from 'lucide-react';
import { triggerNativeSms } from './utils/smsHelper';
import {
  checkAndTriggerSessionAlerts,
  requestNotificationPermission,
  syncSessionWithServiceWorker,
  autoScheduleParkingExpiryNotification,
} from './utils/notificationHelper';

export default function App() {
  // App State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [customCities, setCustomCities] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData>(REGIONAL_CITIES[0]);
  const [selectedZone, setSelectedZone] = useState<ParkingZone>(REGIONAL_CITIES[0].zones[1]); // Default to Red / Zone 1
  const [parkedLocation, setParkedLocation] = useState<ParkedLocation | null>(null);
  const [activeSession, setActiveSession] = useState<ParkingPaymentSession | null>(null);
  const [history, setHistory] = useState<ParkingPaymentSession[]>([]);
  const [inAppAlert, setInAppAlert] = useState<{
    type: 'expiring' | 'expired';
    session: ParkingPaymentSession;
  } | null>(null);

  // Connectivity state (Offline / Online)
  const [, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Geolocation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [autoDetectedInfo, setAutoDetectedInfo] = useState<ZoneDetectionResult | null>(null);

  // Modals state for bottom and top actions
  const [isPlateManagerOpen, setIsPlateManagerOpen] = useState(false);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);
  const [isResetAppDataOpen, setIsResetAppDataOpen] = useState(false);
  const [isValjevoStreetPickerOpen, setIsValjevoStreetPickerOpen] = useState(false);
  const [isPhoneFrame] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Terms & Conditions / Compliance modal (accessible via button or menu)
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const handleAcceptTerms = () => {
    setIsTermsOpen(false);
    try {
      localStorage.setItem('parking_terms_accepted_v1', 'true');
    } catch {}
  };

  // Standalone installed mode check (PWA / Installed app)
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://') ||
      localStorage.getItem('parking_app_installed') === 'true'
    );
  });

  // User dismissed top install banner in current session
  const [isInstallBannerDismissed, setIsInstallBannerDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('parking_install_banner_dismissed') === 'true';
  });

  const dismissInstallBanner = () => {
    setIsInstallBannerDismissed(true);
    try {
      sessionStorage.setItem('parking_install_banner_dismissed', 'true');
    } catch {
      // ignore storage error
    }
  };

  // Load initial data & event listeners
  useEffect(() => {
    const loadedVehicles = getStoredVehicles();
    setVehicles(loadedVehicles);
    const savedVid = getSelectedVehicleId();
    setSelectedVehicleId(savedVid || (loadedVehicles[0]?.id ?? ''));

    const loadedCustomCities = getStoredCustomCities();
    setCustomCities(loadedCustomCities);

    const initialSession = getStoredActiveSession();
    setParkedLocation(getStoredParkedLocation());
    setActiveSession(initialSession);
    setHistory(getStoredHistory());

    if (initialSession) {
      syncSessionWithServiceWorker(initialSession);
    }

    // Auto-request notification permissions in background
    requestNotificationPermission().catch(() => {});

    // Check if opened with ?action=extend from background notification
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'extend') {
        if (initialSession) {
          triggerNativeSms(initialSession.smsNumber, initialSession.vehiclePlate);
          handleExtendSession(initialSession);
        }
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    // Service Worker message listener for notification extend actions
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'PARKING_ACTION') {
          if (event.data.action === 'extend') {
            const current = getStoredActiveSession();
            if (current) {
              triggerNativeSms(current.smsNumber, current.vehiclePlate);
              handleExtendSession(current);
            }
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Installed event listener
    const handleAppInstalled = () => {
      setIsStandalone(true);
      try {
        localStorage.setItem('parking_app_installed', 'true');
      } catch {}
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Watch for standalone display mode change
    const mql = window.matchMedia('(display-mode: standalone)');
    const handleMqlChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
        try {
          localStorage.setItem('parking_app_installed', 'true');
        } catch {}
      }
    };
    mql.addEventListener?.('change', handleMqlChange);

    // Initial GPS attempt
    detectUserLocation();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mql.removeEventListener?.('change', handleMqlChange);
    };
  }, []);

  // Periodic active session monitor for 5-minute alert and expiration notification
  useEffect(() => {
    if (!activeSession || activeSession.status === 'expired') return;

    // Immediate check upon session change
    const initialCheck = checkAndTriggerSessionAlerts(activeSession);
    if (initialCheck) {
      setActiveSession(initialCheck.session);
      saveStoredActiveSession(initialCheck.session);
      setInAppAlert({
        type: initialCheck.triggered,
        session: initialCheck.session,
      });
    }

    const interval = setInterval(() => {
      const current = getStoredActiveSession() || activeSession;
      const result = checkAndTriggerSessionAlerts(current);
      if (result) {
        setActiveSession(result.session);
        saveStoredActiveSession(result.session);
        setInAppAlert({
          type: result.triggered,
          session: result.session,
        });
      }
    }, 2000); // Check every 2 seconds for high responsiveness

    return () => clearInterval(interval);
  }, [activeSession]);

  // Detect GPS location & automatically match nearest city + exact zone or free parking
  const detectUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);

        // Fetch address details for smart street & suburb parsing
        let addressDetails: { streetName?: string; houseNumber?: string; suburbName?: string; fullAddress?: string } | undefined;
        try {
          const details = await reverseGeocodeDetails(coords.lat, coords.lng);
          addressDetails = {
            streetName: details.streetName,
            houseNumber: details.houseNumber,
            suburbName: details.suburbName,
            fullAddress: details.fullAddress,
          };
        } catch {
          // ignore network failure
        }

        // Find nearest city AND detect zone or unzoned area
        const result = findNearestCityAndZone(coords.lat, coords.lng, customCities, addressDetails);
        setSelectedCity(result.city);
        if (result.zone) {
          setSelectedZone(result.zone);
        } else if (result.isOutsidePaidZone) {
          setSelectedZone(null as any);
        } else if (result.city.zones.length > 0) {
          setSelectedZone(result.city.zones[0]);
        }
        setAutoDetectedInfo(result);
        setIsDetectingLocation(false);
      },
      async (err) => {
        console.warn('Geolocation notice:', err.message);
        setIsDetectingLocation(false);
        // Default to Belgrade center coordinates if permission denied
        const defaultCoords = { lat: 44.8186, lng: 20.4572 };
        setUserCoords(defaultCoords);
        const result = findNearestCityAndZone(defaultCoords.lat, defaultCoords.lng, customCities);
        setSelectedCity(result.city);
        if (result.zone) {
          setSelectedZone(result.zone);
        } else if (result.isOutsidePaidZone) {
          setSelectedZone(null as any);
        } else if (result.city.zones.length > 0) {
          setSelectedZone(result.city.zones[0]);
        }
        setAutoDetectedInfo(result);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSaveVehicles = (newVehicles: Vehicle[]) => {
    setVehicles(newVehicles);
    saveStoredVehicles(newVehicles);
  };

  const handleSelectVehicleId = (id: string) => {
    setSelectedVehicleId(id);
    saveSelectedVehicleId(id);
  };

  const handleSaveParkedLocation = (loc: ParkedLocation | null) => {
    setParkedLocation(loc);
    saveStoredParkedLocation(loc);
  };

  // Mark current location as free parking spot (saves persistent override)
  const handleMarkAsFreeParking = () => {
    if (userCoords) {
      const streetOrName = autoDetectedInfo?.streetName || autoDetectedInfo?.address || 'Moja lokacija';
      const override: CustomLocationOverride = {
        id: `free-override-${Date.now()}`,
        lat: userCoords.lat,
        lng: userCoords.lng,
        radiusMeters: 350,
        name: `Besplatno: ${streetOrName}`,
        isOutsidePaidZone: true,
        cityName: selectedCity.name,
        createdAt: Date.now(),
      };
      addOrUpdateLocationOverride(override);
    }
    const updatedInfo: ZoneDetectionResult = {
      city: selectedCity,
      zone: null,
      isOutsidePaidZone: true,
      reason: 'Označeno: Besplatan parking (Nema naplate)',
      streetName: autoDetectedInfo?.streetName,
      suburbName: autoDetectedInfo?.suburbName,
      address: autoDetectedInfo?.address,
    };
    setAutoDetectedInfo(updatedInfo);
    setSelectedZone(null as any);
  };

  // Reset zone detection (clears overrides near user location and re-runs GPS detection)
  const handleResetZoneDetection = () => {
    if (userCoords) {
      const overrides = getStoredLocationOverrides();
      const filtered = overrides.filter(
        (ov) => calculateDistanceMeters(userCoords.lat, userCoords.lng, ov.lat, ov.lng) > (ov.radiusMeters || 300)
      );
      saveStoredLocationOverrides(filtered);
    }
    detectUserLocation();
  };

  // Explicitly select official street from municipal enterprise list or search
  const handleSelectOfficialStreet = (streetName: string, selectedStreetZone?: ParkingZone | null) => {
    setIsValjevoStreetPickerOpen(false);
    if (selectedCity.id === 'valjevo') {
      const match = matchValjevoStreet(streetName);
      if (!match || match.isFreeArea) {
        const result: ZoneDetectionResult = {
          city: selectedCity,
          zone: null,
          isOutsidePaidZone: true,
          detectionMethod: 'street_list',
          reason: match?.reason || `Ulica „${streetName}“ nije pod naplatom JKP „Vidrak“ (Besplatan parking)`,
          streetName,
          streetMatched: match?.matchedName || streetName,
        };
        setSelectedZone(null as any);
        setAutoDetectedInfo(result);
      } else {
        const matchedZone =
          selectedCity.zones.find((z) => z.id === match.zoneId) ||
          (match.zoneId === 'va-1' ? selectedCity.zones[0] : selectedCity.zones[1]);
        const result: ZoneDetectionResult = {
          city: selectedCity,
          zone: matchedZone,
          isOutsidePaidZone: false,
          detectionMethod: 'street_list',
          reason: match.reason,
          streetName,
          streetMatched: match.matchedName,
        };
        setSelectedZone(matchedZone);
        setAutoDetectedInfo(result);
      }
      return;
    }

    // For any other regional city:
    if (selectedStreetZone) {
      const result: ZoneDetectionResult = {
        city: selectedCity,
        zone: selectedStreetZone,
        isOutsidePaidZone: false,
        detectionMethod: 'street_list',
        reason: `Ulica na zvaničnom spisku naplate: ${streetName} (${selectedStreetZone.name} - ${selectedCity.operator || selectedCity.name})`,
        streetName,
        streetMatched: streetName,
      };
      setSelectedZone(selectedStreetZone);
      setAutoDetectedInfo(result);
    } else {
      const match = findZoneByStreetName(streetName, selectedCity);
      if (match) {
        const result: ZoneDetectionResult = {
          city: selectedCity,
          zone: match.zone,
          isOutsidePaidZone: false,
          detectionMethod: 'street_list',
          reason: `Ulica na zvaničnom spisku naplate: ${match.streetMatched} (${match.zone.name} - ${selectedCity.operator || selectedCity.name})`,
          streetName,
          streetMatched: match.streetMatched,
          isBorderZone: match.isBorderZone,
          alternativeZone: match.alternativeZone,
          borderExplanation: match.borderExplanation,
        };
        setSelectedZone(match.zone);
        setAutoDetectedInfo(result);
      } else {
        const result: ZoneDetectionResult = {
          city: selectedCity,
          zone: null,
          isOutsidePaidZone: true,
          detectionMethod: 'street_list',
          reason: `Ulica „${streetName}“ nije na zvaničnom spisku ulica pod naplatom preduzeća ${selectedCity.operator || selectedCity.name} (Besplatan parking)`,
          streetName,
          streetMatched: streetName,
        };
        setSelectedZone(null as any);
        setAutoDetectedInfo(result);
      }
    }
  };

  // Complete application reset and memory wipe (before uninstall or by user request)
  const handleDataResetComplete = () => {
    setIsResetAppDataOpen(false);
    setVehicles([]);
    setSelectedVehicleId('');
    setActiveSession(null);
    setParkedLocation(null);
    setAutoDetectedInfo(null);
    setHistory([]);
    window.location.reload();
  };

  // Complete Payment: Create active session, add to history, auto-save location to device
  const handlePaymentTriggered = async (zone: ParkingZone) => {
    setSelectedZone(zone);
    const currentVehicle =
      vehicles.find((v) => v.id === selectedVehicleId) ||
      vehicles[0] || {
        id: 'default',
        plate: 'BG 512-TX',
        nickname: 'Lični auto',
        isDefault: true,
      };

    const now = Date.now();
    const durationMs = (zone.durationMinutes || 60) * 60 * 1000;
    const expiresAt = now + durationMs;

    const newSession: ParkingPaymentSession = {
      id: `session-${now}`,
      vehiclePlate: currentVehicle.plate,
      vehicleNickname: currentVehicle.nickname,
      cityName: selectedCity.name,
      zoneName: zone.name,
      smsNumber: zone.smsNumber,
      priceRsd: zone.priceRsd,
      startedAt: now,
      durationMinutes: zone.durationMinutes,
      expiresAt,
      status: 'active',
    };

    setActiveSession(newSession);
    saveStoredActiveSession(newSession);
    autoScheduleParkingExpiryNotification(newSession);
    addHistorySession(newSession);
    setHistory(getStoredHistory());

    // Auto-save parked spot
    const lat = userCoords?.lat || selectedCity.lat;
    const lng = userCoords?.lng || selectedCity.lng;
    const address = await reverseGeocode(lat, lng);

    const newParkedLoc: ParkedLocation = {
      lat,
      lng,
      address,
      savedAt: now,
      vehiclePlate: currentVehicle.plate,
      zoneName: `${selectedCity.name} - ${zone.name}`,
    };
    setParkedLocation(newParkedLoc);
    saveStoredParkedLocation(newParkedLoc);
  };

  const handleExtendSession = (currentSession: ParkingPaymentSession) => {
    const now = Date.now();
    const additionalMs = currentSession.durationMinutes * 60 * 1000;
    const newExpiresAt = Math.max(now, currentSession.expiresAt) + additionalMs;

    const updated: ParkingPaymentSession = {
      ...currentSession,
      expiresAt: newExpiresAt,
      status: 'extended',
    };

    setActiveSession(updated);
    saveStoredActiveSession(updated);
    autoScheduleParkingExpiryNotification(updated);

    // Log extension to history
    const extLog: ParkingPaymentSession = {
      ...updated,
      id: `ext-${Date.now()}`,
      startedAt: Date.now(),
    };
    addHistorySession(extLog);
    setHistory(getStoredHistory());
  };

  const handleEndSession = () => {
    syncSessionWithServiceWorker(null);
    setActiveSession(null);
    saveStoredActiveSession(null);
  };

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ||
    vehicles[0] || {
      id: 'default',
      plate: 'BG 512-TX',
      nickname: 'Lični auto',
      isDefault: true,
    };

  // Immediate 1-tap install if native browser prompt is ready, otherwise open beginner guide
  const handleOpenInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsStandalone(true);
          try {
            localStorage.setItem('parking_app_installed', 'true');
          } catch {}
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }
    setIsPlayStoreOpen(true);
  };

  // 1-tap native mobile share (Viber / WhatsApp / SMS) or open friendly share dialog
  const handleShareClick = async () => {
    let currentUrl = APP_CONFIG.publicShareUrl;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (!hostname.includes('ais-dev-') && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        currentUrl = window.location.origin + window.location.pathname;
      }
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: APP_CONFIG.name,
          text: 'Brzo i jednostavno SMS plaćanje parkinga po zonama – radi 100% samostalno bez interneta:',
          url: currentUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07111e] text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none font-sans">
      {/* Device wrapper / Mobile layout container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col bg-[#0c192c] ${
          isPhoneFrame
            ? 'max-w-md border-0 sm:border sm:border-blue-900/60 sm:rounded-[36px] sm:shadow-2xl overflow-hidden min-h-screen sm:min-h-[840px] sm:max-h-[92vh]'
            : 'max-w-4xl border border-blue-900/60 rounded-3xl p-4 shadow-2xl min-h-[85vh]'
        }`}
      >
        {/* Main Header */}
        <header className="px-4 sm:px-5 py-3.5 bg-[#0c192c] border-b border-blue-900/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-xs text-sm">
              P
            </div>
            <div>
              <h1 className="font-black text-white text-[17px] tracking-tight flex items-center gap-1.5">
                <span>{APP_CONFIG.name}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  v{APP_CONFIG.version}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-nav-map"
              onClick={() => setIsMapOpen(true)}
              className="w-8.5 h-8.5 rounded-xl bg-[#132742] hover:bg-[#1a3356] text-blue-200 flex items-center justify-center transition-colors border border-blue-800/60 cursor-pointer"
              title="Otvori mapu parking zona"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
            </button>
            <button
              id="btn-nav-share"
              onClick={handleShareClick}
              className="w-8.5 h-8.5 rounded-xl bg-[#132742] hover:bg-[#1a3356] text-blue-200 flex items-center justify-center transition-colors border border-blue-800/60 cursor-pointer"
              title="Podeli aplikaciju"
            >
              <Share2 className="w-4 h-4 text-slate-300" />
            </button>
            {!isStandalone && (
              <button
                id="btn-nav-playstore"
                onClick={handleOpenInstall}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
                title="Instaliraj aplikaciju na telefon"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instaliraj</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content View: Single Page Layout */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#0c192c]">
          {/* Top Prominent PWA Install Banner */}
          {!isStandalone && !isInstallBannerDismissed && (
            <div
              id="banner-install-pwa"
              className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-blue-950/90 border border-emerald-500/50 shadow-md flex items-center justify-between gap-2.5 animate-fade-in"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Download className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white truncate">
                    Instalirajte aplikaciju na telefon
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    1 klik sa ekrana • 100% radi bez interneta
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  id="btn-banner-install"
                  type="button"
                  onClick={handleOpenInstall}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 sm:hidden" />
                  <span>Instaliraj</span>
                </button>
                <button
                  type="button"
                  onClick={dismissInstallBanner}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Zatvori obaveštenje"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* In-App Expiration / 5-min Prompt */}
          {inAppAlert && (
            <div
              id="in-app-parking-alert"
              className={`p-4 rounded-2xl border shadow-lg space-y-3 animate-bounce-short ${
                inAppAlert.type === 'expired'
                  ? 'bg-red-900 text-white border-red-700'
                  : 'bg-amber-900 text-white border-amber-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-white">
                    {inAppAlert.type === 'expired'
                      ? '⚠️ Parking je ISTEKAO!'
                      : '⏱ Parking ističe za 5 minuta!'}
                  </h4>
                  <p className="text-xs text-white/90 mt-0.5 font-medium">
                    Vozilo: <b>{inAppAlert.session.vehiclePlate}</b> ({inAppAlert.session.cityName} - {inAppAlert.session.zoneName})
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    const sess = inAppAlert.session;
                    triggerNativeSms(sess.smsNumber, sess.vehiclePlate);
                    handleExtendSession(sess);
                    setInAppAlert(null);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Produži parking (SMS {inAppAlert.session.smsNumber})</span>
                </button>
                <button
                  onClick={() => {
                    handleEndSession();
                    setInAppAlert(null);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1 border border-white/30 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Odustani</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Parking Session Card */}
          {activeSession && (
            <ActiveSessionCard
              session={activeSession}
              onExtendSession={handleExtendSession}
              onEndSession={handleEndSession}
            />
          )}

          {/* Single Page Unified Parking View */}
          <OnePageParkingView
            vehicle={selectedVehicle}
            onOpenPlateManager={() => setIsPlateManagerOpen(true)}
            selectedCity={selectedCity}
            onOpenCityPicker={() => setIsCityPickerOpen(true)}
            userCoords={userCoords}
            isDetectingLocation={isDetectingLocation}
            onRefreshGps={detectUserLocation}
            autoDetectedInfo={autoDetectedInfo}
            onPaymentTriggered={handlePaymentTriggered}
            onMarkAsFreeParking={handleMarkAsFreeParking}
            onResetToAutoDetected={handleResetZoneDetection}
            onOpenTerms={() => setIsTermsOpen(true)}
          />
        </main>

        {/* Bottom Options: "Gde sam parkirao" and "Istorija" */}
        <footer className="p-3 bg-[#0c192c] border-t border-blue-900/50 grid grid-cols-2 gap-2 flex-shrink-0 shadow-xs">
          <button
            id="btn-bottom-tracker"
            type="button"
            onClick={() => setIsTrackerModalOpen(true)}
            className="relative py-3 px-4 rounded-2xl bg-[#132742] hover:bg-[#1a3356] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 border border-blue-800/60 transition-all shadow-2xs cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Gde sam parkirao</span>
            {parkedLocation && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-0.5" />
            )}
          </button>
          <button
            id="btn-bottom-history"
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="relative py-3 px-4 rounded-2xl bg-[#132742] hover:bg-[#1a3356] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 border border-blue-800/60 transition-all shadow-2xs cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-300" />
            <span>Istorija</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-900 text-blue-200 text-[10px] font-black border border-blue-700/60">
                {history.length}
              </span>
            )}
          </button>
        </footer>
      </div>

      {/* Plate Management Modal */}
      <PlateManagerModal
        isOpen={isPlateManagerOpen}
        onClose={() => setIsPlateManagerOpen(false)}
        vehicles={vehicles}
        onSaveVehicles={handleSaveVehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicleId={handleSelectVehicleId}
      />

      {/* City Picker Modal */}
      <CityPickerModal
        isOpen={isCityPickerOpen}
        onClose={() => setIsCityPickerOpen(false)}
        cities={[...customCities, ...REGIONAL_CITIES]}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          setSelectedCity(city);
          if (userCoords) {
            const res = findBestZoneForLocation(userCoords.lat, userCoords.lng, city);
            setSelectedZone(res.zone as any);
            setAutoDetectedInfo(res);
          } else if (city.zones.length > 0) {
            setSelectedZone(city.zones[0]);
          }
        }}
      />

      {/* "Gde sam parkirao" Modal */}
      <ParkedCarTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        parkedLocation={parkedLocation}
        userCoords={userCoords}
        vehicles={vehicles}
        onSaveParkedLocation={handleSaveParkedLocation}
        onOpenMap={() => {
          setIsTrackerModalOpen(false);
          setIsMapOpen(true);
        }}
        onTriggerGps={detectUserLocation}
      />

      {/* "Istorija" Modal */}
      <ParkingHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={() => {
          setHistory([]);
        }}
        onOpenResetAppData={() => setIsResetAppDataOpen(true)}
      />

      {/* Interactive Zone Map Modal */}
      <ZoneMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        city={selectedCity}
        selectedZone={selectedZone}
        onSelectZone={(zone) => {
          setSelectedZone(zone);
          setIsMapOpen(false);
        }}
        userCoords={userCoords}
        parkedLocation={parkedLocation}
        isOutsidePaidZone={autoDetectedInfo?.isOutsidePaidZone}
      />

      {/* Share Modal */}
      <ShareAppModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Play Store & .APK Export Modal */}
      <PlayStoreExportModal
        isOpen={isPlayStoreOpen}
        onClose={() => setIsPlayStoreOpen(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Terms and Conditions / Compliance Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onAccept={handleAcceptTerms}
      />

      {/* Official Municipal Enterprise Street Picker */}
      <OfficialStreetPickerModal
        isOpen={isValjevoStreetPickerOpen}
        onClose={() => setIsValjevoStreetPickerOpen(false)}
        city={selectedCity}
        onSelectStreet={handleSelectOfficialStreet}
        currentStreet={autoDetectedInfo?.streetMatched || autoDetectedInfo?.streetName}
      />

      {/* Reset & Wipe Application Data Modal */}
      <ResetAppDataModal
        isOpen={isResetAppDataOpen}
        onClose={() => setIsResetAppDataOpen(false)}
        onDataResetComplete={handleDataResetComplete}
      />
    </div>
  );
}
