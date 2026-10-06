import { Vehicle, ParkedLocation, ParkingPaymentSession, CityData, CustomLocationOverride } from '../types';
import { formatPlateCanonical } from './plateUtils';

const VEHICLES_KEY = 'parking_app_vehicles';
const SELECTED_VEHICLE_ID_KEY = 'parking_app_selected_vehicle_id';
const PARKED_LOCATION_KEY = 'parking_app_parked_location';
const ACTIVE_SESSION_KEY = 'parking_app_active_session';
const HISTORY_KEY = 'parking_app_history';
const CUSTOM_CITIES_KEY = 'parking_app_custom_cities';
const LOCATION_OVERRIDES_KEY = 'parking_app_location_overrides';

export const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'v-1',
    plate: 'BG 512-TX',
    nickname: 'Lični auto',
    isDefault: true,
    color: '#3b82f6',
    icon: 'car',
  },
  {
    id: 'v-2',
    plate: 'NS 319-PE',
    nickname: 'Službeno vozilo',
    isDefault: false,
    color: '#10b981',
    icon: 'car',
  },
  {
    id: 'v-3',
    plate: 'NI 724-AB',
    nickname: 'Porodični auto',
    isDefault: false,
    color: '#f59e0b',
    icon: 'suv',
  },
];

export function getStoredVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(VEHICLES_KEY);
    if (!raw) {
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(DEFAULT_VEHICLES));
      return DEFAULT_VEHICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Normalizuj sve tablice tako da uvek imaju pravilan format sa crticom
      return parsed.map((v: Vehicle) => ({
        ...v,
        plate: formatPlateCanonical(v.plate || ''),
      }));
    }
    return DEFAULT_VEHICLES;
  } catch {
    return DEFAULT_VEHICLES;
  }
}

export function saveStoredVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  } catch (err) {
    console.error('Failed to save vehicles', err);
  }
}

export function getSelectedVehicleId(): string {
  try {
    const raw = localStorage.getItem(SELECTED_VEHICLE_ID_KEY);
    if (raw) return raw;
    const vehicles = getStoredVehicles();
    const defaultV = vehicles.find((v) => v.isDefault) || vehicles[0];
    return defaultV ? defaultV.id : '';
  } catch {
    return 'v-1';
  }
}

export function saveSelectedVehicleId(id: string): void {
  try {
    localStorage.setItem(SELECTED_VEHICLE_ID_KEY, id);
  } catch (err) {
    console.error('Failed to save selected vehicle', err);
  }
}

export function getStoredParkedLocation(): ParkedLocation | null {
  try {
    const raw = localStorage.getItem(PARKED_LOCATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredParkedLocation(loc: ParkedLocation | null): void {
  try {
    if (!loc) {
      localStorage.removeItem(PARKED_LOCATION_KEY);
    } else {
      localStorage.setItem(PARKED_LOCATION_KEY, JSON.stringify(loc));
    }
  } catch (err) {
    console.error('Failed to save parked location', err);
  }
}

export function getStoredActiveSession(): ParkingPaymentSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const session: ParkingPaymentSession = JSON.parse(raw);
    // If expired more than 4 hours ago, auto clean up
    if (Date.now() > session.expiresAt + 4 * 60 * 60 * 1000) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveStoredActiveSession(session: ParkingPaymentSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } else {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    }
  } catch (err) {
    console.error('Failed to save active session', err);
  }
}

export function getStoredHistory(): ParkingPaymentSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addHistorySession(session: ParkingPaymentSession): void {
  try {
    const list = getStoredHistory();
    const updated = [session, ...list].slice(0, 50); // Keep last 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to add history', err);
  }
}

export function getStoredCustomCities(): CityData[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CITIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredCustomCities(cities: CityData[]): void {
  try {
    localStorage.setItem(CUSTOM_CITIES_KEY, JSON.stringify(cities));
  } catch (err) {
    console.error('Failed to save custom cities', err);
  }
}

export function addOrUpdateCustomCity(city: CityData): void {
  try {
    const current = getStoredCustomCities();
    const existingIndex = current.findIndex((c) => c.id === city.id || c.name.toLowerCase() === city.name.toLowerCase());
    let updated: CityData[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = city;
    } else {
      updated = [city, ...current];
    }
    saveStoredCustomCities(updated);
  } catch (err) {
    console.error('Failed to add custom city', err);
  }
}

export function getStoredLocationOverrides(): CustomLocationOverride[] {
  try {
    const raw = localStorage.getItem(LOCATION_OVERRIDES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredLocationOverrides(overrides: CustomLocationOverride[]): void {
  try {
    localStorage.setItem(LOCATION_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.error('Failed to save location overrides', err);
  }
}

export function addOrUpdateLocationOverride(override: CustomLocationOverride): void {
  try {
    const list = getStoredLocationOverrides();
    // remove any within 150m or same id
    const filtered = list.filter((item) => item.id !== override.id);
    const updated = [override, ...filtered].slice(0, 50);
    saveStoredLocationOverrides(updated);
  } catch (err) {
    console.error('Failed to add location override', err);
  }
}

export function removeLocationOverride(id: string): void {
  try {
    const list = getStoredLocationOverrides();
    const updated = list.filter((item) => item.id !== id);
    saveStoredLocationOverrides(updated);
  } catch (err) {
    console.error('Failed to remove location override', err);
  }
}

/**
 * Kompletno briše sve lokalne podatke, registarske tablice, istoriju uplata,
 * sačuvane lokacije parkiranja i keširane podatke aplikacije.
 * Obezbeđuje maksimalnu privatnost i simulira potpuno čisto stanje aplikacije.
 */
export async function clearAllApplicationData(): Promise<void> {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (err) {
    console.error('Greška pri brisanju localStorage:', err);
  }

  // Obriši CacheStorage ako postoji (Service Worker / PWA keš)
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
    } catch (e) {
      console.warn('Greška pri brisanju caches:', e);
    }
  }

  // Deregistruj Service Worker-e
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        await r.unregister();
      }
    } catch (e) {
      console.warn('Greška pri deregistraciji serviceWorker-a:', e);
    }
  }
}
