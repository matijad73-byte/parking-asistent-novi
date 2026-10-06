export interface Vehicle {
  id: string;
  plate: string; // e.g. "BG 1234-AB" or "BG1234AB"
  nickname: string; // e.g. "Moj Golf", "Službeni Passat"
  isDefault?: boolean;
  color?: string;
  icon?: 'car' | 'suv' | 'truck' | 'motorcycle';
}

export interface ParkingZone {
  id: string;
  name: string; // e.g. "Zona 1 (Crvena)", "Zona A"
  code: string; // e.g. "1", "A", "0"
  smsNumber: string; // e.g. "9111"
  dailySmsNumber?: string; // e.g. "9140"
  priceRsd: number; // e.g. 60
  dailyPriceRsd?: number; // e.g. 168
  durationMinutes: number; // e.g. 60 or 1440 for daily
  maxDurationHours?: number; // e.g. 3
  maxDurationMinutes?: number; // e.g. 180
  color: string; // Hex color for badge: '#ef4444' (red), '#f59e0b' (yellow), '#10b981' (green), '#8b5cf6' (purple)
  description?: string;
  workingHours?: string; // e.g. "Pon-Pet 07:00-21:00, Sub 07:00-14:00"
  streets?: string[]; // Specific street names and segments covered by this zone
  operator?: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
}

export type ZoneDetectionMethod = 'polygon' | 'street_list';

export interface CityData {
  id: string;
  name: string; // e.g. "Beograd"
  country: string; // "SRB", "BIH", "MNE"
  operator?: string;
  lat: number;
  lng: number;
  radiusKm: number;
  detectionMethod?: ZoneDetectionMethod; // 'polygon' (Beograd, Novi Sad, etc.) or 'street_list' (Valjevo, etc.)
  zones: ParkingZone[];
  paymentSchedule?: string; // e.g. "Pon-Pet 07:00-21:00, Sub 07:00-14:00, Nedeljom besplatno"
  infoNotice?: string;
}

export interface ParkedLocation {
  lat: number;
  lng: number;
  address?: string;
  note?: string;
  photoUrl?: string;
  savedAt: number; // timestamp
  vehiclePlate: string;
  zoneName?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  leadMinutes: number; // e.g. 5, 10, or 15 minutes before expiration
  soundEnabled: boolean;
  vibrateEnabled: boolean;
}

export interface ParkingPaymentSession {
  id: string;
  vehiclePlate: string;
  vehicleNickname?: string;
  cityName: string;
  zoneName: string;
  smsNumber: string;
  priceRsd: number;
  startedAt: number;
  durationMinutes: number;
  expiresAt: number;
  status: 'active' | 'expired' | 'extended';
  alertSentAt?: number; // timestamp when the 5-10min warning was triggered
  expiredAlertSentAt?: number; // timestamp when expired alert was triggered
}

export interface CustomLocationOverride {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  name: string; // e.g. "Moja zgrada - Besplatno" or "Posao - Žuta zona"
  isOutsidePaidZone: boolean;
  zoneId?: string;
  cityName?: string;
  createdAt: number;
}

export interface ZoneDetectionResult {
  city: CityData;
  zone: ParkingZone | null;
  isOutsidePaidZone: boolean;
  reason: string;
  address?: string;
  streetName?: string;
  houseNumber?: string;
  suburbName?: string;
  streetMatched?: string;
  detectionMethod?: ZoneDetectionMethod;
  accuracyMeters?: number;
  customOverride?: CustomLocationOverride;
  isBorderZone?: boolean;
  alternativeZone?: ParkingZone | null;
  borderExplanation?: string;
}
