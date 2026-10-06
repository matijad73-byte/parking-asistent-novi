import { CityData, ParkingZone } from '../types';

export interface ParkingTimeStatus {
  isFreeNow: boolean;
  isPaymentActive: boolean;
  title: string;
  message: string;
  reason: 'sunday_free' | 'after_hours' | 'before_hours' | 'saturday_after_hours' | 'free_zone' | 'active';
  scheduleText: string;
  nextPaymentStart?: string;
  currentLocalTime?: string;
}

/**
 * Accurately extracts the current local time in the official timezone of the city
 * (Europe/Belgrade for Serbian cities, Europe/Sarajevo for BiH, Europe/Podgorica for Montenegro).
 * This ensures operating hours are 100% accurate regardless of the user device's local timezone.
 */
export function getLocalCityTime(
  cityId: string,
  customDate?: Date
): {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  currentHour: number;
  currentMinute: number;
  currentTotalMinutes: number;
  formattedTime: string;
} {
  const base = customDate || new Date();
  // Target official timezone
  const timeZone =
    cityId === 'sarajevo' || cityId === 'banja-luka'
      ? 'Europe/Sarajevo'
      : cityId === 'podgorica'
      ? 'Europe/Podgorica'
      : 'Europe/Belgrade';

  try {
    const dtf = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = dtf.formatToParts(base);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '0';
    const weekdayStr = getPart('weekday').toLowerCase();
    const hour = parseInt(getPart('hour'), 10);
    const minute = parseInt(getPart('minute'), 10);

    let dayOfWeek = base.getDay();
    if (weekdayStr.startsWith('sun')) dayOfWeek = 0;
    else if (weekdayStr.startsWith('mon')) dayOfWeek = 1;
    else if (weekdayStr.startsWith('tue')) dayOfWeek = 2;
    else if (weekdayStr.startsWith('wed')) dayOfWeek = 3;
    else if (weekdayStr.startsWith('thu')) dayOfWeek = 4;
    else if (weekdayStr.startsWith('fri')) dayOfWeek = 5;
    else if (weekdayStr.startsWith('sat')) dayOfWeek = 6;

    return {
      dayOfWeek,
      currentHour: hour,
      currentMinute: minute,
      currentTotalMinutes: hour * 60 + minute,
      formattedTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    };
  } catch {
    const dayOfWeek = base.getDay();
    const currentHour = base.getHours();
    const currentMinute = base.getMinutes();
    return {
      dayOfWeek,
      currentHour,
      currentMinute,
      currentTotalMinutes: currentHour * 60 + currentMinute,
      formattedTime: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
    };
  }
}

/**
 * Helper to dynamically parse hours from schedule text like "Pon-Pet: 07:00 - 21:00, Sub: 07:00 - 14:00"
 */
function parseScheduleHours(scheduleText: string): {
  weekdayStartMinutes?: number;
  weekdayEndMinutes?: number;
  satStartMinutes?: number;
  satEndMinutes?: number;
} {
  const result: {
    weekdayStartMinutes?: number;
    weekdayEndMinutes?: number;
    satStartMinutes?: number;
    satEndMinutes?: number;
  } = {};

  try {
    // Look for weekday patterns: e.g. "Pon-Pet: 07:00 - 21:00" or "07:00 - 21:00"
    const weekdayMatch =
      scheduleText.match(/Pon(?:edeljak)?[\s-]*(?:do\s+)?Pet(?:ak)?[:\s]+(\d{1,2}):(\d{2})[\s\-–]+(\d{1,2}):(\d{2})/i) ||
      scheduleText.match(/Pon(?:edeljak)?[\s-]*(?:do\s+)?Sub(?:ota)?[:\s]+(\d{1,2}):(\d{2})[\s\-–]+(\d{1,2}):(\d{2})/i);
    if (weekdayMatch) {
      result.weekdayStartMinutes = parseInt(weekdayMatch[1], 10) * 60 + parseInt(weekdayMatch[2], 10);
      result.weekdayEndMinutes = parseInt(weekdayMatch[3], 10) * 60 + parseInt(weekdayMatch[4], 10);
    }

    // Look for Saturday patterns: e.g. "Sub: 07:00 - 14:00" or "Subota: 08:00 - 14:00"
    const satMatch = scheduleText.match(/Sub(?:ota)?[:\s]+(\d{1,2}):(\d{2})[\s\-–]+(\d{1,2}):(\d{2})/i);
    if (satMatch) {
      result.satStartMinutes = parseInt(satMatch[1], 10) * 60 + parseInt(satMatch[2], 10);
      result.satEndMinutes = parseInt(satMatch[3], 10) * 60 + parseInt(satMatch[4], 10);
    }
  } catch {}

  return result;
}

/**
 * Evaluates whether parking in the given city & zone is currently chargeable or FREE
 * based on current local date and time in the city's official timezone.
 */
export function checkParkingPaymentStatus(
  city: CityData,
  zone?: ParkingZone,
  customDate?: Date
): ParkingTimeStatus {
  const localTime = getLocalCityTime(city.id, customDate);
  const { dayOfWeek, currentTotalMinutes, formattedTime } = localTime;

  // Daily tickets (Dnevna karta / 24h tickets) are ALWAYS active and can be paid at any time
  if (zone && (zone.durationMinutes >= 1440 || zone.id.includes('dnevna') || zone.name.toLowerCase().includes('dnevna'))) {
    return {
      isFreeNow: false,
      isPaymentActive: true,
      title: 'Dnevna karta (24h)',
      message: `Dnevna karta se može uplatiti u bilo koje doba i važi 24 časa od momenta uplate. Trenutno vreme: ${formattedTime}h.`,
      reason: 'active',
      scheduleText: 'Ceo dan (24h od uplate)',
      currentLocalTime: formattedTime,
    };
  }

  const scheduleText =
    zone?.workingHours ||
    city.paymentSchedule ||
    city.infoNotice ||
    'Pon-Pet: 07:00 - 21:00   Sub: 07:00 - 14:00   Nedelja: Besplatno';

  const parsed = parseScheduleHours(scheduleText);

  // 1. SUNDAY: Parking is free in all standard cities unless specifically 24/7
  if (dayOfWeek === 0) {
    const isSpecial247 = scheduleText.toLowerCase().includes('24h') && scheduleText.toLowerCase().includes('nedelja');
    if (!isSpecial247) {
      return {
        isFreeNow: true,
        isPaymentActive: false,
        title: 'Parking je danas besplatan (Nedelja)',
        message: `Nedeljom se parkiranje u ${zone?.name ? `${zone.name}, ` : ''}${city.name} ne naplaćuje. Nema potrebe za slanjem SMS poruke.`,
        reason: 'sunday_free',
        scheduleText,
        nextPaymentStart: 'Ponedeljak u 07:00h',
        currentLocalTime: formattedTime,
      };
    }
  }

  // 2. SATURDAY
  if (dayOfWeek === 6) {
    // Check if Saturday is explicitly marked as completely free
    const isExplicitSaturdayFree =
      scheduleText.toLowerCase().includes('subota i nedelja besplatno') ||
      scheduleText.toLowerCase().includes('sub: besplatno') ||
      scheduleText.toLowerCase().includes('vikend besplatno');

    if (isExplicitSaturdayFree) {
      return {
        isFreeNow: true,
        isPaymentActive: false,
        title: 'Parking je danas besplatan (Subota)',
        message: `Subotom se parkiranje u ${zone?.name || 'ovoj zoni'} ne naplaćuje.`,
        reason: 'free_zone',
        scheduleText,
        nextPaymentStart: 'Ponedeljak u 07:00h',
        currentLocalTime: formattedTime,
      };
    }

    let satStartMinutes = parsed.satStartMinutes ?? 7 * 60; // 07:00
    let satEndMinutes = parsed.satEndMinutes ?? 14 * 60;  // 14:00

    if (zone?.id === 'bg-zone-opsta' || zone?.smsNumber === '9119' || zone?.smsNumber === '9118') {
      satStartMinutes = 8 * 60; // 08:00 for Blue zone
    }

    if (city.id === 'banja-luka') {
      satEndMinutes = 16 * 60;
    } else if (city.id === 'sarajevo') {
      satEndMinutes = 20 * 60;
    } else if (city.id === 'podgorica') {
      satEndMinutes = 24 * 60;
    }

    if (currentTotalMinutes < satStartMinutes) {
      const startHourStr = `${Math.floor(satStartMinutes / 60).toString().padStart(2, '0')}:${(satStartMinutes % 60).toString().padStart(2, '0')}`;
      return {
        isFreeNow: true,
        isPaymentActive: false,
        title: 'Vreme naplate subotom još nije počelo',
        message: `Naplata parkinga subotom počinje u ${startHourStr}h (trenutno je ${formattedTime}h).`,
        reason: 'before_hours',
        scheduleText,
        nextPaymentStart: `Danas u ${startHourStr}h`,
        currentLocalTime: formattedTime,
      };
    }

    if (currentTotalMinutes >= satEndMinutes) {
      const endHourStr = `${Math.floor(satEndMinutes / 60).toString().padStart(2, '0')}:${(satEndMinutes % 60).toString().padStart(2, '0')}`;
      return {
        isFreeNow: true,
        isPaymentActive: false,
        title: 'Vreme naplate subotom je isteklo',
        message: `Naplata parkinga subotom traje do ${endHourStr}h (trenutno je ${formattedTime}h). Parkiranje je besplatno do ponedeljka ujutru.`,
        reason: 'saturday_after_hours',
        scheduleText,
        nextPaymentStart: 'Ponedeljak u 07:00h',
        currentLocalTime: formattedTime,
      };
    }

    // Currently within Saturday payment window
    return {
      isFreeNow: false,
      isPaymentActive: true,
      title: 'Naplata je u toku (Subota)',
      message: `Naplata parkinga subotom traje do ${Math.floor(satEndMinutes / 60).toString().padStart(2, '0')}:${(satEndMinutes % 60).toString().padStart(2, '0')}h (trenutno je ${formattedTime}h).`,
      reason: 'active',
      scheduleText,
      currentLocalTime: formattedTime,
    };
  }

  // 3. WEEKDAYS (Monday - Friday)
  let weekdayStartMinutes = parsed.weekdayStartMinutes ?? 7 * 60; // default 07:00
  let weekdayEndMinutes = parsed.weekdayEndMinutes ?? 21 * 60;     // default 21:00

  if (zone?.id === 'bg-zone-opsta' || zone?.smsNumber === '9119' || zone?.smsNumber === '9118') {
    weekdayStartMinutes = 8 * 60; // 08:00 for Belgrade Blue Zone
    weekdayEndMinutes = 21 * 60;   // Plava zona u Beogradu traje do 21:00
  } else if (city.id === 'sarajevo') {
    weekdayEndMinutes = 20 * 60;
  } else if (city.id === 'podgorica') {
    weekdayEndMinutes = 24 * 60;
  }

  if (currentTotalMinutes < weekdayStartMinutes) {
    const startHourStr = `${Math.floor(weekdayStartMinutes / 60).toString().padStart(2, '0')}:${(weekdayStartMinutes % 60).toString().padStart(2, '0')}`;
    return {
      isFreeNow: true,
      isPaymentActive: false,
      title: 'Vreme naplate još nije počelo',
      message: `Naplata parkinga radnim danima počinje u ${startHourStr}h (trenutno je ${formattedTime}h).`,
      reason: 'before_hours',
      scheduleText,
      nextPaymentStart: `Danas u ${startHourStr}h`,
      currentLocalTime: formattedTime,
    };
  }

  if (currentTotalMinutes >= weekdayEndMinutes) {
    const endHourStr = `${Math.floor(weekdayEndMinutes / 60).toString().padStart(2, '0')}:${(weekdayEndMinutes % 60).toString().padStart(2, '0')}`;
    const nextDayName = dayOfWeek === 5 ? 'Subotu u 07:00h' : 'Sutra u 07:00h';
    return {
      isFreeNow: true,
      isPaymentActive: false,
      title: 'Vreme naplate parkinga je isteklo',
      message: `Naplata parkinga radnim danima traje do ${endHourStr}h (trenutno je ${formattedTime}h).`,
      reason: 'after_hours',
      scheduleText,
      nextPaymentStart: nextDayName,
      currentLocalTime: formattedTime,
    };
  }

  // Currently active
  return {
    isFreeNow: false,
    isPaymentActive: true,
    title: 'Naplata parkinga je u toku',
    message: `Plaćanje važi do ${Math.floor(weekdayEndMinutes / 60).toString().padStart(2, '0')}:${(weekdayEndMinutes % 60).toString().padStart(2, '0')}h (lokalno vreme: ${formattedTime}h).`,
    reason: 'active',
    scheduleText,
    currentLocalTime: formattedTime,
  };
}
